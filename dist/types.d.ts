export interface IUTable {
    destroy(): void;
    render(): void;
    update(): void;
}
/**
 * Options for UTable
 * @props {boolean} buttons - Enable or disable buttons
 * @props {boolean} overlays - Enable or disable overlays
 * @props {boolean} sticky - Enable or disable sticky observer
 * @props {string} width - Width of the table, auto or fixed
 * @props {string} classButtonLeft - Class name for left button
 * @props {string} classButtonRight - Class name for right button
 * @props {string} classOverlayLeft - Class name for left overlay
 * @props {string} classOverlayRight - Class name for right overlay
 * @props {string} classScroller - Class name for scroller
 * @props {string} classSticky - Class name if table header is sticky
 * @props {string} classTop - Class name for top element
 * @props {string} classTrack - Class name for track element
 * @props {string} classWrapper - Class name for wrapper element
 * @props {string} textButtonLeft - Text for left button
 * @props {string} textButtonRight - Text for right button
 * @props {string} titleButtonLeft - Title for left button
 * @props {string} titleButtonRight - Title for right button
 * @props {Function} onClickButtonLeft - Callback function on left button click
 * @props {Function} onClickButtonRight - Callback function on right button click
 * @props {Function} onScroll - Callback function on scroll
 * @props {Function} onScrollend - Callback function on scroll end
 */
export interface IUTableOptions {
    buttons: boolean;
    overlays: boolean;
    sticky: boolean;
    width: 'auto' | 'fixed';
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
    onClickButtonLeft?: Function;
    onClickButtonRight?: Function;
    onScroll?: Function;
    onScrollend?: Function;
}
