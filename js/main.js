const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const closeTemplate = $("#close");
let year, month;

let dragElem;
let selectedElem;

function eventRightClick(e) {
	let target = e.target;
	while (!target.classList.contains('grid-item') && !target.classList.contains('event')) {
		target = target.parentElement;
	}
	e.preventDefault();
	
	colorPicker = $("#color-picker");
	colorPicker.value = '#ff0000';
	colorPicker.style.top = e.pageY + 'px';
	colorPicker.style.left = e.pageX + 'px';
	colorPicker.click();

	colorPicker.oninput = f => {
		target.style.borderColor = f.target.value;
	}

	colorPicker.value = '#ff0000';
}

function eventDragStart(e) {
	dragElem = e.target;
}

function generateTable(year, month) {
	const toby = $('div#render-target');
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	weekdays.forEach(weekday => {
		const headerElem = document.createElement('div');
		headerElem.className = 'grid-item weekday';
		headerElem.textContent = weekday;
		toby.appendChild(headerElem);
	});
	let date = new Date(`${year}-${month}-01`);

	$("#month-year").textContent = months[date.getUTCMonth()] + ' ' + date.getUTCFullYear();

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

		elem.ondragover = e => {
			e.preventDefault();
		}
		elem.ondrop = e => {
			let dropTarget = e.target;
			while (!dropTarget.classList.contains('grid-item')) {
				dropTarget = dropTarget.parentElement;
			}
			if (dragElem === null || dropTarget === dragElem) { return; }
			const clone = dragElem.cloneNode(true);
			clone.oncontextmenu = eventRightClick;
			clone.ondragstart = eventDragStart;
			clone.querySelector('.text-button').onclick = e => { clone.remove() };
			dropTarget.appendChild(clone);
			dragElem = null;
		}

		toby.appendChild(elem);
		date.setUTCDate(date.getUTCDate() + 1);
	}
}

function addEvent(parent) {
	const event = document.createElement("div");
	event.className = 'event';
	event.draggable = true;

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

	event.oncontextmenu = eventRightClick;

	event.ondragstart = eventDragStart;
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

function changeMonth(delta) {
	if (confirm("Changing the month will clear the current calendar. Do you want to continue?")) {
		month += delta;
		if (month < 1) {
			month = 12;
			year -= 1;
		} else if (month > 12) {
			month = 1;
			year += 1;
		}
		$('div#render-target').innerHTML = '';
		generateTable(year, month);
	}
}


let d = new Date();
year = d.getUTCFullYear();
month = d.getUTCMonth()+1;

generateTable(year, month);
