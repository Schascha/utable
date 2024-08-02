import { UTable } from './utable';

describe('UTable', () => {
	let tableEl: HTMLTableElement;
	let utable: UTable;

	beforeEach(() => {
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
	});

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
		expect(() => new UTable('not-found')).toThrow();
	});

	it('should destroy', () => {
		utable = new UTable(tableEl);
		utable.destroy();
		expect(
			document.querySelector(`.${utable.options.classWrapper}`)
		).toBeFalsy();
	});

	it('should use render method on update', () => {
		utable = new UTable(tableEl);
		const spy = jest.spyOn(utable, 'render');
		utable.destroy();
		utable.update();
		expect(spy).toHaveBeenCalled();
	});

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

	it('should not observe', () => {
		const mockIntersectionObserver = jest.fn();
		(window as any).IntersectionObserver = mockIntersectionObserver;
		utable = new UTable(tableEl, { sticky: false });
		expect(mockIntersectionObserver).not.toHaveBeenCalled();
	});
});
