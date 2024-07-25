(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UTable = {}));
})(this, (function (exports) { 'use strict';

    const UTableDefaults = {
        buttons: true,
        overlays: true,
        sticky: true,
        width: 'auto',
        classButtonLeft: 'button-left',
        classButtonRight: 'button-right',
        classOverlayLeft: 'scroll-left',
        classOverlayRight: 'scroll-right',
        classScroller: 'scroller',
        classSticky: 'is-sticky',
        classTrack: 'track',
        classTop: 'top',
        classWrapper: 'utable',
        textButtonLeft: 'Left',
        textButtonRight: 'Right',
        titleButtonLeft: 'Scroll left',
        titleButtonRight: 'Scroll right',
    };

    class UTable {
        constructor(table, options) {
            this.table = (typeof table === 'string' ? document.querySelector(table) : table);
            this.options = Object.assign(Object.assign({}, UTableDefaults), options);
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
                this._.buttonLeft = this._createButton(classButtonLeft, textButtonLeft, titleButtonLeft, this._onClickButtonLeft);
            }
            return this._.buttonLeft;
        }
        get buttonRight() {
            if (!this._.buttonRight) {
                const { classButtonRight, textButtonRight, titleButtonRight } = this.options;
                this._.buttonRight = this._createButton(classButtonRight, textButtonRight, titleButtonRight, this._onClickButtonRight);
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
                const { classScroller, onScrollend } = this.options;
                const el = this._createElement('div', { className: classScroller });
                el.appendChild(this.tableBody);
                el.addEventListener('scroll', this._onScroll);
                onScrollend && el.addEventListener('scrollend', this._onScrollend);
                el.setAttribute('tabindex', '0');
                this._.scrollerBody = el;
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
            var _a;
            return ((_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.offsetHeight) || 0;
        }
        get tableHead() {
            var _a;
            if (typeof this._.tableHead === 'undefined') {
                const thead = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('thead');
                if (thead) {
                    this._.tableHead = document.createElement('table');
                    this._.tableHead.appendChild(thead);
                }
                else {
                    this._.tableHead = thead;
                }
            }
            return this._.tableHead;
        }
        get td() {
            const { table } = this;
            return Array.from(table.querySelectorAll('table > tr > *, tbody > tr > *'));
        }
        get th() {
            const { tableHead } = this;
            return tableHead ? Array.from(tableHead.querySelectorAll('tr > *')) : [];
        }
        get top() {
            if (!this._.top) {
                this._.top = this._createElement('div', {
                    className: this.options.classTop,
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
                this.el.appendChild(this._.trackHead);
            }
            return this._.trackHead;
        }
        destroy() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            // Unbind events
            window.removeEventListener('resize', this._onResize);
            window.removeEventListener('orientationchange', this._onResize);
            (_a = this.scrollerBody) === null || _a === void 0 ? void 0 : _a.removeEventListener('scroll', this._onScroll);
            (_b = this.scrollerBody) === null || _b === void 0 ? void 0 : _b.removeEventListener('scrollend', this._onScrollend);
            (_c = this.buttonLeft) === null || _c === void 0 ? void 0 : _c.removeEventListener('click', this._onClickButtonLeft);
            (_d = this.buttonRight) === null || _d === void 0 ? void 0 : _d.removeEventListener('click', this._onClickButtonRight);
            (_e = this.observer) === null || _e === void 0 ? void 0 : _e.disconnect();
            // Restore table
            this.th.forEach((el) => this._setWidth(el));
            this.td.forEach((el) => this._setWidth(el));
            ((_f = this.tableHead) === null || _f === void 0 ? void 0 : _f.firstChild) && this.table.prepend(this.tableHead.firstChild);
            (_h = (_g = this.el) === null || _g === void 0 ? void 0 : _g.parentNode) === null || _h === void 0 ? void 0 : _h.replaceChild(this.table, this.el);
            (_k = (_j = this.top) === null || _j === void 0 ? void 0 : _j.parentNode) === null || _k === void 0 ? void 0 : _k.removeChild(this.top);
            // Remove private properties
            this._ = {};
        }
        /**
         * Render method
         * This method should be called to initialize the table
         * @returns {this} - Table instance
         */
        render() {
            // Update options from data attribute
            const { options } = this.table.dataset;
            try {
                const json = options ? JSON.parse(options) : {};
                this.options = Object.assign(Object.assign({}, this.options), json);
            }
            catch (_a) { }
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
        update() {
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
        _createButton(className, text, title, event) {
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
        /**
         * Create element
         * @param {K} tag
         * @param {Object} options - Element options
         * @param {string} options.className - Element class name
         * @param {string} options.insertMethod - Insert method, default is append
         * @param {Element} options.parent - Parent element
         * @private
         * @returns {HTMLElementTagNameMap[K]} - Element
         */
        _createElement(tag, options = {}) {
            const el = document.createElement(tag);
            const { className, insertMethod, parent } = options;
            if (className)
                el.className = className;
            if (parent)
                parent[insertMethod || 'append'](el);
            return el;
        }
        /**
         * Create overlay
         * @param {string} className - Overlay class name
         * @private
         * @returns {HTMLDivElement[]} - Overlay elements
         */
        _createOverlay(className) {
            const { _createElement: $, trackBody, trackHead } = this;
            const el = [$('div', { className, parent: trackBody })];
            trackHead && el.push($('div', { className, parent: trackHead }));
            return el;
        }
        /**
         * Create shadow table
         * This table is a copy of the original table and is used to calculate the width of the cells
         * @private
         */
        _createShadowTable() {
            this.shadowTable = this.table.cloneNode(true);
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
            if (this.scrollerHead)
                this.scrollerHead.scrollLeft = scrollLeft;
        }
        /**
         * Sticky header
         * @private
         */
        _isSticky() {
            const { options, top, trackHead } = this;
            const { classSticky, sticky } = options;
            if (!sticky || !window.IntersectionObserver || !top || !trackHead)
                return;
            // Detect when headers gets sticky
            this.observer = new window.IntersectionObserver(([e]) => trackHead === null || trackHead === void 0 ? void 0 : trackHead.classList.toggle(classSticky, e.intersectionRatio < 1), { threshold: [1] });
            // Observe top element
            this.observer.observe(top);
        }
        /**
         * Scroll to position
         * @param {number} left - Scroll left position
         * @private
         */
        _scrollTo(left) {
            const { scrollerBody } = this;
            if ('scrollBehavior' in document.documentElement.style) {
                scrollerBody.scrollTo({
                    behavior: 'smooth',
                    left,
                });
            }
            else {
                scrollerBody.scrollLeft = left;
            }
        }
        /**
         * Set equal width to cells
         * @private
         */
        _setEqualWidth() {
            var _a;
            if (!this.shadowTable)
                return;
            // Append shadow table and calculate table width
            this.el.prepend(this.shadowTable);
            const { marginLeft, marginRight } = window.getComputedStyle(this.table);
            const offset = (parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0); // Remove table margin from width
            const _th = Array.from(this.shadowTable.querySelectorAll('thead > tr > *'));
            const _td = Array.from(this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *'));
            this.shadowTable.style.tableLayout = 'auto';
            this.shadowTable.style.width = `${this.el.clientWidth - offset}px`;
            // Fixed width
            if (this.options.width === 'fixed') {
                // Get first row and calculate column count
                const tr = Array.from((((_a = this.shadowTable.querySelector('tr')) === null || _a === void 0 ? void 0 : _a.children) ||
                    []));
                const columnCount = tr.reduce((acc, el) => acc + (el.colSpan || 1), 0);
                // Set equal column width
                tr.forEach((el) => (el.style.width = `${(100 / columnCount) * (el.colSpan || 1)}%`));
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
        _setWidth(el, width) {
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
        _toggleButton(el, isActive) {
            el.disabled = !isActive;
            el.style.display = this.isScrollable ? '' : 'none';
        }
        /**
         * Toggle overlay visibility
         * @param {HTMLElement} el - Overlay element
         * @param {boolean} isActive - Is active
         * @private
         */
        _toggleOverlay(el, isActive) {
            el.style.opacity = !isActive ? '0' : '1';
            // Don't overlay scrollbar
            if (el.parentElement === this.trackBody)
                el.style.height = `${this.tableBodyHeight}px`;
        }
        /**
         * Button left click event
         * @private
         */
        _onClickButtonLeft(e) {
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
        _onClickButtonRight(e) {
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
        _onScroll(e) {
            const { onScroll } = this.options;
            this._isScrollable();
            typeof onScroll === 'function' && onScroll(e);
        }
        _onScrollend(e) {
            const { onScrollend } = this.options;
            typeof onScrollend === 'function' && onScrollend(e);
        }
    }

    exports.UTable = UTable;

}));
