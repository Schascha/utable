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

		// Reset width
		this._setWidth([...th, ...td]);

		// Resize cells with colspan first
		th.filter((_th) => _th.colSpan > 1).forEach((_th) => {
			// @TODO td with colspan
			const index = th.indexOf(_th);
			const _td = td.slice(index, index + _th.colSpan);
			const width = Math.max(
				_td.reduce((acc, el) => acc + el.offsetWidth, 0),
				_th.offsetWidth
			);
			this._setWidth(_th, width);
			let remainingWidth = width;
			_td.forEach((el, index) => {
				const cellWidth = Math.max(
					el.offsetWidth,
					Math.floor(remainingWidth / (_th.colSpan - index))
				);
				this._setWidth(el, cellWidth);
				remainingWidth -= cellWidth;
			});
		});

		th.filter((_th) => _th.colSpan === 1).forEach((_th, index) => {
			const _td = td[index];
			this._setWidth([_th, _td], Math.max(_th.offsetWidth, _td.offsetWidth));
		});
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
