export interface IUTable {
    destroy(): void;
    render(): void;
    update(): void;
}
export interface IUTableOptions {
    buttons: boolean;
    overlays: boolean;
    sticky: boolean;
    classButtonLeft: string;
    classButtonRight: string;
    classOverlayLeft: string;
    classOverlayRight: string;
    classScroller: string;
    classSticky: string;
    classTop: string;
    classTrack: string;
    classWrapper: string;
    textButtonLeft: string;
    textButtonRight: string;
    titleButtonLeft: string;
    titleButtonRight: string;
}
