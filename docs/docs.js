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
const styles = window.uTableStyles;
let styleIndex = 0;
let style = styles[styleIndex]
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
	console.log('Updated', styleIndex, style);
	tables.forEach(({ el, table }) => {
		el.dataset.options = JSON.stringify(options);
		table.destroy();
		table.render();
	});
}

function setStyle(style) {
	styleEl.textContent = style;
	code.textContent = style;
}

function next() {
	styleIndex = (styleIndex + 1) % styles.length;
	style = styles[styleIndex];
	setStyle(style);
	update();
}

function prev() {
	styleIndex = (styleIndex - 1 + styles.length) % styles.length;
	style = styles[styleIndex];
	setStyle(style);
	update();
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
