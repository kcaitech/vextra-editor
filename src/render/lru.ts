class LRUCache<K, V> {
    private cache: Map<K, V>;
    private capacity: number;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, V>();
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // 如果存在，则先删除旧的键值对再重新添加到末尾
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    put(key: K, value: V): void {
        if (this.cache.has(key)) {
            // 如果已经存在，则先移除旧的键值对
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // 如果缓存已满，则移除最久未使用的项
            const firstKey = this.cache.keys().next().value!;  // 获取第一个插入的元素
            this.cache.delete(firstKey);
        }
        // 添加新的键值对
        this.cache.set(key, value);
    }

    delete(key: K): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}