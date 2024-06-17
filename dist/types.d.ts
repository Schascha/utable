export interface IUTable {
    destroy(): void;
    render(): void;
    update(): void;
}
export interface IUTableOptions {
    buttons?: boolean;
    classButtonLeft: string;
    classButtonRight: string;
    classScroller: string;
    classScrollLeft: string;
    classScrollRight: string;
    classSticky: string;
    classTrack: string;
    classWrapper: string;
    textButtonLeft: string;
    textButtonRight: string;
}
