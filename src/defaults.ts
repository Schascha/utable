import { IUTableOptions } from './types';

/**
 * Default options for UTable
 * @type {IUTableOptions}
 * @props {boolean} buttons - Enable or disable buttons
 * @props {boolean} overlays - Enable or disable overlays
 * @props {boolean} sticky - Enable or disable sticky observer
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
 */
export const UTableDefaults: IUTableOptions = {
	buttons: true,
	overlays: true,
	sticky: true,
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
