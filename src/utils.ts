/**
 * Create element
 * @param {K} tag
 * @param {Object} options - Element options
 * @param {string} options.className - Element class name
 * @param {string} options.insertMethod - Insert method, default is append
 * @param {Element} options.parent - Parent element
 * @private
 * @returns {HTMLElementTagNameMap[K]} - Element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	options: {
		className?: string;
		insertMethod?: 'prepend' | 'append' | 'before' | 'after';
		parent?: Element;
	} = {}
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	const { className, insertMethod, parent } = options;
	if (className) el.className = className;
	if (parent) parent[insertMethod || 'append'](el);
	return el;
}
