import { getCache, setCache } from './cache';
import { UTableDefaults } from './defaults';
import type { IUTable, IUTableOptions } from './types';
import { createElement, setStyles, scrollTo } from './utils';

export class UTable implements IUTable {
	isScrollable: boolean = false;
	observer?: IntersectionObserver;
	options: IUTableOptions;
	shadowTable?: HTMLTableElement;
	table: HTMLTableElement;

	constructor(
		table: HTMLTableElement | string,
		options?: Partial<IUTableOptions>
	) {
		this.table = (
			typeof table === 'string' ? document.querySelector(table) : table
		) as HTMLTableElement;
		this.options = { ...UTableDefaults, ...options };

		// Check if table exists
		if (!this.table || !(this.table instanceof HTMLTableElement)) {
			throw new Error('Element not found');
		}

		setCache(this, {});
		this._bindEvents();
		this.render();
	}

	get el(): HTMLDivElement {
		const _ = getCache(this);
		if (!_.el) {
			_.el = createElement('div', {
				className: this.options.classWrapper,
				insertMethod: 'before',
				parent: this.table,
				children: [this.table],
			});
		}
		return _.el;
	}

	get buttonLeft(): HTMLButtonElement {
		const _ = getCache(this);
		if (!_.buttonLeft) {
			_.buttonLeft = this._createButton(
				this.options.classButtonLeft,
				this.options.textButtonLeft,
				this.options.titleButtonLeft,
				this._onClickButtonLeft
			);
		}
		return _.buttonLeft;
	}

	get buttonRight(): HTMLButtonElement {
		const _ = getCache(this);
		if (!_.buttonRight) {
			_.buttonRight = this._createButton(
				this.options.classButtonRight,
				this.options.textButtonRight,
				this.options.titleButtonRight,
				this._onClickButtonRight
			);
		}
		return _.buttonRight;
	}

	get scrollerHead(): HTMLDivElement | undefined {
		const _ = getCache(this);
		if (!_.scrollerHead && this.tableHead) {
			_.scrollerHead = createElement('div', {
				className: this.options.classScroller,
				children: [this.tableHead],
			});
		}
		return _.scrollerHead;
	}

	get scrollerBody(): HTMLDivElement {
		const _ = getCache(this);
		if (!_.scrollerBody) {
			const { classScroller, onScrollend } = this.options;
			const el = createElement('div', {
				className: classScroller,
				children: [this.tableBody],
			});
			el.addEventListener('scroll', this._onScroll);
			el.setAttribute('tabindex', '0');
			onScrollend && el.addEventListener('scrollend', this._onScrollend);
			_.scrollerBody = el;
		}
		return _.scrollerBody;
	}

	get overlayLeft(): HTMLDivElement[] {
		const _ = getCache(this);
		_.overlayLeft =
			_.overlayLeft ?? this._createOverlay(this.options.classOverlayLeft);
		return _.overlayLeft;
	}

	get overlayRight(): HTMLDivElement[] {
		const _ = getCache(this);
		_.overlayRight =
			_.overlayRight ?? this._createOverlay(this.options.classOverlayRight);
		return _.overlayRight;
	}

	get tableBody(): HTMLTableElement {
		const _ = getCache(this);
		_.tableBody = _.tableBody ?? this.table;
		return _.tableBody;
	}

	get tableBodyHeight(): number {
		return this.tableBody?.offsetHeight ?? 0;
	}

	get tableHead(): HTMLTableElement | null {
		const _ = getCache(this);
		if (typeof _.tableHead === 'undefined') {
			const thead = this.el?.querySelector('thead');
			_.tableHead = thead
				? createElement('table', { children: [thead] })
				: null;
		}
		return _.tableHead;
	}

	get tableMargin(): number {
		const { marginLeft, marginRight } = window.getComputedStyle(this.table);
		return (parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0);
	}

	get td(): HTMLTableCellElement[] {
		const { table } = this;
		return Array.from(table.querySelectorAll('table > tr > *, tbody > tr > *'));
	}

	get th(): HTMLTableCellElement[] {
		const { tableHead } = this;
		return tableHead ? Array.from(tableHead.querySelectorAll('tr > *')) : [];
	}

	get top(): HTMLDivElement {
		const _ = getCache(this);
		if (!_.top) {
			_.top = createElement('div', {
				className: this.options.classTop,
				parent: this.el,
				insertMethod: 'prepend',
			});
		}
		return _.top;
	}

	get trackBody(): HTMLDivElement {
		const _ = getCache(this);
		if (!_.trackBody) {
			_.trackBody = createElement('div', {
				className: `${this.options.classBody}`,
				children: [this.scrollerBody],
			});
		}
		return _.trackBody;
	}

	get trackHead(): HTMLDivElement | undefined {
		const _ = getCache(this);
		if (!_.trackHead && this.scrollerHead) {
			_.trackHead = createElement('div', {
				className: `${this.options.classHead}`,
				children: [this.scrollerHead],
			});
			this.el.appendChild(_.trackHead);
		}
		return _.trackHead;
	}

