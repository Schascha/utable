import { UTable } from './utable';
import { UTableDefaults } from './defaults';

describe('UTable', () => {
	let tableEl: HTMLTableElement;
	let utable: UTable;
	let intesectionObserver: any;

	beforeEach(() => {
		intesectionObserver = window.IntersectionObserver;
		tableEl = document.createElement('table');
		tableEl.innerHTML = `
      <thead>
        <tr><th>Header 1</th><th>Header 2</th></tr>
      </thead>
      <tbody>
        <tr><td>Data 1</td><td>Data 2</td></tr>
      </tbody>
    `;
		document.body.appendChild(tableEl);
	});

	afterEach(() => {
		utable?.destroy();
		if (document.body.contains(tableEl)) {
			document.body.removeChild(tableEl);
		}
		window.IntersectionObserver = intesectionObserver;
	});

	/**
	 * Initialization
	 */

	it('should initialize from HTMLTableElement', () => {
		utable = new UTable(tableEl);
		expect(utable instanceof UTable).toBeTruthy();
		expect(utable.table).toBe(tableEl);
	});

	it('should initialize from string', () => {
		utable = new UTable('table');
		expect(utable instanceof UTable).toBeTruthy();
		expect(utable.table).toBe(tableEl);
	});

	it('should throw error if table is not found', () => {
		expect(() => new UTable('.table')).toThrow();
	});

	it('should use default options', () => {
		utable = new UTable(tableEl);
		expect(utable.options).toEqual(UTableDefaults);
	});

	it('should use data-attributes', () => {
		tableEl.setAttribute('data-options', JSON.stringify({ sticky: false }));
		utable = new UTable(tableEl);
		expect(utable.options.sticky).toBeFalsy();
		utable.destroy();
		tableEl.setAttribute('data-options', JSON.stringify({ sticky: true }));
		utable.update();
		expect(utable.options.sticky).toBeTruthy();
	});

	it('should destroy', () => {
		utable = new UTable(tableEl);
		const { classWrapper } = utable.options;
		utable.destroy();
		expect(document.querySelector(`.${classWrapper}`)).toBeFalsy();
	});

	it('should update', () => {
		utable = new UTable(tableEl);
		const { classWrapper } = utable.options;
		const spy = jest.spyOn(utable, 'render');
		utable.destroy();
		utable.update();
		expect(spy).toHaveBeenCalled();
		expect(document.querySelector(`.${classWrapper}`)).toBeTruthy();
	});

	/**
	 * Buttons
	 */

	it('should have buttons', () => {
		utable = new UTable(tableEl);
		const { classButtonLeft, classButtonRight } = utable.options;
		expect(document.querySelector(`.${classButtonLeft}`)).toBeTruthy();
		expect(document.querySelector(`.${classButtonRight}`)).toBeTruthy();
	});

	it('should not have buttons', () => {
		utable = new UTable(tableEl, { buttons: false });
		const { classButtonLeft, classButtonRight } = utable.options;
		expect(document.querySelector(`.${classButtonLeft}`)).toBeFalsy();
		expect(document.querySelector(`.${classButtonRight}`)).toBeFalsy();
	});

	/**
	 * Overlays
	 */

	it('should have overlays', () => {
		utable = new UTable(tableEl);
		const { classOverlayLeft, classOverlayRight } = utable.options;
		expect(document.querySelector(`.${classOverlayLeft}`)).toBeTruthy();
		expect(document.querySelector(`.${classOverlayRight}`)).toBeTruthy();
	});

	it('should not have overlays', () => {
		utable = new UTable(tableEl, { overlays: false });
		const { classOverlayLeft, classOverlayRight } = utable.options;
		expect(document.querySelector(`.${classOverlayLeft}`)).toBeFalsy();
		expect(document.querySelector(`.${classOverlayRight}`)).toBeFalsy();
	});

	/**
	 * Sticky
	 */

	it('should observe', () => {
		// Mock IntersectionObserver
		const mockIntersectionObserver = jest.fn((callback, options) => ({
			observe: jest.fn(),
			disconnect: jest.fn(),
			takeRecords: jest.fn(),
		}));
		(window as any).IntersectionObserver = mockIntersectionObserver;

		utable = new UTable(tableEl);
		const { classSticky } = utable.options;
		const callback = mockIntersectionObserver.mock.calls[0][0];

		// Simulate intersectionRatio < 1
		callback([{ intersectionRatio: 0.5 }]);
		expect(utable.trackHead?.classList.contains(classSticky)).toBe(true);

		// Simulate intersectionRatio = 1
		callback([{ intersectionRatio: 1 }]);
		expect(utable.trackHead?.classList.contains(classSticky)).toBe(false);
	});

	it('should not observe if IntersectionObserver is not supported', () => {
		delete (window as any).IntersectionObserver;
		utable = new UTable(tableEl);
		expect(utable.observer).toBeUndefined();
	});

	it('should not observe if option sticky is disabled', () => {
		const mockIntersectionObserver = jest.fn();
		(window as any).IntersectionObserver = mockIntersectionObserver;
		utable = new UTable(tableEl, { sticky: false });
		expect(mockIntersectionObserver).not.toHaveBeenCalled();
	});
});
