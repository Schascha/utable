(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Table = {}));
})(this, (function (exports) { 'use strict';

    const defaultOptions = {
        classScroller: 'scroller',
        classSticky: 'is-sticky',
        classTrack: 'track',
    };
    class Table {
        constructor(el, options) {
            var _a;
            this.el = typeof el === 'string' ? document.querySelector(el) : el;
            this.options = Object.assign(Object.assign({}, options), defaultOptions);
            this.table = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('table');
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
                this._tableBody = this.table;
            }
            return this._tableBody;
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
            var _a, _b;
            if (!this._top) {
                this._top = document.createElement('div');
                (_b = (_a = this.el) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(this._top, this.el);
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
            this.observer = new window.IntersectionObserver(([e]) => {
                var _a;
                (_a = this.trackHead) === null || _a === void 0 ? void 0 : _a.classList.toggle(this.options.classSticky, e.intersectionRatio < 1);
            }, {
                threshold: [1],
            });
            this.observer.observe(this.top);
        }
        // Sync cell widths
        _setEqualWidth() {
            if (!this.tableHead) {
                return;
            }
            const th = Array.from(this.tableHead.querySelectorAll('tr > *'));
            const td = Array.from(this.tableBody.querySelectorAll('tr:first-child > *'));
            // Reset width
            this._setWidth([...th, ...td]);
            // Resize cells with colspan first
            th.filter((_th) => _th.colSpan > 1).forEach((_th) => {
                // @TODO td with colspan
                const index = th.indexOf(_th);
                const _td = td.slice(index, index + _th.colSpan);
                const width = Math.max(_td.reduce((acc, el) => acc + el.offsetWidth, 0), _th.offsetWidth);
                this._setWidth(_th, width);
                let remainingWidth = width;
                _td.forEach((el, index) => {
                    const cellWidth = Math.max(el.offsetWidth, Math.floor(remainingWidth / (_th.colSpan - index)));
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
        _setWidth(el, width) {
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

    exports.Table = Table;

}));
