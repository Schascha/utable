import type { ITableOptions } from './types';
export declare class Table {
    el: Element | null | undefined;
    observer: IntersectionObserver | undefined;
    options: ITableOptions;
    table: HTMLTableElement | null | undefined;
    private _scrollerBody;
    private _scrollerHead;
    private _tableBody;
    private _tableHead;
    private _top;
    private _trackBody;
    private _trackHead;
    constructor(el: Element | string, options?: ITableOptions);
    get scrollerHead(): HTMLDivElement | undefined;
    get scrollerBody(): HTMLDivElement;
    get tableBody(): HTMLTableElement;
    get tableHead(): HTMLTableElement | undefined;
    get top(): any;
    get trackBody(): HTMLDivElement;
    get trackHead(): HTMLDivElement | undefined;
    update(): void;
    _isStickyHeader(): void;
    _setEqualWidth(): void;
    _setWidth(el: HTMLElement | HTMLElement[], width?: number | string): void;
    _setEqualScroll(): void;
    _onResize(): void;
    _onScroll(): void;
}
