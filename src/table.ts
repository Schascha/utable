import type { ITableOptions } from './types';

const defaultOptions: ITableOptions = {
	classScroller: 'scroller',
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
			// Detect when headers gets sticky
			this._isStickyHeader();
		}

		this.el.appendChild(this.trackBody);

		// Resize event
		window.addEventListener('resize', this._onResize);
		window.addEventListener('orientationchange', this._onResize);
		this.update();
	}

	get scrollerHead() {
		if (!this._scrollerHead && this.tableHead) {
			this._scrollerHead = document.createElement('div');
			this._scrollerHead.className = this.options.classScroller;
			this._scrollerHead.appendChild(this.tableHead);
		}
		return this._scrollerHead;
	}

	get scrollerBody() {
		if (!this._scrollerBody) {
			this._scrollerBody = document.createElement('div');
			this._scrollerBody.className = this.options.classScroller;
			this._scrollerBody.appendChild(this.tableBody);
			this._scrollerBody.addEventListener('scroll', this._onScroll);
		}
		return this._scrollerBody;
	}

	get tableBody() {
		if (!this._tableBody) {
			this._tableBody = this.table as HTMLTableElement;
		}
		return this._tableBody;
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
			this._trackBody = document.createElement('div');
			this._trackBody.className = this.options.classTrack;
			this._trackBody.appendChild(this.scrollerBody);
		}
		return this._trackBody;
	}

	get trackHead() {
		if (!this._trackHead && this.scrollerHead) {
			this._trackHead = document.createElement('div');
			this._trackHead.className = this.options.classTrack;
			this._trackHead.appendChild(this.scrollerHead);
		}
		return this._trackHead;
	}

	update() {
		this._setEqualWidth();
		this._setEqualScroll();
	}

	_createShadowTable() {
		this.shadowTable = this.el?.cloneNode(true) as HTMLElement;
		this.shadowTable.style.visibility = 'hidden';
		this.shadowTable.style.position = 'absolute';
		this.shadowTable.style.zIndex = '-2147483640';
		this.shadowTable.style.width = '100%';
	}

	_isStickyHeader() {
		if (!window.IntersectionObserver) {
			return;
		}

		this.observer = new window.IntersectionObserver(
			([e]) => {
				this.trackHead?.classList.toggle(
					this.options.classSticky,
					e.intersectionRatio < 1
				);
			},
			{
				threshold: [1],
			}
		);

		this.observer.observe(this.top);
	}

	// Sync cell widths
	_setEqualWidth() {
		if (!this.tableHead) {
			return;
		}

		const th: HTMLTableCellElement[] = Array.from(
			this.tableHead.querySelectorAll('tr > *')
		);
		const td: HTMLTableCellElement[] = Array.from(
			this.tableBody.querySelectorAll('tr:first-child > *')
		);

		if (this.shadowTable) {
			this.el?.parentNode?.insertBefore(this.shadowTable, this.el);
			const thShadow = Array.from(
				this.shadowTable.querySelectorAll('thead > tr > *')
			).map((el) => el.getBoundingClientRect().width);
			const tdShadow = Array.from(
				this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *')
			).map((el) => el.getBoundingClientRect().width);
			this.el?.parentNode?.removeChild(this.shadowTable);
			[...th].forEach((el, index) => this._setWidth(el, thShadow[index]));
			[...td].forEach((el, index) => this._setWidth(el, tdShadow[index]));
		}
	}

	// Set width to elements
	_setWidth(el: HTMLElement | HTMLElement[], width?: number | string) {
		(Array.isArray(el) ? el : [el]).forEach((el) => {
			el.style.width = width ? `${width}px` : '';
			el.style.minWidth = width ? `${width}px` : '';
		});
	}

	// Sync scroll position
	_setEqualScroll() {
		if (this.scrollerHead && this.scrollerBody) {
			this.scrollerHead.scrollLeft = this.scrollerBody.scrollLeft;
		}
	}

	_onResize() {
		this.update();
	}

	_onScroll() {
		this._setEqualScroll();
	}
}