	destroy() {
		// Unbind events
		window.removeEventListener('resize', this._onResize);
		window.removeEventListener('orientationchange', this._onResize);
		this.scrollerBody?.removeEventListener('scroll', this._onScroll);
		this.scrollerBody?.removeEventListener('scrollend', this._onScrollend);
		this.buttonLeft?.removeEventListener('click', this._onClickButtonLeft);
		this.buttonRight?.removeEventListener('click', this._onClickButtonRight);
		this.observer?.disconnect();

		// Restore table
		this.th.forEach((el) => this._setWidth(el));
		this.td.forEach((el) => this._setWidth(el));
		this.tableHead?.firstChild && this.table.prepend(this.tableHead.firstChild);
		this.el?.parentNode?.replaceChild(this.table, this.el);
		this.top?.parentNode?.removeChild(this.top);

		// Empty cache
		setCache(this, {});
	}

	/**
	 * Render method
	 * This method should be called to initialize the table
	 * @returns {this} - Table instance
	 */
	render(): this {
		// Update options from data attribute
		const { options } = this.table.dataset;
		try {
			const json = options ? JSON.parse(options) : {};
			this.options = {
				...this.options,
				...json,
			};
		} catch {}

		// Create shadow table
		this._createShadowTable();

		// Append elements
		this._isSticky();
		this.el.appendChild(this.trackBody);

		// Resize event
		window.addEventListener('resize', this._onResize);
		window.addEventListener('orientationchange', this._onResize);

		return this.update();
	}

	/**
	 * Update method
	 * This method should be called when the table is updated
	 * Falls back to render method if no cache is found
	 * @returns {this} - Table instance
	 */
	update(): this {
		const _ = getCache(this);
		if (!Object.keys(_).length) {
			return this.render();
		}
		this._setEqualWidth();
		this._isScrollable();
		this.options.onUpdate?.();
		return this;
	}

	/**
	 * Bind events
	 * @private
	 */
	_bindEvents() {
		this._onResize = this._onResize.bind(this);
		this._onScroll = this._onScroll.bind(this);
		this._onScrollend = this._onScrollend.bind(this);
		this._onClickButtonLeft = this._onClickButtonLeft.bind(this);
		this._onClickButtonRight = this._onClickButtonRight.bind(this);
	}

	/**
	 * Create button
	 * @param {string} className - Button class name
	 * @param {string} text - Button text
	 * @param {string} title - Button title
	 * @param {() => void} event - Button click event
	 * @returns {HTMLButtonElement} - Button element
	 */
	_createButton(
		className: string,
		text: string,
		title: string,
		event: (e: Event) => void
	): HTMLButtonElement {
		const button = createElement('button', {
			className,
			parent: this.trackHead,
			insertMethod: 'prepend',
		});
		button.type = 'button';
		button.title = title;
		button.innerHTML = `<span>${text}</span>`;
		button.addEventListener('click', event);
		return button;
	}

	/**
	 * Create overlay
	 * @param {string} className - Overlay class name
	 * @private
	 * @returns {HTMLDivElement[]} - Overlay elements
	 */
	_createOverlay(className: string): HTMLDivElement[] {
		const { trackBody, trackHead } = this;
		const el = [createElement('div', { className, parent: trackBody })];
		trackHead &&
			el.push(createElement('div', { className, parent: trackHead }));
		return el;
	}

	/**
	 * Create shadow table
	 * This table is a copy of the original table and is used to calculate the width of the cells
	 * @private
	 */
	_createShadowTable() {
		this.shadowTable = this.table.cloneNode(true) as HTMLTableElement;
		setStyles(this.shadowTable, {
			visibility: 'hidden',
			position: 'absolute',
			zIndex: '-2147483640',
		});
	}

	/**
	 * Check if the table is scrollable and toggle the visibility of the buttons and overlays
	 * @private
	 */
	_isScrollable() {
		const { clientWidth, scrollLeft, scrollWidth } = this.scrollerBody;
		const isScrollLeft = scrollLeft > 0 && clientWidth < scrollWidth;
		const isScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
		this.isScrollable = isScrollLeft || isScrollRight;

		// Toggle visibility
		this._toggleOverlays(isScrollLeft, isScrollRight);
		this._toggleButtons(isScrollLeft, isScrollRight);

		// Sync scroll position
		if (this.scrollerHead) this.scrollerHead.scrollLeft = scrollLeft;
	}

	/**
	 * Sticky header
	 * @private
	 */
	_isSticky() {
		const { options, top, trackHead } = this;
		const { classSticky, sticky } = options;

		if (!sticky || !window.IntersectionObserver || !top || !trackHead) return;

		// Detect when headers gets sticky
		this.observer = new window.IntersectionObserver(
			([e]) =>
				trackHead?.classList.toggle(classSticky, e.intersectionRatio < 1),
			{ threshold: [1] }
		);

		// Observe top element
		this.observer?.observe(top);
	}

