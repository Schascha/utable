import type { IUTable, IUTableCache } from './types';

const cache = new WeakMap<IUTable, IUTableCache>();

/**
 * Set cache
 * @param instance - UTable instance
 * @param props - Cache properties
 */
export function setCache(instance: IUTable, props: object) {
	cache.set(instance, props);
}

/**
 * Get cache
 * @param instance - UTable instance
 * @returns Cache properties
 */
export function getCache(instance: IUTable): IUTableCache {
	return cache.get(instance) ?? {};
}
