(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Table = {}));
})(this, (function (exports) { 'use strict';

    const defaultOptions = {
        classWrapper: 'table',
        classScroller: 'scroller',
        classScrollLeft: 'scroll-left',
        classScrollRight: 'scroll-right',
        classSticky: 'is-sticky',
        classTrack: 'track',
    };
    class Table {
        constructor(table, options) {
            this.table = (typeof table === 'string' ? document.querySelector(table) : table);
            this.options = Object.assign(Object.assign({}, options), defaultOptions);
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
            var _a;
            return ((_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.offsetHeight) || 0;
        }
        get tableHead() {
            var _a;
            if (!this._tableHead) {
                const thead = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('thead');
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
        _createElement(tag, options = {}) {
            const el = document.createElement(tag);
            const { className, insertMethod, parent } = options;
            if (className)
                el.className = className;
            if (parent)
                parent[insertMethod || 'append'](el);
            return el;
        }
        _createScrollElement(className) {
            const { _createElement: $, trackBody, trackHead } = this;
            const el = [$('div', { className, parent: trackBody })];
            trackHead && el.push($('div', { className, parent: trackHead }));
            return el;
        }
        _createShadowTable() {
            var _a;
            this.shadowTable = (_a = this.el) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
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
            if (this.scrollerHead)
                this.scrollerHead.scrollLeft = scrollLeft;
        }
        _isSticky() {
            if (!window.IntersectionObserver)
                return;
            // Detect when headers gets sticky
            this.observer = new window.IntersectionObserver(([e]) => {
                var _a;
                return (_a = this.trackHead) === null || _a === void 0 ? void 0 : _a.classList.toggle(this.options.classSticky, e.intersectionRatio < 1);
            }, { threshold: [1] });
            // Observe top element
            this.observer.observe(this.top);
        }
        // Sync cell widths
        _setEqualWidth() {
            var _a, _b, _c, _d, _e;
            if (!this.tableHead || !this.shadowTable)
                return;
            // Append shadow table
            (_b = (_a = this.el) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(this.shadowTable, this.el);
            this.shadowTable.style.width = ((_c = this.el) === null || _c === void 0 ? void 0 : _c.clientWidth) + 'px';
            // Get elements
            const th = Array.from(this.tableHead.querySelectorAll('tr > *'));
            const td = Array.from(this.tableBody.querySelectorAll('tr:first-child > *'));
            const thShadow = Array.from(this.shadowTable.querySelectorAll('thead > tr > *')).map((el) => el.getBoundingClientRect().width);
            const tdShadow = Array.from(this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *')).map((el) => el.getBoundingClientRect().width);
            // Remove shadow table
            (_e = (_d = this.el) === null || _d === void 0 ? void 0 : _d.parentNode) === null || _e === void 0 ? void 0 : _e.removeChild(this.shadowTable);
            // Set width
            [...th].forEach((el, index) => this._setWidth(el, thShadow[index]));
            [...td].forEach((el, index) => this._setWidth(el, tdShadow[index]));
        }
        // Set width to elements
        _setWidth(el, width) {
            (Array.isArray(el) ? el : [el]).forEach((el) => {
                el.style.width = width ? `${width}px` : '';
                el.style.minWidth = width ? `${width}px` : '';
            });
        }
        _toggleScroll(el, isScroll) {
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

    exports.Table = Table;

}));
