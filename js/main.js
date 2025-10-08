const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const closeTemplate = $("#close");
const month = 10;
const year = 2025;

let selectedElem;

function generateTable() {
	const toby = $('div#render-target');
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	weekdays.forEach(weekday => {
		const headerElem = document.createElement('div');
		headerElem.className = 'grid-item weekday';
		headerElem.textContent = weekday;
		toby.appendChild(headerElem);
	});
	let date = new Date(`${year}-${month}-01`);

	$("#month-year").textContent = date.toUTCString().split(' ')[2] + ' ' + date.getUTCFullYear();

	while (date.getUTCMonth() == month-1) {
		const elem = document.createElement('div');
		elem.className = 'grid-item';

		const num = document.createElement('span');
		num.className = 'num';
		num.textContent = date.getUTCDate();
		elem.appendChild(num);

		let index = date.getDay() + 2;
		if (index > 7) { index = 1 }

		elem.style.gridColumnStart = index;

		elem.ondblclick = e => {
			if (e.target === elem) {
				addEvent(elem);
			}
		}

		toby.appendChild(elem);
		date.setUTCDate(date.getUTCDate() + 1);
	}
}

function addEvent(parent) {
	const event = document.createElement("div");
	event.className = 'event';

	const group = document.createElement("div");
	group.className = 'group';
	event.appendChild(group);

	const top = document.createElement('span');
	top.className = 'top';
	top.contentEditable = true;
	top.textContent = 'New Event';
	const bottom = document.createElement('span');
	bottom.className = 'bottom';
	bottom.contentEditable = true;
	bottom.textContent = 'Description';

	const deleteButton = document.createElement('span');
	deleteButton.classList.add("text-button");
	deleteButton.innerHTML = closeTemplate.outerHTML;
	deleteButton.setAttribute('title', 'Delete Event');
	deleteButton.setAttribute('data-html2canvas-ignore', 'true');
	deleteButton.onclick = (e) => { event.remove() };
	event.appendChild(deleteButton);
	
	group.appendChild(top);
	group.appendChild(bottom);

	parent.appendChild(event);

	event.oncontextmenu = e => {
		e.preventDefault();
		colorPicker = $("#color-picker");
		colorPicker.style.top = e.pageY + 'px';
		colorPicker.style.left = e.pageX + 'px';
		colorPicker.click();

		colorPicker.oninput = e => {
			event.style.borderColor = e.target.value;
		}

		colorPicker.value = '#ff0000';
	}
}

function generatePDF() {
	html2pdf($("#pdf-content"), {
		margin:       0,
		filename:     'events-calendar.pdf',
		image:        { type: 'jpeg', quality: 0.98 },
		html2canvas:  { scale: 2, width: 1632, height: 2112 },
		jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
	  });
}



generateTable();
