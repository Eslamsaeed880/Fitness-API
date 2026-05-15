import redisClient from '../../../infrastructure/cache/redis.js';

async function checkAndSet({ type = 'GENERIC', actorId, entityId, targetUserId }) {
    const key = `notif:dedup:${type}:${actorId}:${entityId}:${targetUserId}`;

    try {
        // NX ensures we only set if not exists. Return true if duplicate.
        const res = await redisClient.set(key, '1', { EX: 300, NX: true });
        if (res === null) return true; // key existed
        return false;
    } catch (err) {
        console.error('Dedup service redis error', err.message);
        // Fail open: if Redis unavailable, don't dedup
        return false;
    }
}

export default { checkAndSet };
