import { logger } from "./logger";

export class LRUCache<T> {
    private cache = new Map<string, { data: T; expiry: number }>();
    private readonly maxSize: number;
    private readonly ttl: number;

    constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    get(key: string): T | null {
        logger.info(`[LRUCache] Cache get: ${key}`);
        const entry = this.cache.get(key);
        if (!entry || Date.now() > entry.expiry) {
            logger.info(`[LRUCache] Cache miss/expired: ${key}`);
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        logger.info(`[LRUCache] Cache hit: ${key}`);
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }

    set(key: string, data: T): void {
        logger.info(`[LRUCache] Cache set: ${key}`);
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            logger.info(`[LRUCache] Cache size limit reached, removing oldest entry: ${firstKey}`);
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + this.ttl
        });
    }
}