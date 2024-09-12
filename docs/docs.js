// Form
const buttons = document.getElementById('buttons');
const overlays = document.getElementById('overlays');
const width = document.getElementById('width');
const styleButton = document.getElementById('style');
const back = document.getElementById('back');
const code = document.getElementById('code');

// Append dynamic style tag
const styleEl = document.createElement('style');
styleEl.id = 'dynamicStyle';
document.head.appendChild(styleEl);

// Styles
let style = window.uTableStyles[0]
const store = [style];
const memory = [style];
let storeIndex = 0;
setStyle(style);

// UTable
const uTable = window.UTable.UTable; // Module is namespaced in UMD build
const tables = Array.from(document.querySelectorAll('table')).map((el) => ({
	el,
	table: new uTable(el, {
		onClickButtonLeft: (e) => {
			console.log('Left button clicked', e);
		},
		onClickButtonRight: (e) => {
			console.log('Right button clicked', e);
		},
		onScrollend: (e) => {
			console.log('Scrolled', e);
		},
	}),
}));
const options = {};

// Events
function update() {
	tables.forEach(({ el, table }) => {
		el.dataset.options = JSON.stringify(options);
		table.destroy();
		table.render();
	});
}

function setStyle(style) {
	back.disabled = storeIndex <= 0;
	styleEl.textContent = style;
	code.textContent = style;
}

function next() {
	if (store.length && ++storeIndex < store.length) {
		style = store[storeIndex];
		setStyle(style);
	} else {
		generate();
	}
	update();
}

function prev() {
	if (storeIndex) {
		style = store[--storeIndex];
		setStyle(style);
		update();
	}
}

function generate() {
	// Reset memory
	if (memory.length === window.uTableStyles.length) {
		memory.splice(0, Math.floor(memory.length / 2));
	}
	// Random style
	const styles = window.uTableStyles.filter(
		(style) => !memory.includes(style)
	);
	style = styles[Math.floor(Math.random() * styles.length)];
	memory.push(style);
	store.push(style);
	storeIndex = store.length - 1;
	setStyle(style);
}

buttons.addEventListener('change', (e) => {
	options.buttons = e.target.checked;
	update();
});

overlays.addEventListener('change', (e) => {
	options.overlays = e.target.checked;
	update();
});

width.addEventListener('change', (e) => {
	options.width = e.target.checked ? 'fixed' : 'auto';
	update();
});

styleButton.addEventListener('click', () => {
	next();
});

back.addEventListener('click', () => {
	prev();
});