	/**
	 * Set equal width to cells
	 * @private
	 */
	_setEqualWidth() {
		if (!this.shadowTable) return;

		// Append shadow table and calculate table width
		this.el.prepend(this.shadowTable);
		const th = Array.from(
			this.shadowTable.querySelectorAll('thead > tr > *')
		) as HTMLTableCellElement[];
		const td = Array.from(
			this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *')
		) as HTMLTableCellElement[];
		setStyles(this.shadowTable, {
			tableLayout: 'auto',
			width: `${this.el.clientWidth - this.tableMargin}px`,
		});

		// Fixed width
		if (this.options.width === 'fixed') {
			// Get first row cells
			const cells = Array.from(
				(this.shadowTable.querySelector('tr')?.children ||
					[]) as HTMLTableCellElement[]
			);

			// Calculate column count
			const columnCount = cells.reduce((acc, el) => acc + (el.colSpan || 1), 0);

			// Set equal column width
			cells.forEach((el) =>
				setStyles(el, { width: `${(100 / columnCount) * (el.colSpan || 1)}%` })
			);

			// Get max cell width
			const maxCellWidth = Math.max(
				...[...th, ...td]
					.filter((el) => el.colSpan === 1)
					.map((el) => el.getBoundingClientRect().width)
			);

			// Update shadow table width depending on max cell width
			setStyles(this.shadowTable, { width: `${maxCellWidth * columnCount}px` });
		}

		// Get cell widths
		const thWidths = th.map((el) => el.getBoundingClientRect().width);
		const tdWidths = td.map((el) => el.getBoundingClientRect().width);

		// Remove shadow table
		this.el.removeChild(this.shadowTable);

		// Set cell widths
		this.th.forEach((el, index) => this._setWidth(el, thWidths[index]));
		this.td.forEach((el, index) => this._setWidth(el, tdWidths[index]));
	}

	/**
	 * Set width to elements
	 * @param {HTMLElement | HTMLElement[]} el - Element or elements
	 * @param {number | string} width - Width value
	 * @private
	 */
	_setWidth(el: HTMLElement | HTMLElement[], width?: number | string) {
		const _width = width ? `${width}${isNaN(+width) ? '' : 'px'}` : '';
		setStyles(el, { width: _width, minWidth: _width });
	}

	/**
	 * Toggle button visibility
	 * @param {HTMLButtonElement} el - Button element
	 * @param {boolean} isActive - Is active
	 * @private
	 */
	_toggleButton(el: HTMLButtonElement, isActive: boolean) {
		el.disabled = !isActive;
		setStyles(el, { display: this.isScrollable ? '' : 'none' });
	}

	/**
	 * Toggle buttons visibility
	 * @param {boolean} isScrollLeft - Is scroll left
	 * @param {boolean} isScrollRight - Is scroll right
	 * @private
	 */
	_toggleButtons(isScrollLeft: boolean, isScrollRight: boolean) {
		if (!this.options.buttons) return;
		this._toggleButton(this.buttonRight, isScrollRight);
		this._toggleButton(this.buttonLeft, isScrollLeft);
	}

	/**
	 * Toggle overlay visibility
	 * @param {HTMLDivElement} el - Overlay element
	 * @param {boolean} isActive - Is active
	 * @private
	 */
	_toggleOverlay(el: HTMLDivElement, isActive: boolean) {
		const isBody = el.parentElement === this.trackBody;
		setStyles(el, {
			opacity: isActive ? '1' : '0',
			height: isBody ? `${this.tableBodyHeight}px` : '', // Don't overlay scrollbar
		});
	}

	/**
	 * Toggle overlays visibility
	 * @param isScrollLeft - Is scroll left
	 * @param isScrollRight - Is scroll right
	 * @private
	 */
	_toggleOverlays(isScrollLeft: boolean, isScrollRight: boolean) {
		if (!this.options.overlays) return;
		this.overlayLeft.forEach((el) => this._toggleOverlay(el, isScrollLeft));
		this.overlayRight.forEach((el) => this._toggleOverlay(el, isScrollRight));
	}

	/**
	 * Button left click event
	 * @private
	 */
	_onClickButtonLeft(e: Event) {
		const { clientWidth, scrollLeft } = this.scrollerBody;
		scrollTo(this.scrollerBody, { left: scrollLeft - clientWidth * 0.75 });
		this._isScrollable();
		this.options.onClickButtonLeft?.(e);
	}

	/**
	 * Button right click event
	 * @private
	 */
	_onClickButtonRight(e: Event) {
		const { clientWidth, scrollLeft } = this.scrollerBody;
		scrollTo(this.scrollerBody, { left: scrollLeft + clientWidth * 0.75 });
		this._isScrollable();
		this.options.onClickButtonRight?.(e);
	}

	/**
	 * Resize event
	 * @private
	 */
	_onResize() {
		this.update();
	}

	/**
	 * Scroll event
	 * @private
	 */
	_onScroll(e: Event) {
		this._isScrollable();
		this.options.onScroll?.(e);
	}

	/**
	 * Scrollend event
	 * @private
	 */
	_onScrollend(e: Event) {
		this.options.onScrollend?.(e);
	}
}
