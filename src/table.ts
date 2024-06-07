import type { ITableOptions } from './types';

const defaultOptions: ITableOptions = {
	classWrapper: 'table',
	classScroller: 'scroller',
	classScrollLeft: 'scroll-left',
	classScrollRight: 'scroll-right',
	classSticky: 'is-sticky',
	classTrack: 'track',
};

export class Table {
	observer: IntersectionObserver | undefined;
	options: ITableOptions;
	shadowTable: HTMLElement | undefined;
	table: HTMLTableElement;
	private _el: HTMLDivElement | undefined;
	private _scrollerBody: HTMLDivElement | undefined;
	private _scrollerHead: HTMLDivElement | undefined;
	private _scrollLeft: HTMLDivElement[] | undefined;
	private _scrollRight: HTMLDivElement[] | undefined;
	private _tableBody: HTMLTableElement | undefined;
	private _tableHead: HTMLTableElement | undefined;
	private _top: any;
	private _trackBody: HTMLDivElement | undefined;
	private _trackHead: HTMLDivElement | undefined;

	constructor(table: HTMLTableElement | string, options?: ITableOptions) {
		this.table = (
			typeof table === 'string' ? document.querySelector(table) : table
		) as HTMLTableElement;
		this.options = { ...options, ...defaultOptions };

		if (!this.table || !(this.table instanceof HTMLTableElement)) {
			throw new Error('Element not found');
		}

		// Bind events
		this._onResize = this._onResize.bind(this);
		this._onScroll = this._onScroll.bind(this);

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

	get el() {
		if (!this._el) {
			this._el = this._createElement('div', {
				className: this.options.classWrapper,
				insertMethod: 'before',
				parent: this.table,
			});
			this._el.appendChild(this.table);
		}
		return this._el;
	}

	get scrollerHead() {
		if (!this._scrollerHead && this.tableHead) {
			this._scrollerHead = this._createElement('div', {
				className: this.options.classScroller,
			});
			this._scrollerHead.appendChild(this.tableHead);
		}
		return this._scrollerHead;
	}

	get scrollerBody() {
		if (!this._scrollerBody) {
			this._scrollerBody = this._createElement('div', {
				className: this.options.classScroller,
			});
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
		this._tableBody = this._tableBody || this.table;
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
		if (!this._top && this.el) {
			this._top = this._createElement('div', {
				parent: this.el,
				insertMethod: 'before',
			});
		}
		return this._top;
	}

	get trackBody() {
		if (!this._trackBody) {
			this._trackBody = this._createElement('div', {
				className: this.options.classTrack,
			});
			this._trackBody.appendChild(this.scrollerBody);
		}
		return this._trackBody;
	}

	get trackHead() {
		if (!this._trackHead && this.scrollerHead) {
			this._trackHead = this._createElement('div', {
				className: this.options.classTrack,
			});
			this._trackHead.appendChild(this.scrollerHead);
		}
		return this._trackHead;
	}

	update() {
		this._setEqualWidth();
		this._isScrollable();
	}

	// _createButton(classname: string, text: string) {
	// 	const button = this._createElement('button', classname);
	// 	button.type = 'button';
	// 	button.innerHTML = `<span>${text}</span>`;
	// 	this.trackHead?.insertBefore(button, this.trackHead.firstChild);
	// 	return button;
	// }

	_createElement<K extends keyof HTMLElementTagNameMap>(
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

	_createScrollElement(className: string) {
		const { _createElement: $, trackBody, trackHead } = this;
		const el = [$('div', { className, parent: trackBody })];
		trackHead && el.push($('div', { className, parent: trackHead }));
		return el;
	}

	_createShadowTable() {
		this.shadowTable = this.el?.cloneNode(true) as HTMLElement;
		this.shadowTable.style.visibility = 'hidden';
		this.shadowTable.style.position = 'absolute';
		this.shadowTable.style.zIndex = '-2147483640';
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
		this.shadowTable.style.width = this.el?.clientWidth + 'px';

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
