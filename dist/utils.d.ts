/**
 * Create element
 * @param {K} tag - Element tag
 * @param {Object} options - Element options
 * @param {string} options.className - Element class name
 * @param {string} options.insertMethod - Insert method, default is append
 * @param {Element} options.parent - Parent element
 * @returns {HTMLElementTagNameMap[K]} - Element
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
    className?: string;
    insertMethod?: 'prepend' | 'append' | 'before' | 'after';
    parent?: Element;
    children?: HTMLElement[];
}): HTMLElementTagNameMap[K];
/**
 * Set styles to elements
 * @param {HTMLElement | HTMLElement[]} el - Element
 * @param {Partial<CSSStyleDeclaration>} styles - Styles
 */
export declare function setStyles(el: HTMLElement | HTMLElement[], styles: Partial<CSSStyleDeclaration>): void;
