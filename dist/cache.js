const cache = new WeakMap();
/**
 * Set cache
 * @param instance - UTable instance
 * @param props - Cache properties
 */
export function setCache(instance, props) {
    cache.set(instance, props);
}
/**
 * Get cache
 * @param instance - UTable instance
 * @returns Cache properties
 */
export function getCache(instance) {
    var _a;
    return (_a = cache.get(instance)) !== null && _a !== void 0 ? _a : {};
}
