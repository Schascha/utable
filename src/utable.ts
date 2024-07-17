import { UTableDefaults } from './defaults';
import { IUTable, IUTableOptions } from './types';

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
		tableHead?: HTMLTableElement;
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
		if (!this._.el) {
			this._.el = this._createElement('div', {
				className: this.options.classWrapper,
				insertMethod: 'before',
				parent: this.table,
			});
			this._.el.appendChild(this.table);
		}
		return this._.el;
	}

	get buttonLeft() {
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

	get buttonRight() {
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

	get scrollerHead() {
		if (!this._.scrollerHead && this.tableHead) {
			this._.scrollerHead = this._createElement('div', {
				className: this.options.classScroller,
			});
			this._.scrollerHead.appendChild(this.tableHead);
		}
		return this._.scrollerHead;
	}

	get scrollerBody() {
		if (!this._.scrollerBody) {
			this._.scrollerBody = this._createElement('div', {
				className: this.options.classScroller,
			});
			this._.scrollerBody.appendChild(this.tableBody);
			this._.scrollerBody.addEventListener('scroll', this._onScroll);
		}
		return this._.scrollerBody;
	}

	get overlayLeft() {
		this._.overlayLeft =
			this._.overlayLeft || this._createOverlay(this.options.classOverlayLeft);
		return this._.overlayLeft;
	}

	get overlayRight() {
		this._.overlayRight =
			this._.overlayRight ||
			this._createOverlay(this.options.classOverlayRight);
		return this._.overlayRight;
	}

	get tableBody() {
		this._.tableBody = this._.tableBody || this.table;
		return this._.tableBody;
	}

	get tableBodyHeight() {
		return this.tableBody?.offsetHeight || 0;
	}

	get tableHead() {
		if (!this._.tableHead) {
			const thead = this.el?.querySelector('thead');
			if (thead) {
				this._.tableHead = document.createElement('table');
				this._.tableHead.appendChild(thead);
			}
		}
		return this._.tableHead;
	}

	get top() {
		if (!this._.top) {
			this._.top = this._createElement('div', {
				parent: this.el,
				insertMethod: 'prepend',
			});
		}
		return this._.top;
	}

	get trackBody() {
		if (!this._.trackBody) {
			this._.trackBody = this._createElement('div', {
				className: `${this.options.classTrack} tbody`,
			});
			this._.trackBody.appendChild(this.scrollerBody);
		}
		return this._.trackBody;
	}

	get trackHead() {
		if (!this._.trackHead && this.scrollerHead) {
			this._.trackHead = this._createElement('div', {
				className: `${this.options.classTrack} thead`,
			});
			this._.trackHead.appendChild(this.scrollerHead);
		}
		return this._.trackHead;
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
		this._ = {};
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

	_createButton(
		className: string,
		text: string,
		title: string,
		event: () => void
	) {
		const button = this._createElement('button', {
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
