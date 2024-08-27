import { createElement, setStyles, scrollTo } from './utils';

describe('createElement', () => {
	let parent: HTMLElement;

	beforeEach(() => {
		// Create a parent element for testing
		parent = document.createElement('div');
		document.body.appendChild(parent);
	});

	afterEach(() => {
		// Clean up the parent element after each test
		document.body.removeChild(parent);
	});

	it('should create an element with a tag', () => {
		const el = createElement('div');
		expect(el.tagName).toBe('DIV');
	});

	it('should create an element with a class name', () => {
		const el = createElement('div', { className: 'test' });
		expect(el.className).toBe('test');
	});

	it('should append the element to the parent', () => {
		const el = createElement('div', { parent });
		expect(parent.contains(el)).toBe(true);
	});

	it('should prepend the element to the parent', () => {
		createElement('div', { parent });
		const el = createElement('div', { parent, insertMethod: 'prepend' });
		expect(parent.firstChild).toBe(el);
	});

	it('should create an element with children', () => {
		const child1 = document.createElement('span');
		const child2 = document.createElement('span');
		const el = createElement('div', { children: [child1, child2] });
		expect(el.children.length).toBe(2);
		expect(el.children[0]).toBe(child1);
		expect(el.children[1]).toBe(child2);
	});

	it('should insert the element before the parent', () => {
		const sibling = document.createElement('div');
		parent.appendChild(sibling);
		const el = createElement('div', { parent, insertMethod: 'before' });
		expect(parent.previousSibling).toBe(el);
	});

	it('should insert the element after the parent', () => {
		const sibling = document.createElement('div');
		parent.appendChild(sibling);
		const el = createElement('div', { parent, insertMethod: 'after' });
		expect(parent.nextSibling).toBe(el);
	});
});

describe('setStyles', () => {
	it('should set styles to an element', () => {
		const el = document.createElement('div');
		setStyles(el, { color: 'red', fontSize: '16px' });
		expect(el.style.color).toBe('red');
		expect(el.style.fontSize).toBe('16px');
	});

	it('should set styles to an array of elements', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		setStyles([el1, el2], { color: 'red', fontSize: '16px' });
		expect(el1.style.color).toBe('red');
		expect(el1.style.fontSize).toBe('16px');
		expect(el2.style.color).toBe('red');
		expect(el2.style.fontSize).toBe('16px');
	});
});

describe('scrollTo', () => {
	it('should scroll to an element with smooth behavior', () => {
		const el = document.createElement('div');
		el.scrollTo = jest.fn();
		scrollTo(el, { top: 100 });
		expect(el.scrollTo).toHaveBeenCalledWith({
			behavior: 'smooth',
			top: 100,
		});
	});
});
