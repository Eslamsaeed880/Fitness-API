import connectDB from "../../config/mongodb.js";
import redis from "../cache/redis.js";
import Routine from "../../modules/routines/models/routine.model.js";
import LikedRoutine from "../../modules/routines/models/likedRoutines.model.js";

const DIRTY_ROUTINES_KEY = 'dirtyRoutines';
const LOCK_KEY = 'locks:sync-routine-likes';
const LOCK_TTL_SECONDS = 55;
// Run one reconciliation pass every minute.
const SYNC_INTERVAL_MS = 60_000;

await connectDB();

const runSyncCycle = async () => {
	console.log(' --- Sync Worker: Processing sync cycle');

	// Redis lock prevents overlapping runs when a previous cycle is still active.
	const lockValue = `${process.pid}-${Date.now()}`;
	const lockAcquired = await redis.set(LOCK_KEY, lockValue, {
		NX: true,
		EX: LOCK_TTL_SECONDS,
	});

	if (lockAcquired !== 'OK') {
		console.log(' --- Sync Worker: Skip, another sync run is active');
		return;
	}

	try {
		const routineIds = await redis.sMembers(DIRTY_ROUTINES_KEY);

		if (!routineIds || routineIds.length === 0) {
			console.log(' --- Sync Worker: No dirty routines to process');
			return;
		}

		let updatedCount = 0;

		for (const routineId of routineIds) {
			try {
				// Treat set members as source of truth and derive the persisted like count.
				const redisLikerIds = await redis.sMembers(`routine:${routineId}:likes`);
				const likeCount = redisLikerIds.length;

				await redis.set(`routine:${routineId}:likeCount`, String(likeCount));
				await Routine.updateOne({ _id: routineId }, { $set: { likes: likeCount } });

				const existingLikes = await LikedRoutine.find({ routineId }).select('userId');
				const existingUserIdSet = new Set(existingLikes.map((doc) => doc.userId.toString()));
				const redisUserIdSet = new Set(redisLikerIds);

				// Diff Redis and Mongo relation sets, then apply inserts/removals.
				const toInsert = [];
				for (const userId of redisUserIdSet) {
					if (!existingUserIdSet.has(userId)) {
						toInsert.push({ userId, routineId });
					}
				}

				const toDelete = [];
				for (const userId of existingUserIdSet) {
					if (!redisUserIdSet.has(userId)) {
						toDelete.push(userId);
					}
				}

				if (toInsert.length > 0) {
					await LikedRoutine.bulkWrite(
						toInsert.map(({ userId, routineId: insertRoutineId }) => ({
							updateOne: {
								filter: { userId, routineId: insertRoutineId },
								update: { $setOnInsert: { userId, routineId: insertRoutineId } },
								upsert: true,
							},
						})),
						{ ordered: false }
					);
				}

				if (toDelete.length > 0) {
					await LikedRoutine.deleteMany({
						routineId,
						userId: { $in: toDelete },
					});
				}

				await redis.sRem(DIRTY_ROUTINES_KEY, routineId);
				updatedCount += 1;

				console.log(` --- Sync Worker: Synced routine ${routineId} with ${likeCount} likes (inserted ${toInsert.length}, removed ${toDelete.length})`);
			} catch (err) {
				console.error(` --- Sync Worker: Failed routine ${routineId}, will retry on next cycle`, err);
			}
		}

		console.log(` --- Sync Worker: Flush done, updated ${updatedCount} routine(s)`);
	} finally {
		const currentLockValue = await redis.get(LOCK_KEY);
		if (currentLockValue === lockValue) {
			await redis.del(LOCK_KEY);
		}
	}
};

await runSyncCycle();
setInterval(() => {
	// Keep failures isolated to a single interval so next ticks can continue.
	runSyncCycle().catch((err) => {
		console.error(' --- Sync Worker: Interval cycle failed', err);
	});
}, SYNC_INTERVAL_MS);

console.log(' --- Sync Worker: Interval worker started (every 60 seconds)');