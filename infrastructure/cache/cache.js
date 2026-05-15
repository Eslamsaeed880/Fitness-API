import APIError from "../../utils/APIError.js";
import client from "./redis.js";

function isCacheReady() {
    return client.isReady;
}

export async function getFromCache(key) {
    try {
        const cachedData = await client.get(key);
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            console.log(`Cache hit for key: ${key}`);
            return parsedData;
        }


        console.log(`Cache miss for key: ${key}`);
        return null;

    } catch (error) {
        console.error('Error fetching from cache:', error);
        throw new APIError(500, 'Error fetching from cache');
    }
}

export async function setInCache(key, value, ttl = 3600) {
    try {
        const stringValue = JSON.stringify(value);
        await client.setEx(key, ttl, stringValue);
        console.log(`Data cached for key: ${key}`);
    } catch (error) {
        console.error('Error setting cache:', error);
        throw new APIError(500, 'Error setting cache');
    }
}

export async function invalidateCache(key) {
    try {
        const keys = await client.keys(key);
        if (keys.length === 0) {
            console.log(`No cache keys found matching: ${key}`);
            return;
        }

        await Promise.all(keys.map(k => client.del(k)));
        console.log(`Cache invalidated for keys: ${keys.join(', ')}`);
    } catch (error) {
        console.error('Error invalidating cache:', error);
        throw new APIError(500, 'Error invalidating cache');
    }
}

export async function incrementCache(key, incrementBy = 1) {
    try {
        const newValue = await client.incrBy(key, incrementBy);
        console.log(`Cache incremented for key: ${key}, new value: ${newValue}`);
        return newValue;
    } catch (error) {
        console.error('Error incrementing cache:', error);
        throw new APIError(500, 'Error incrementing cache');
    }
}

export async function decrementCache(key, decrementBy = 1) {
    try {
        const newValue = await client.decrBy(key, decrementBy);
        console.log(`Cache decremented for key: ${key}, new value: ${newValue}`);
        return newValue;
    } catch (error) {
        console.error('Error decrementing cache:', error);
        throw new APIError(500, 'Error decrementing cache');
    }
}

export default client;