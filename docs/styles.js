window.uTableStyles = [];

// Yellow
window.uTableStyles.push(`.utable .thead table {
	background-color: #f5c95e;
	border-radius: 6px 6px 0 0 ;
}

.utable .tbody tr:nth-child(odd) {
	background-color: #f8f8f9;
}`);

// Light blue
window.uTableStyles.push(`.utable .thead table {
	background-color: #e5f2ff;
	border-radius: 6px 6px 0 0 ;
}

.utable .tbody td,
.utable .tbody th {
	border-bottom: 1px solid #e0e0e0;
}`);

// Dark
window.uTableStyles.push(`.utable .thead table {
	background-color: #222;
	color: #fff;
}

.utable .tbody td,
.utable .tbody th {
	border: 1px solid #e0e0e0;
}`);

// Blu
window.uTableStyles.push(`.utable .thead table {
	background-color: #1089ff;
	color: #fff;
}

.utable .tbody td {
	border-bottom: 3px solid #f8f9fd;
}`);

// Grey, border, odd rows
window.uTableStyles.push(`.utable td,
.utable th {
	border: 1px solid #d8d8d8;
	padding: 9px 13px;
}

.utable th {
	text-align: center;
}

.utable .tbody tr:nth-child(odd) {
	background-color: #f4f4f4;
}`);
