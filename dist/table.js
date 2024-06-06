export class Table {
	constructor({ el, options }) {
		if (!el) {
			return;
		}
		if (el instanceof Element) {
			el = [el];
		}
		else if (typeof el === 'string') {
			el = document.querySelectorAll(el);
		}
		this.options = Object.assign({}, options);
		console.log(el);
		Array.from(el).forEach((el) => {
			console.log(el);
		});
	}
}
