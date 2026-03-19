import APIError from "../../../utils/APIError.js";
import mongoose from "mongoose";
import redis from "../../../infrastructure/cache/redis.js";

export default class RoutineService {
    constructor(RoutineModel, routineExerciseModel, routineExerciseSetModel, exerciseService) {
        this.Routine = RoutineModel;
        this.RoutineExercise = routineExerciseModel;
        this.RoutineExerciseSet = routineExerciseSetModel;
        this.exerciseService = exerciseService;
    }

    async createRoutine(userId, routineData, exercisesData) {
        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            // Create routine
            const routine = await this.Routine.create([{
                userId,
                name: routineData.name,
                description: routineData.description,
                isPublic: routineData.isPublic
            }], { session });

            const routineId = routine[0]._id;

            // Pre-generate set IDs (IMPORTANT)
            const routineExerciseSetDocs = exercisesData.map((exerciseData) => {
                const _id = new mongoose.Types.ObjectId();

                return {
                    _id,
                    sets: Array.isArray(exerciseData.sets) ? exerciseData.sets : []
                };
            });

            // Build exercises using pre-generated IDs
            const routineExerciseDocs = exercisesData.map((exerciseData, index) => ({
                routineId,
                exerciseId: exerciseData.exerciseId,
                orderIndex: index, // safer than trusting client
                setsId: routineExerciseSetDocs[index]._id
            }));

            // Insert BOTH in parallel
            await Promise.all([
                this.RoutineExerciseSet.insertMany(routineExerciseSetDocs, { session }),
                this.RoutineExercise.insertMany(routineExerciseDocs, { session })
            ]);

            await session.commitTransaction();

            return {
                routineId,
                userId,
                name: routineData.name,
                description: routineData.description,
                isPublic: routineData.isPublic,
                exercises: exercisesData.map((ex, index) => ({
                    exerciseId: ex.exerciseId,
                    orderIndex: index,
                    setsId: routineExerciseSetDocs[index]._id,
                    sets: ex.sets
                }))
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getRoutineById(routineId, userId) {
        const [routine, exercises] = await Promise.all([
            this.Routine.findById(routineId),
            this.RoutineExercise.find({ routineId })
                .populate(
                    {
                        path: 'exerciseId',
                        select: 'name description primaryMuscle equipment media movementType`'
                    }
                )
                .select('-__v -createdAt -updatedAt')
                .sort({ orderIndex: 1 })
        ]);

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (!routine.isPublic && routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        const structuredRoutine = {
            _id: routine._id,
            userId: routine.userId,
            name: routine.name,
            description: routine.description,
            likes: +(await redis.get(`routine:${routineId}:likeCount`) || routine.likes || 0),
            exercises   
        };

        return structuredRoutine;
    }

    async updateRoutine(routineId, userId, routineData) {
        const routine = await this.Routine.findById(routineId);
        
        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        routine.name = routineData.name || routine.name;
        routine.description = routineData.description || routine.description;
        routine.isPublic = routineData.isPublic !== undefined ? routineData.isPublic : routine.isPublic;

        await routine.save();

        return routine;
    }

    async updateRoutineExercises(routineId, userId, exercisesData) {
        const routine = await this.Routine.findById(routineId);
        
        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        // For simplicity, delete existing exercises and sets, then re-create
        await Promise.all([
            this.RoutineExercise.deleteMany({ routineId }),
            this.RoutineExerciseSet.deleteMany({ routineExerciseId: { $in: exercisesData.map(ex => ex._id) } })
        ]);

        // Re-create exercises and sets
        const routineExerciseSetDocs = exercisesData.map((exerciseData) => {
            const _id = new mongoose.Types.ObjectId();

            return {
                _id,
                sets: Array.isArray(exerciseData.sets) ? exerciseData.sets : []
            };
        });

        const routineExerciseDocs = exercisesData.map((exerciseData, index) => ({
            routineId,
            exerciseId: exerciseData.exerciseId,
            orderIndex: index,
            setsId: routineExerciseSetDocs[index]._id
        }));

        await Promise.all([
            this.RoutineExerciseSet.insertMany(routineExerciseSetDocs),
            this.RoutineExercise.insertMany(routineExerciseDocs)
        ]);

        return await this.getRoutineById(routineId, userId);
    }

    async deleteRoutine(routineId, userId) {
        const routine = await this.Routine.findById(routineId);
        
        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        if (routine.userId.toString() !== userId.toString()) {
            throw new APIError(403, 'Access denied');
        }

        // Fetch exercises to get their IDs for deleting sets
        const exercises = await this.RoutineExercise.find({ routineId }).select('_id');
        const exerciseIds = exercises.map(ex => ex._id);

        await Promise.all([
            this.RoutineExercise.deleteMany({ routineId }),
            this.RoutineExerciseSet.deleteMany({ routineExerciseId: { $in: exerciseIds } }),
            routine.deleteOne()
        ]);

        return {};
    }

    async likeRoutine(routineId, userId) {
        const routine = await this.Routine.findById(routineId).select('_id likes');

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        const isNewLike = await redis.sAdd(`routine:${routineId}:likes`, userId.toString());

        const likes = await redis.sCard(`routine:${routineId}:likes`);
        const liker = await redis.sMembers(`routine:${routineId}:likes`);
        console.log(` --- Like Routine: Routine ${routineId} now has ${likes} likes in Redis (set: ${liker})`);
        if (isNewLike) {
            await redis.set(`routine:${routineId}:likeCount`, String(likes));

            await redis.sAdd('dirtyRoutines', routineId.toString());

            return {
                routineId,
                likeCount: likes,
                liked: true
            };
        } else {
            throw new APIError(400, 'You have already liked this routine');
        }
    }

    async unlikeRoutine(routineId, userId) {
        const routine = await this.Routine.findById(routineId).select('_id likes');

        if (!routine) {
            throw new APIError(404, 'Routine not found');
        }

        const wasMember = await redis.sRem(`routine:${routineId}:likes`, userId.toString());

        const likes = await redis.sCard(`routine:${routineId}:likes`);
        const liker = await redis.sMembers(`routine:${routineId}:likes`);
        console.log(` --- Unlike Routine: Routine ${routineId} now has ${likes} likes in Redis (set: ${liker})`);
        if (wasMember) {
            await redis.set(`routine:${routineId}:likeCount`, String(likes));

            await redis.sAdd('dirtyRoutines', routineId.toString());

            return {
                routineId,
                likeCount: likes,
                liked: false
            };
        } else {
            throw new APIError(400, 'You have not liked this routine');
        }
    }
}