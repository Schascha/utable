import { IUTable, IUTableOptions } from './types';
export declare class UTable implements IUTable {
    isScrollable: boolean;
    observer?: IntersectionObserver;
    options: IUTableOptions;
    shadowTable?: HTMLTableElement;
    table: HTMLTableElement;
    private _;
    constructor(table: HTMLTableElement | string, options?: Partial<IUTableOptions>);
    get el(): HTMLDivElement;
    get buttonLeft(): HTMLButtonElement;
    get buttonRight(): HTMLButtonElement;
    get scrollerHead(): HTMLDivElement | undefined;
    get scrollerBody(): HTMLDivElement;
    get overlayLeft(): HTMLDivElement[];
    get overlayRight(): HTMLDivElement[];
    get tableBody(): HTMLTableElement;
    get tableBodyHeight(): number;
    get tableHead(): HTMLTableElement | null;
    get top(): HTMLDivElement;
    get trackBody(): HTMLDivElement;
    get trackHead(): HTMLDivElement | undefined;
    destroy(): void;
    /**
     * Render method
     * This method should be called to initialize the table
     * @returns {this} - Table instance
     */
    render(): this;
    /**
     * Update method
     * This method should be called when the table is updated
     * @returns {this} - Table instance
     */
    update(): this;
    /**
     * Create button
     * @param {string} className - Button class name
     * @param {string} text - Button text
     * @param {string} title - Button title
     * @param {() => void} event - Button click event
     * @returns {HTMLButtonElement} - Button element
     */
    _createButton(className: string, text: string, title: string, event: () => void): HTMLButtonElement;
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
    _createElement<K extends keyof HTMLElementTagNameMap>(tag: K, options?: {
        className?: string;
        insertMethod?: 'prepend' | 'append' | 'before' | 'after';
        parent?: Element;
    }): HTMLElementTagNameMap[K];
    /**
     * Create overlay
     * @param {string} className - Overlay class name
     * @private
     * @returns {HTMLDivElement[]} - Overlay elements
     */
    _createOverlay(className: string): HTMLDivElement[];
    /**
     * Create shadow table
     * This table is a copy of the original table and is used to calculate the width of the cells
     * @private
     */
    _createShadowTable(): void;
    /**
     * Check if table is scrollable
     * @private
     */
    _isScrollable(): void;
    /**
     * Sticky header
     * @private
     */
    _isSticky(): void;
    /**
     * Scroll to position
     * @param {number} left - Scroll left position
     * @private
     */
    _scrollTo(left: number): void;
    /**
     * Set equal width to cells
     * @private
     */
    _setEqualWidth(): void;
    /**
     * Set width to elements
     * @param {HTMLElement | HTMLElement[]} el - Element or elements
     * @param {number | string} width - Width value
     * @private
     */
    _setWidth(el: HTMLElement | HTMLElement[], width?: number | string): void;
    /**
     * Toggle button visibility
     * @param {HTMLButtonElement} el - Button element
     * @param {boolean} isActive - Is active
     */
    _toggleButton(el: HTMLButtonElement, isActive: boolean): void;
    /**
     * Toggle overlay visibility
     * @param {HTMLElement} el - Overlay element
     * @param {boolean} isActive - Is active
     * @private
     */
    _toggleOverlay(el: HTMLElement, isActive: boolean): void;
    /**
     * Button left click event
     * @private
     */
    _onClickButtonLeft(): void;
    /**
     * Button right click event
     * @private
     */
    _onClickButtonRight(): void;
    /**
     * Resize event
     * @private
     */
    _onResize(): void;
    /**
     * Scroll event
     * @private
     */
    _onScroll(): void;
}
