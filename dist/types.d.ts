export interface ITable {
    el: Element | Element[] | NodeListOf<Element> | string;
    options: ITableOptions;
}
export interface ITableOptions {
    classElement: string;
}
