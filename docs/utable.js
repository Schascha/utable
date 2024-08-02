(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UTable = {}));
})(this, (function (exports) { 'use strict';

    const cache = new WeakMap();
    /**
     * Set cache
     * @param instance - UTable instance
     * @param props - Cache properties
     */
    function setCache(instance, props) {
        cache.set(instance, props);
    }
    /**
     * Get cache
     * @param instance - UTable instance
     * @returns Cache properties
     */
    function getCache(instance) {
        var _a;
        return (_a = cache.get(instance)) !== null && _a !== void 0 ? _a : {};
    }

    const UTableDefaults = {
        buttons: true,
        overlays: true,
        sticky: true,
        width: 'auto',
        classBody: 'tbody',
        classButtonLeft: 'button-left',
        classButtonRight: 'button-right',
        classHead: 'thead',
        classOverlayLeft: 'scroll-left',
        classOverlayRight: 'scroll-right',
        classScroller: 'scroller',
        classSticky: 'is-sticky',
        classTop: 'top',
        classWrapper: 'utable',
        textButtonLeft: 'Left',
        textButtonRight: 'Right',
        titleButtonLeft: 'Scroll left',
        titleButtonRight: 'Scroll right',
    };

    /**
     * Create element
     * @param {K} tag - Element tag
     * @param {Object} options - Element options
     * @param {string} [options.className] - Element class name
     * @param {string} [options.insertMethod] - Method to insert the element, default is append
     * @param {Element} [options.parent] - Parent element
     * @param {HTMLElement[]} [options.children] - Children elements to append to the created element
     * @returns {HTMLElementTagNameMap[K]} - Created element
     */
    function createElement(tag, options = {}) {
        const el = document.createElement(tag);
        const { children, className, insertMethod, parent } = options;
        if (className)
            el.className = className;
        if (parent)
            parent[insertMethod !== null && insertMethod !== void 0 ? insertMethod : 'append'](el);
        if (children)
            children.forEach((child) => el.appendChild(child));
        return el;
    }
    /**
     * Set styles to elements
     * @param {HTMLElement | HTMLElement[]} el - Element or array of elements
     * @param {Partial<CSSStyleDeclaration>} styles - Styles to be applied
     */
    function setStyles(el, styles) {
        if (!el)
            return;
        if (Array.isArray(el))
            el.forEach((el) => el && Object.assign(el.style, styles));
        else
            Object.assign(el.style, styles);
    }
    /**
     * Scroll to element with smooth behavior if supported
     * @param {HTMLElement} el - Element
     * @param {ScrollToOptions} options - Scroll options
     */
    function scrollTo(el, options) {
        var _a, _b;
        if ('scrollBehavior' in document.documentElement.style) {
            el.scrollTo(Object.assign({ behavior: 'smooth' }, options));
        }
        else {
            el.scrollTo((_a = options.left) !== null && _a !== void 0 ? _a : 0, (_b = options.top) !== null && _b !== void 0 ? _b : 0);
        }
    }

    class UTable {
        constructor(table, options) {
            this.isScrollable = false;
            this.table = (typeof table === 'string' ? document.querySelector(table) : table);
            this.options = Object.assign(Object.assign({}, UTableDefaults), options);
            // Check if table exists
            if (!this.table || !(this.table instanceof HTMLTableElement)) {
                throw new Error('Element not found');
            }
            setCache(this, {});
            this._bindEvents();
            this.render();
        }
        get el() {
            const _ = getCache(this);
            if (!_.el) {
                _.el = createElement('div', {
                    className: this.options.classWrapper,
                    insertMethod: 'before',
                    parent: this.table,
                    children: [this.table],
                });
            }
            return _.el;
        }
        get buttonLeft() {
            const _ = getCache(this);
            if (!_.buttonLeft) {
                _.buttonLeft = this._createButton(this.options.classButtonLeft, this.options.textButtonLeft, this.options.titleButtonLeft, this._onClickButtonLeft);
            }
            return _.buttonLeft;
        }
        get buttonRight() {
            const _ = getCache(this);
            if (!_.buttonRight) {
                _.buttonRight = this._createButton(this.options.classButtonRight, this.options.textButtonRight, this.options.titleButtonRight, this._onClickButtonRight);
            }
            return _.buttonRight;
        }
        get scrollerHead() {
            const _ = getCache(this);
            if (!_.scrollerHead && this.tableHead) {
                _.scrollerHead = createElement('div', {
                    className: this.options.classScroller,
                    children: [this.tableHead],
                });
            }
            return _.scrollerHead;
        }
        get scrollerBody() {
            const _ = getCache(this);
            if (!_.scrollerBody) {
                const { classScroller, onScrollend } = this.options;
                const el = createElement('div', {
                    className: classScroller,
                    children: [this.tableBody],
                });
                el.addEventListener('scroll', this._onScroll);
                el.setAttribute('tabindex', '0');
                onScrollend && el.addEventListener('scrollend', this._onScrollend);
                _.scrollerBody = el;
            }
            return _.scrollerBody;
        }
        get overlayLeft() {
            var _a;
            const _ = getCache(this);
            _.overlayLeft =
                (_a = _.overlayLeft) !== null && _a !== void 0 ? _a : this._createOverlay(this.options.classOverlayLeft);
            return _.overlayLeft;
        }
        get overlayRight() {
            var _a;
            const _ = getCache(this);
            _.overlayRight =
                (_a = _.overlayRight) !== null && _a !== void 0 ? _a : this._createOverlay(this.options.classOverlayRight);
            return _.overlayRight;
        }
        get tableBody() {
            var _a;
            const _ = getCache(this);
            _.tableBody = (_a = _.tableBody) !== null && _a !== void 0 ? _a : this.table;
            return _.tableBody;
        }
        get tableBodyHeight() {
            var _a, _b;
            return (_b = (_a = this.tableBody) === null || _a === void 0 ? void 0 : _a.offsetHeight) !== null && _b !== void 0 ? _b : 0;
        }
        get tableHead() {
            var _a;
            const _ = getCache(this);
            if (typeof _.tableHead === 'undefined') {
                const thead = (_a = this.el) === null || _a === void 0 ? void 0 : _a.querySelector('thead');
                _.tableHead = thead
                    ? createElement('table', { children: [thead] })
                    : null;
            }
            return _.tableHead;
        }
        get tableMargin() {
            const { marginLeft, marginRight } = window.getComputedStyle(this.table);
            return (parseInt(marginLeft, 10) || 0) + (parseInt(marginRight, 10) || 0);
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
            const _ = getCache(this);
            if (!_.top) {
                _.top = createElement('div', {
                    className: this.options.classTop,
                    parent: this.el,
                    insertMethod: 'prepend',
                });
            }
            return _.top;
        }
        get trackBody() {
            const _ = getCache(this);
            if (!_.trackBody) {
                _.trackBody = createElement('div', {
                    className: `${this.options.classBody}`,
                    children: [this.scrollerBody],
                });
            }
            return _.trackBody;
        }
        get trackHead() {
            const _ = getCache(this);
            if (!_.trackHead && this.scrollerHead) {
                _.trackHead = createElement('div', {
                    className: `${this.options.classHead}`,
                    children: [this.scrollerHead],
                });
                this.el.appendChild(_.trackHead);
            }
            return _.trackHead;
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
            // Empty cache
            setCache(this, {});
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
         * Falls back to render method if no cache is found
         * @returns {this} - Table instance
         */
        update() {
            var _a, _b;
            const _ = getCache(this);
            if (!Object.keys(_).length) {
                return this.render();
            }
            this._setEqualWidth();
            this._isScrollable();
            (_b = (_a = this.options).onUpdate) === null || _b === void 0 ? void 0 : _b.call(_a);
            return this;
        }
        /**
         * Bind events
         * @private
         */
        _bindEvents() {
            this._onResize = this._onResize.bind(this);
            this._onScroll = this._onScroll.bind(this);
            this._onScrollend = this._onScrollend.bind(this);
            this._onClickButtonLeft = this._onClickButtonLeft.bind(this);
            this._onClickButtonRight = this._onClickButtonRight.bind(this);
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
        _createOverlay(className) {
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
            this.shadowTable = this.table.cloneNode(true);
            setStyles(this.shadowTable, {
                visibility: 'hidden',
                position: 'absolute',
                zIndex: '-2147483640',
            });
        }
        /**
         * Check if the table is scrollable and toggle the visibility of the buttons and overlays
         * @private
         */
        _isScrollable() {
            const { clientWidth, scrollLeft, scrollWidth } = this.scrollerBody;
            const isScrollLeft = scrollLeft > 0 && clientWidth < scrollWidth;
            const isScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
            this.isScrollable = isScrollLeft || isScrollRight;
            // Toggle visibility
            this._toggleOverlays(isScrollLeft, isScrollRight);
            this._toggleButtons(isScrollLeft, isScrollRight);
            // Sync scroll position
            if (this.scrollerHead)
                this.scrollerHead.scrollLeft = scrollLeft;
        }
        /**
         * Sticky header
         * @private
         */
        _isSticky() {
            var _a;
            const { options, top, trackHead } = this;
            const { classSticky, sticky } = options;
            if (!sticky || !window.IntersectionObserver || !top || !trackHead)
                return;
            // Detect when headers gets sticky
            this.observer = new window.IntersectionObserver(([e]) => trackHead === null || trackHead === void 0 ? void 0 : trackHead.classList.toggle(classSticky, e.intersectionRatio < 1), { threshold: [1] });
            // Observe top element
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.observe(top);
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
            const th = Array.from(this.shadowTable.querySelectorAll('thead > tr > *'));
            const td = Array.from(this.shadowTable.querySelectorAll('table > tr > *, tbody > tr > *'));
            setStyles(this.shadowTable, {
                tableLayout: 'auto',
                width: `${this.el.clientWidth - this.tableMargin}px`,
            });
            // Fixed width
            if (this.options.width === 'fixed') {
                // Get first row cells
                const cells = Array.from((((_a = this.shadowTable.querySelector('tr')) === null || _a === void 0 ? void 0 : _a.children) ||
                    []));
                // Calculate column count
                const columnCount = cells.reduce((acc, el) => acc + (el.colSpan || 1), 0);
                // Set equal column width
                cells.forEach((el) => setStyles(el, { width: `${(100 / columnCount) * (el.colSpan || 1)}%` }));
                // Get max cell width
                const maxCellWidth = Math.max(...[...th, ...td]
                    .filter((el) => el.colSpan === 1)
                    .map((el) => el.getBoundingClientRect().width));
                // Update shadow table width depending on max cell width
                setStyles(this.shadowTable, { width: `${maxCellWidth * columnCount}px` });
            }
            // Get cell widths
            const thWidths = th.map((el) => el.getBoundingClientRect().width);
            const tdWidths = td.map((el) => el.getBoundingClientRect().width);
            // Remove shadow table
            this.el.removeChild(this.shadowTable);
            // Set cell widths
            this.th.forEach((el, index) => this._setWidth(el, thWidths[index]));
            this.td.forEach((el, index) => this._setWidth(el, tdWidths[index]));
        }
        /**
         * Set width to elements
         * @param {HTMLElement | HTMLElement[]} el - Element or elements
         * @param {number | string} width - Width value
         * @private
         */
        _setWidth(el, width) {
            const _width = width ? `${width}${isNaN(+width) ? '' : 'px'}` : '';
            setStyles(el, { width: _width, minWidth: _width });
        }
        /**
         * Toggle button visibility
         * @param {HTMLButtonElement} el - Button element
         * @param {boolean} isActive - Is active
         * @private
         */
        _toggleButton(el, isActive) {
            el.disabled = !isActive;
            setStyles(el, { display: this.isScrollable ? '' : 'none' });
        }
        /**
         * Toggle buttons visibility
         * @param {boolean} isScrollLeft - Is scroll left
         * @param {boolean} isScrollRight - Is scroll right
         * @private
         */
        _toggleButtons(isScrollLeft, isScrollRight) {
            if (!this.options.buttons)
                return;
            this._toggleButton(this.buttonRight, isScrollRight);
            this._toggleButton(this.buttonLeft, isScrollLeft);
        }
        /**
         * Toggle overlay visibility
         * @param {HTMLDivElement} el - Overlay element
         * @param {boolean} isActive - Is active
         * @private
         */
        _toggleOverlay(el, isActive) {
            const isBody = el.parentElement === this.trackBody;
            setStyles(el, {
                opacity: isActive ? '1' : '0',
                height: isBody ? `${this.tableBodyHeight}px` : '', // Don't overlay scrollbar
            });
        }
        /**
         * Toggle overlays visibility
         * @param isScrollLeft - Is scroll left
         * @param isScrollRight - Is scroll right
         * @private
         */
        _toggleOverlays(isScrollLeft, isScrollRight) {
            if (!this.options.overlays)
                return;
            this.overlayLeft.forEach((el) => this._toggleOverlay(el, isScrollLeft));
            this.overlayRight.forEach((el) => this._toggleOverlay(el, isScrollRight));
        }
        /**
         * Button left click event
         * @private
         */
        _onClickButtonLeft(e) {
            var _a, _b;
            const { clientWidth, scrollLeft } = this.scrollerBody;
            scrollTo(this.scrollerBody, { left: scrollLeft - clientWidth * 0.75 });
            this._isScrollable();
            (_b = (_a = this.options).onClickButtonLeft) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        }
        /**
         * Button right click event
         * @private
         */
        _onClickButtonRight(e) {
            var _a, _b;
            const { clientWidth, scrollLeft } = this.scrollerBody;
            scrollTo(this.scrollerBody, { left: scrollLeft + clientWidth * 0.75 });
            this._isScrollable();
            (_b = (_a = this.options).onClickButtonRight) === null || _b === void 0 ? void 0 : _b.call(_a, e);
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
            var _a, _b;
            this._isScrollable();
            (_b = (_a = this.options).onScroll) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        }
        /**
         * Scrollend event
         * @private
         */
        _onScrollend(e) {
            var _a, _b;
            (_b = (_a = this.options).onScrollend) === null || _b === void 0 ? void 0 : _b.call(_a, e);
        }
    }

    exports.UTable = UTable;

}));
