export interface IUTable {
	destroy(): void;
	render(): void;
	update(): void;
}

export interface IUTableOptions {
	buttons?: boolean;
	overlays?: boolean;
	classButtonLeft: string;
	classButtonRight: string;
	classOverlayLeft: string;
	classOverlayRight: string;
	classScroller: string;
	classSticky: string;
	classTrack: string;
	classWrapper: string;
	textButtonLeft: string;
	textButtonRight: string;
	titleButtonLeft: string;
	titleButtonRight: string;
}
