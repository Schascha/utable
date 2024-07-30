import { UTableDefaults } from './defaults';
import { IUTable, IUTableOptions } from './types';
import { createElement } from './utils';

export class UTable implements IUTable {
	isScrollable: boolean;
	observer?: IntersectionObserver;
	options: IUTableOptions;
	shadowTable?: HTMLTableElement;
	table: HTMLTableElement;

	private _: {
		buttonLeft?: HTMLButtonElement;
		buttonRight?: HTMLButtonElement;
		el?: HTMLDivElement;
		overlayLeft?: HTMLDivElement[];
		overlayRight?: HTMLDivElement[];
		scrollerBody?: HTMLDivElement;
		scrollerHead?: HTMLDivElement;
		tableBody?: HTMLTableElement;
		tableHead?: HTMLTableElement | null;
		top?: HTMLDivElement;
		trackBody?: HTMLDivElement;
		trackHead?: HTMLDivElement;
	};

	constructor(
		table: HTMLTableElement | string,
		options?: Partial<IUTableOptions>
	) {
		this.table = (
			typeof table === 'string' ? document.querySelector(table) : table
		) as HTMLTableElement;
		this.options = { ...UTableDefaults, ...options };
		this._ = {};
		this.isScrollable = false;

		// Check if table exists
		if (!this.table || !(this.table instanceof HTMLTableElement)) {
			throw new Error('Element not found');
		}

		// Bind events
		this._onResize = this._onResize.bind(this);
		this._onScroll = this._onScroll.bind(this);
		this._onScrollend = this._onScrollend.bind(this);
		this._onClickButtonLeft = this._onClickButtonLeft.bind(this);
		this._onClickButtonRight = this._onClickButtonRight.bind(this);

		this.render();
	}

	get el(): HTMLDivElement {
		if (!this._.el) {
			this._.el = createElement('div', {
				className: this.options.classWrapper,
				insertMethod: 'before',
				parent: this.table,
			});
			this._.el.appendChild(this.table);
		}
		return this._.el;
	}

	get buttonLeft(): HTMLButtonElement {
		if (!this._.buttonLeft) {
			const { classButtonLeft, textButtonLeft, titleButtonLeft } = this.options;
			this._.buttonLeft = this._createButton(
				classButtonLeft,
				textButtonLeft,
				titleButtonLeft,
				this._onClickButtonLeft
			);
		}
		return this._.buttonLeft;
	}

	get buttonRight(): HTMLButtonElement {
		if (!this._.buttonRight) {
			const { classButtonRight, textButtonRight, titleButtonRight } =
				this.options;
			this._.buttonRight = this._createButton(
				classButtonRight,
				textButtonRight,
				titleButtonRight,
				this._onClickButtonRight
			);
		}
		return this._.buttonRight;
	}

	get scrollerHead(): HTMLDivElement | undefined {
		if (!this._.scrollerHead && this.tableHead) {
			this._.scrollerHead = createElement('div', {
				className: this.options.classScroller,
			});
			this._.scrollerHead.appendChild(this.tableHead);
		}
		return this._.scrollerHead;
	}

	get scrollerBody(): HTMLDivElement {
		if (!this._.scrollerBody) {
			const { classScroller, onScrollend } = this.options;
			const el = createElement('div', { className: classScroller });
			el.appendChild(this.tableBody);
			el.addEventListener('scroll', this._onScroll);
			onScrollend && el.addEventListener('scrollend', this._onScrollend);
			el.setAttribute('tabindex', '0');
			this._.scrollerBody = el;
		}
		return this._.scrollerBody;
	}

	get overlayLeft(): HTMLDivElement[] {
		this._.overlayLeft =
			this._.overlayLeft || this._createOverlay(this.options.classOverlayLeft);
		return this._.overlayLeft;
	}

	get overlayRight(): HTMLDivElement[] {
		this._.overlayRight =
			this._.overlayRight ||
			this._createOverlay(this.options.classOverlayRight);
		return this._.overlayRight;
	}

	get tableBody(): HTMLTableElement {
		this._.tableBody = this._.tableBody || this.table;
		return this._.tableBody;
	}

	get tableBodyHeight(): number {
		return this.tableBody?.offsetHeight || 0;
	}

	get tableHead(): HTMLTableElement | null {
		if (typeof this._.tableHead === 'undefined') {
			const thead = this.el?.querySelector('thead');
			if (thead) {
				this._.tableHead = createElement('table');
				this._.tableHead.appendChild(thead);
			} else {
				this._.tableHead = thead;
			}
		}
		return this._.tableHead;
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
		if (!this._.top) {
			this._.top = createElement('div', {
				className: this.options.classTop,
				parent: this.el,
				insertMethod: 'prepend',
			});
		}
		return this._.top;
	}

	get trackBody(): HTMLDivElement {
		if (!this._.trackBody) {
			this._.trackBody = createElement('div', {
				className: `${this.options.classTrack} tbody`,
			});
			this._.trackBody.appendChild(this.scrollerBody);
		}
		return this._.trackBody;
	}

