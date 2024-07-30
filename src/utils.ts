/**
 * Create element
 * @param {K} tag - Element tag
 * @param {Object} options - Element options
 * @param {string} options.className - Element class name
 * @param {string} options.insertMethod - Insert method, default is append
 * @param {Element} options.parent - Parent element
 * @returns {HTMLElementTagNameMap[K]} - Element
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	options: {
		className?: string;
		insertMethod?: 'prepend' | 'append' | 'before' | 'after';
		parent?: Element;
		children?: HTMLElement[];
	} = {}
): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	const { children, className, insertMethod, parent } = options;
	if (className) el.className = className;
	if (parent) parent[insertMethod || 'append'](el);
	if (children) children.forEach((child) => el.appendChild(child));
	return el;
}

/**
 * Set styles to elements
 * @param {HTMLElement | HTMLElement[]} el - Element
 * @param {Partial<CSSStyleDeclaration>} styles - Styles
 */
export function setStyles(
	el: HTMLElement | HTMLElement[],
	styles: Partial<CSSStyleDeclaration>
) {
	if (!Array.isArray(el)) el = [el];
	el.forEach((el) => Object.assign(el.style, styles));
}
