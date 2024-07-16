import { UTableDefaults } from './defaults';
import { IUTable, IUTableOptions } from './types';

export class UTable implements IUTable {
	isScrollable: boolean;
	observer: IntersectionObserver | undefined;
	options: IUTableOptions;
	shadowTable: HTMLTableElement | undefined;
	table: HTMLTableElement;
	private _buttonLeft: HTMLButtonElement | undefined;
	private _buttonRight: HTMLButtonElement | undefined;
	private _el: HTMLDivElement | undefined;
	private _scrollerBody: HTMLDivElement | undefined;
	private _scrollerHead: HTMLDivElement | undefined;
	private _overlayLeft: HTMLDivElement[] | undefined;
	private _overlayRight: HTMLDivElement[] | undefined;
	private _tableBody: HTMLTableElement | undefined;
	private _tableHead: HTMLTableElement | undefined;
	private _top: HTMLDivElement | undefined;
	private _trackBody: HTMLDivElement | undefined;
	private _trackHead: HTMLDivElement | undefined;

	constructor(
		table: HTMLTableElement | string,
		options?: Partial<IUTableOptions>
	) {
		this.table = (
			typeof table === 'string' ? document.querySelector(table) : table
		) as HTMLTableElement;
		this.options = { ...UTableDefaults, ...options };
		this.isScrollable = false;

		if (!this.table || !(this.table instanceof HTMLTableElement)) {
			throw new Error('Element not found');
		}

		// Bind events
		this._onResize = this._onResize.bind(this);
		this._onScroll = this._onScroll.bind(this);
		this._onClickButtonLeft = this._onClickButtonLeft.bind(this);
		this._onClickButtonRight = this._onClickButtonRight.bind(this);

		this.render();
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

	get buttonLeft() {
		if (!this._buttonLeft) {
			const { classButtonLeft, textButtonLeft } = this.options;
			this._buttonLeft = this._createButton(classButtonLeft, textButtonLeft);
			this._buttonLeft.addEventListener('click', this._onClickButtonLeft);
		}
		return this._buttonLeft;
	}

	get buttonRight() {
		if (!this._buttonRight) {
			const { classButtonRight, textButtonRight } = this.options;
			this._buttonRight = this._createButton(classButtonRight, textButtonRight);
			this._buttonRight.addEventListener('click', this._onClickButtonRight);
		}
		return this._buttonRight;
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

	get overlayLeft() {
		this._overlayLeft =
			this._overlayLeft || this._createOverlay(this.options.classOverlayLeft);
		return this._overlayLeft;
	}

	get overlayRight() {
		this._overlayRight =
			this._overlayRight || this._createOverlay(this.options.classOverlayRight);
		return this._overlayRight;
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
		if (!this._top) {
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

	destroy() {
		// Unbind events
		window.removeEventListener('resize', this._onResize);
		window.removeEventListener('orientationchange', this._onResize);
		this.scrollerBody?.removeEventListener('scroll', this._onScroll);
		this.buttonLeft?.removeEventListener('click', this._onClickButtonLeft);
		this.buttonRight?.removeEventListener('click', this._onClickButtonRight);
		this.observer?.disconnect();

		// Restore table
		this.tableHead && this.table.prepend(this.tableHead.firstChild!);
		this.el?.parentNode?.replaceChild(this.table, this.el);
		this.top?.parentNode?.removeChild(this.top);

		// Remove private properties
		this._el =
			this._scrollerBody =
			this._scrollerHead =
			this._tableBody =
			this._tableHead =
			this._top =
			this._trackBody =
			this._trackHead =
			this._buttonLeft =
			this._buttonRight =
			this._overlayLeft =
			this._overlayRight =
				undefined;
	}

	render() {
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

		return this;
	}

	update() {
		this._setEqualWidth();
		this._isScrollable();
	}

	_createButton(className: string, text: string) {
		const button = this._createElement('button', {
			className,
			parent: this.trackHead,
			insertMethod: 'prepend',
		});
		button.type = 'button';
		button.innerHTML = `<span>${text}</span>`;
		return button;
	}

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

	_createOverlay(className: string) {
		const { _createElement: $, trackBody, trackHead } = this;
		const el = [$('div', { className, parent: trackBody })];
		trackHead && el.push($('div', { className, parent: trackHead }));
		return el;
	}

	_createShadowTable() {
		this.shadowTable = this.table.cloneNode(true) as HTMLTableElement;
		this.shadowTable.style.visibility = 'hidden';
		this.shadowTable.style.position = 'absolute';
		this.shadowTable.style.zIndex = '-2147483640';
	}

	_isScrollable() {
		const { clientWidth, scrollLeft, scrollWidth } = this.scrollerBody;
		const isScrollLeft = scrollLeft > 0 && clientWidth < scrollWidth;
		const isScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
		this.isScrollable = isScrollLeft || isScrollRight;

		// Toggle overlays
		if (this.options.overlays) {
			this.overlayLeft.forEach((el) => this._toggleScroll(el, isScrollLeft));
			this.overlayRight.forEach((el) => this._toggleScroll(el, isScrollRight));
		}

		// Toggle buttons
		if (this.options.buttons) {
			this._toggleButton(this.buttonRight, isScrollRight);
			this._toggleButton(this.buttonLeft, isScrollLeft);
		}

		// Sync scroll position
		if (this.scrollerHead) this.scrollerHead.scrollLeft = scrollLeft;
	}

	_isSticky() {
		if (!window.IntersectionObserver || !this.top) return;

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

	// Sync cell widths
	_setEqualWidth() {
		if (!this.tableHead || !this.shadowTable) return;

		// Append shadow table
		this.el.prepend(this.shadowTable);
		this.shadowTable.style.width = `${this.el.clientWidth}px`;

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
		this.el.removeChild(this.shadowTable);

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

	_toggleButton(el: HTMLButtonElement, isScroll: boolean) {
		el.disabled = !isScroll;
		el.style.display = this.isScrollable ? '' : 'none';
	}

	_toggleScroll(el: HTMLElement, isScroll: boolean) {
		el.style.opacity = !isScroll ? '0' : '1';
		// Don't overlay scrollbar
		if (el.parentElement === this.trackBody)
			el.style.height = `${this.tableBodyHeight}px`;
	}

	_onClickButtonLeft() {
		const { clientWidth, scrollLeft } = this.scrollerBody;
		this._scrollTo(scrollLeft - clientWidth * 0.75);
		this._isScrollable();
	}

	_onClickButtonRight() {
		const { clientWidth, scrollLeft } = this.scrollerBody;
		this._scrollTo(scrollLeft + clientWidth * 0.75);
		this._isScrollable();
	}

	_onResize() {
		this.update();
	}

	_onScroll() {
		this._isScrollable();
	}
}