	get trackHead(): HTMLDivElement | undefined {
		if (!this._.trackHead && this.scrollerHead) {
			this._.trackHead = createElement('div', {
				className: `${this.options.classTrack} thead`,
			});
			this._.trackHead.appendChild(this.scrollerHead);
			this.el.appendChild(this._.trackHead);
		}
		return this._.trackHead;
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

		// Remove private properties
		this._ = {};
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
	 * @returns {this} - Table instance
	 */
	update(): this {
		// Fall back to render method
		if (!Object.keys(this._).length) {
			return this.render();
		}
		const { onUpdate } = this.options;
		this._setEqualWidth();
		this._isScrollable();
		typeof onUpdate === 'function' && onUpdate();
		return this;
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
		this.shadowTable.style.visibility = 'hidden';
		this.shadowTable.style.position = 'absolute';
		this.shadowTable.style.zIndex = '-2147483640';
	}

	/**
	 * Check if table is scrollable
	 * @private
	 */
	_isScrollable() {
		const { clientWidth, scrollLeft, scrollWidth } = this.scrollerBody;
		const isScrollLeft = scrollLeft > 0 && clientWidth < scrollWidth;
		const isScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
		this.isScrollable = isScrollLeft || isScrollRight;

		// Toggle overlays
		if (this.options.overlays) {
			this.overlayLeft.forEach((el) => this._toggleOverlay(el, isScrollLeft));
			this.overlayRight.forEach((el) => this._toggleOverlay(el, isScrollRight));
		}

		// Toggle buttons
		if (this.options.buttons) {
			this._toggleButton(this.buttonRight, isScrollRight);
			this._toggleButton(this.buttonLeft, isScrollLeft);
		}

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
		this.observer.observe(top);
	}

	/**
	 * Scroll to position
	 * @param {number} left - Scroll left position
	 * @private
	 */
	_scrollTo(left: number) {
		const { scrollerBody } = this;
		if ('scrollBehavior' in document.documentElement.style) {
			scrollerBody.scrollTo({
				behavior: 'smooth',
				left,
			});
		} else {
			scrollerBody.scrollLeft = left;
		}
	}

	/**
	 * Set equal width to cells
	 * @private
	 */
	_setEqualWidth() {
		if (!this.shadowTable) return;

		// Append shadow table and calculate table width
		this.el.prepend(this.shadowTable);
		const { marginLeft, marginRight } = window.getComputedStyle(this.table);
		const offset =
			(parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0); // Remove table margin from width
		const _th = Array.from(
			this.shadowTable.querySelectorAll('thead > tr > *')
		) as HTMLTableCellElement[];
		const _td = Array.from(
			this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *')
		) as HTMLTableCellElement[];
		this.shadowTable.style.tableLayout = 'auto';
		this.shadowTable.style.width = `${this.el.clientWidth - offset}px`;

		// Fixed width
		if (this.options.width === 'fixed') {
			// Get first row and calculate column count
			const tr = Array.from(
				(this.shadowTable.querySelector('tr')?.children ||
					[]) as HTMLTableCellElement[]
			);
			const columnCount = tr.reduce((acc, el) => acc + (el.colSpan || 1), 0);
			// Set equal column width
			tr.forEach(
				(el) => (el.style.width = `${(100 / columnCount) * (el.colSpan || 1)}%`)
			);
			// Get max cell width
			const max = [..._th, ..._td]
				.filter((el) => el.colSpan === 1)
				.reduce((acc, el) => {
					const width = el.getBoundingClientRect().width;
					return width > acc ? width : acc;
				}, 0);
			// Update shadow table width depending on max cell width
			this.shadowTable.style.width = `${max * columnCount}px`;
		}

		// Get cell widths
		const _thWidths = _th.map((el) => el.getBoundingClientRect().width);
		const _tdWidths = _td.map((el) => el.getBoundingClientRect().width);

		// Remove shadow table
		this.el.removeChild(this.shadowTable);

		// Set cell widths
		this.th.forEach((el, index) => this._setWidth(el, _thWidths[index]));
		this.td.forEach((el, index) => this._setWidth(el, _tdWidths[index]));
	}

	/**
	 * Set width to elements
	 * @param {HTMLElement | HTMLElement[]} el - Element or elements
	 * @param {number | string} width - Width value
	 * @private
	 */
	_setWidth(el: HTMLElement | HTMLElement[], width?: number | string) {
		(Array.isArray(el) ? el : [el]).forEach((el) => {
			el.style.width = width ? `${width}px` : '';
			el.style.minWidth = width ? `${width}px` : '';
		});
	}

	/**
	 * Toggle button visibility
	 * @param {HTMLButtonElement} el - Button element
	 * @param {boolean} isActive - Is active
	 */
	_toggleButton(el: HTMLButtonElement, isActive: boolean) {
		el.disabled = !isActive;
		el.style.display = this.isScrollable ? '' : 'none';
	}

	/**
	 * Toggle overlay visibility
	 * @param {HTMLElement} el - Overlay element
	 * @param {boolean} isActive - Is active
	 * @private
	 */
	_toggleOverlay(el: HTMLElement, isActive: boolean) {
		el.style.opacity = !isActive ? '0' : '1';
		// Don't overlay scrollbar
		if (el.parentElement === this.trackBody)
			el.style.height = `${this.tableBodyHeight}px`;
	}

	/**
	 * Button left click event
	 * @private
	 */
	_onClickButtonLeft(e: Event) {
		const { onClickButtonLeft } = this.options;
		const { clientWidth, scrollLeft } = this.scrollerBody;
		this._scrollTo(scrollLeft - clientWidth * 0.75);
		this._isScrollable();
		typeof onClickButtonLeft === 'function' && onClickButtonLeft(e);
	}

	/**
	 * Button right click event
	 * @private
	 */
	_onClickButtonRight(e: Event) {
		const { onClickButtonRight } = this.options;
		const { clientWidth, scrollLeft } = this.scrollerBody;
		this._scrollTo(scrollLeft + clientWidth * 0.75);
		this._isScrollable();
		typeof onClickButtonRight === 'function' && onClickButtonRight(e);
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
		const { onScroll } = this.options;
		this._isScrollable();
		typeof onScroll === 'function' && onScroll(e);
	}

	_onScrollend(e: Event) {
		const { onScrollend } = this.options;
		typeof onScrollend === 'function' && onScrollend(e);
	}
}
