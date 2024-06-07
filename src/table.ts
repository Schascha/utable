import type { ITableOptions } from './types';

const defaultOptions: ITableOptions = {
	classScroller: 'scroller',
	classScrollLeft: 'scroll-left',
	classScrollRight: 'scroll-right',
	classSticky: 'is-sticky',
	classTrack: 'track',
};

export class Table {
	el: Element | null | undefined;
	observer: IntersectionObserver | undefined;
	options: ITableOptions;
	shadowTable: HTMLElement | undefined;
	table: HTMLTableElement | null | undefined;
	private _scrollerBody: HTMLDivElement | undefined;
	private _scrollerHead: HTMLDivElement | undefined;
	private _scrollLeft: HTMLDivElement[] | undefined;
	private _scrollRight: HTMLDivElement[] | undefined;
	private _tableBody: HTMLTableElement | undefined;
	private _tableHead: HTMLTableElement | undefined;
	private _top: any;
	private _trackBody: HTMLDivElement | undefined;
	private _trackHead: HTMLDivElement | undefined;

	constructor(el: Element | string, options?: ITableOptions) {
		this.el = typeof el === 'string' ? document.querySelector(el) : el;
		this.options = { ...options, ...defaultOptions };
		this.table = this.el?.querySelector('table');
		this._onResize = this._onResize.bind(this);
		this._onScroll = this._onScroll.bind(this);

		if (!this.el || !(this.el instanceof Element) || !this.table) {
			throw new Error('Element not found');
		}

		// Create shadow table
		this._createShadowTable();

		// Split table into head and body
		if (this.trackHead) {
			this.el.appendChild(this.trackHead);
			this._isSticky();
		}
		this.el.appendChild(this.trackBody);

		// Resize event
		window.addEventListener('resize', this._onResize);
		window.addEventListener('orientationchange', this._onResize);
		this.update();
	}

	get scrollerHead() {
		if (!this._scrollerHead && this.tableHead) {
			const { classScroller } = this.options;
			this._scrollerHead = this._createElement('div', classScroller);
			this._scrollerHead.appendChild(this.tableHead);
		}
		return this._scrollerHead;
	}

	get scrollerBody() {
		if (!this._scrollerBody) {
			const { classScroller } = this.options;
			this._scrollerBody = this._createElement('div', classScroller);
			this._scrollerBody.appendChild(this.tableBody);
			this._scrollerBody.addEventListener('scroll', this._onScroll);
		}
		return this._scrollerBody;
	}

	get scrollLeft() {
		this._scrollLeft =
			this._scrollLeft ||
			this._createScrollElement(this.options.classScrollLeft);
		return this._scrollLeft;
	}

	get scrollRight() {
		this._scrollRight =
			this._scrollRight ||
			this._createScrollElement(this.options.classScrollRight);
		return this._scrollRight;
	}

	get tableBody() {
		this._tableBody = this._tableBody || (this.table as HTMLTableElement);
		return this._tableBody;
	}

	get tableBodyHeight() {
		return this.tableBody?.offsetHeight || 0;
	}

	get tableHead() {
		if (!this._tableHead) {
			const thead = this.el?.querySelector('thead');
			if (thead) {
				this._tableHead = document.createElement('table');
				this._tableHead.appendChild(thead);
			}
		}
		return this._tableHead;
	}

	get top() {
		if (!this._top) {
			this._top = document.createElement('div');
			this.el?.parentNode?.insertBefore(this._top, this.el);
		}
		return this._top;
	}

	get trackBody() {
		if (!this._trackBody) {
			this._trackBody = this._createElement('div', this.options.classTrack);
			this._trackBody.appendChild(this.scrollerBody);
		}
		return this._trackBody;
	}

	get trackHead() {
		if (!this._trackHead && this.scrollerHead) {
			this._trackHead = this._createElement('div', this.options.classTrack);
			this._trackHead.appendChild(this.scrollerHead);
		}
		return this._trackHead;
	}

	update() {
		this._setEqualWidth();
		this._isScrollable();
	}

	_createElement<K extends keyof HTMLElementTagNameMap>(
		tag: K,
		className?: string,
		parent?: HTMLElement
	): HTMLElementTagNameMap[K] {
		const el = document.createElement(tag);
		if (className) el.className = className;
		parent?.appendChild(el);
		return el;
	}

	_createScrollElement(className: string) {
		const el = [this._createElement('div', className, this.trackBody)];
		this.trackHead &&
			el.push(this._createElement('div', className, this.trackHead));
		return el;
	}

	_createShadowTable() {
		this.shadowTable = this.el?.cloneNode(true) as HTMLElement;
		this.shadowTable.style.visibility = 'hidden';
		this.shadowTable.style.position = 'absolute';
		this.shadowTable.style.zIndex = '-2147483640';
		this.shadowTable.style.width = '100%';
	}

	_isScrollable() {
		const { clientWidth, scrollLeft, scrollWidth } = this.scrollerBody;
		const isScrollLeft = scrollLeft > 0 && clientWidth < scrollWidth;
		const isScrollRight = scrollLeft + clientWidth < scrollWidth - 1;

		// Toggle scroll elements
		this.scrollLeft.forEach((el) => this._toggleScroll(el, isScrollLeft));
		this.scrollRight.forEach((el) => this._toggleScroll(el, isScrollRight));

		// Sync scroll position
		if (this.scrollerHead) this.scrollerHead.scrollLeft = scrollLeft;
	}

	_isSticky() {
		if (!window.IntersectionObserver) return;

		// Detect when headers gets sticky
		this.observer = new window.IntersectionObserver(
			([e]) =>
				this.trackHead?.classList.toggle(
					this.options.classSticky,
					e.intersectionRatio < 1
				),
			{ threshold: [1] }
		);

		// Observe top element
		this.observer.observe(this.top);
	}

	// Sync cell widths
	_setEqualWidth() {
		if (!this.tableHead || !this.shadowTable) return;

		// Append shadow table
		this.el?.parentNode?.insertBefore(this.shadowTable, this.el);

		// Get elements
		const th: HTMLTableCellElement[] = Array.from(
			this.tableHead.querySelectorAll('tr > *')
		);
		const td: HTMLTableCellElement[] = Array.from(
			this.tableBody.querySelectorAll('tr:first-child > *')
		);
		const thShadow = Array.from(
			this.shadowTable.querySelectorAll('thead > tr > *')
		).map((el) => el.getBoundingClientRect().width);
		const tdShadow = Array.from(
			this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *')
		).map((el) => el.getBoundingClientRect().width);

		// Remove shadow table
		this.el?.parentNode?.removeChild(this.shadowTable);

		// Set width
		[...th].forEach((el, index) => this._setWidth(el, thShadow[index]));
		[...td].forEach((el, index) => this._setWidth(el, tdShadow[index]));
	}

	// Set width to elements
	_setWidth(el: HTMLElement | HTMLElement[], width?: number | string) {
		(Array.isArray(el) ? el : [el]).forEach((el) => {
			el.style.width = width ? `${width}px` : '';
			el.style.minWidth = width ? `${width}px` : '';
		});
	}

	_toggleScroll(el: HTMLElement, isScroll: boolean) {
		el.style.opacity = !isScroll ? '0' : '1';
		// Don't overlay scrollbar
		if (el.parentElement === this.trackBody)
			el.style.height = `${this.tableBodyHeight}px`;
	}

	_onResize() {
		this.update();
	}

	_onScroll() {
		this._isScrollable();
	}
}
