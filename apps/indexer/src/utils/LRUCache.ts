
export class LRUCache<T> {
    private cache = new Map<string, { data: T; expiry: number }>();
    private readonly maxSize: number;
    private readonly ttl: number;

    constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry || Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }

    set(key: string, data: T): void {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + this.ttl
        });
    }
}