export interface ITable {
	el: Element | string;
	options: ITableOptions | undefined;
}

export interface ITableOptions {
	classScroller: string;
	classSticky: string;
	classTrack: string;
}
