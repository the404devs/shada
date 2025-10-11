const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const closeTemplate = $("#close");
let year, month;
let dragElem;
let selectedElem;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function eventRightClick(e) {
	let target = e.target;
	while (!target.classList.contains('event')) {
		target = target.parentElement;
	}
	e.preventDefault();


	colorPickerPopup = $("#color-picker-popup");

	// Ensure the popup is within the viewport
	const popupWidth = 222; // Approximate width of the popup
	const popupHeight = 100; // Approximate height of the popup
	const pageWidth = document.documentElement.clientWidth;
	const pageHeight = document.documentElement.clientHeight;	

	if (e.pageX + popupWidth > pageWidth) {
		colorPickerPopup.style.left = (e.pageX - popupWidth) + 'px';
	} else {
		colorPickerPopup.style.left = e.pageX + 'px';
	}

	if (e.pageY + popupHeight > pageHeight) {
		colorPickerPopup.style.top = (e.pageY - popupHeight) + 'px';
	} else {
		colorPickerPopup.style.top = e.pageY + 'px';
	}
	colorPickerPopup.style.visibility = 'visible';

	// Hide the popup if clicking outside of it
	document.onclick = f => {
		if (!f.target.classList.contains('color-swatch')) {
			colorPickerPopup.style.visibility = 'hidden';
		}
		document.onclick = null;
	}


	$$('#color-picker-popup .color-swatch').forEach(swatch => {
		swatch.onclick = f => {
			// target.style.borderLeftColor = getComputedStyle(f.target).backgroundColor;
			target.className = `event ${swatch.id}`;
			colorPickerPopup.style.visibility = 'hidden';
		}
	});

}

function eventDragStart(e) {
	dragElem = e.target;
}

function itemDoubleClick(e) {
	if (e.target === e.currentTarget) {
		addEvent(e.currentTarget);
	}
}

function itemDragOver(e) {
	e.preventDefault();
}

function itemOnDrop(e) {
	e.preventDefault();
	if (dragElem === null || e.target === dragElem || e.target.className != "grid-item") { return; }
	const clone = dragElem.cloneNode(true);
	clone.oncontextmenu = eventRightClick;
	clone.ondragstart = eventDragStart;
	clone.querySelector('.text-button').onclick = e => { clone.remove() };
	e.target.appendChild(clone);
	dragElem = null;
}

function generateTable(year, month) {
	const toby = $('div#render-target');
	

	WEEKDAYS.forEach(weekday => {
		const headerElem = document.createElement('div');
		headerElem.className = 'grid-item weekday';
		headerElem.textContent = weekday;
		toby.appendChild(headerElem);
	});
	let date = new Date(`${year}-${month}-01`);

	$("#month-year").textContent = MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();

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

		elem.ondblclick = itemDoubleClick;

		elem.ondragover = itemDragOver;
		elem.ondrop = itemOnDrop;

		toby.appendChild(elem);
		date.setUTCDate(date.getUTCDate() + 1);
	}
}

function addEvent(parent) {
	parent.appendChild(generateEvent("New Event", "Description", "red"));
}

function generateEvent(title, body, color) {
	const event = document.createElement("div");
	event.className = `event ${color}`;
	event.draggable = true;

	const group = document.createElement("div");
	group.className = 'group';
	event.appendChild(group);

	const top = document.createElement('span');
	top.className = 'top';
	top.contentEditable = true;
	top.innerHTML = title.replaceAll("\\n", "<br>");
	const bottom = document.createElement('span');
	bottom.className = 'bottom';
	bottom.contentEditable = true;
	bottom.innerHTML = body.replaceAll("\\n", "<br>");

	const deleteButton = document.createElement('span');
	deleteButton.classList.add("text-button");
	deleteButton.innerHTML = closeTemplate.outerHTML;
	deleteButton.setAttribute('title', 'Delete Event');
	deleteButton.setAttribute('data-html2canvas-ignore', 'true');
	deleteButton.onclick = (e) => { event.remove() };
	event.appendChild(deleteButton);

	group.appendChild(top);
	group.appendChild(bottom);
	event.oncontextmenu = eventRightClick;
	event.ondragstart = eventDragStart;

	return event;
}

function generatePDF() {
	$('.page-area').classList.add('borderless');
	$$('.event').forEach(event => {
		event.classList.add('hideBorder');
	});
	window.scrollTo(0, 0);
	html2pdf($("#pdf-content"), {
		margin:       0,
		filename:     `${$('span.title').textContent} - ${$('#month-year').textContent}.pdf`,
		image:        { type: 'jpeg', quality: 0.98 },
		html2canvas:  { scale: 3, width: 1632, height: 2112, imageTimeout: 0, logging: false, removeContainer: true, scrollX: 0, scrollY: 0 },
		jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
	});
	setTimeout(() => {
		$('.page-area').classList.remove('borderless');
		$$('.event').forEach(event => {
			event.classList.remove('hideBorder');
		});
	}, 3000);
}

function queryLocalStorage() {
	const list = $('#saved-calendars-list');
	list.innerHTML = '';
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		let keys = [];
		if (key.startsWith('calendar-json-')) {
			keys.push(key);
		}
		keys.sort((a,b) => {
			let yA = parseInt(a.split('-')[2]);
			let yB = parseInt(b.split('-')[2]);

			if (yA > yB) { return 1 }
			else if (yA < yB) { return -1 }
			else {
				let mA = parseInt(a.split('-')[3]);
				let mB = parseInt(b.split('-')[3]);
	
				if (mA > mB) { return 1 }
				else if (mA < mB) { return -1 }
				else { return 0 }
			}
		});
		
		keys.forEach(key => {
			const entry = document.createElement('a');
			const icon = document.createElement('i');
			icon.className = 'fas fa-calendar';
			entry.appendChild(icon);
			entry.className = 'saved-calendar-entry';
			let monthName = MONTHS[key.split('-')[3] - 1];
			let yearNum = key.split('-')[2];
			entry.appendChild(document.createTextNode(`${monthName} ${yearNum}`));
			entry.id = key;
			entry.onclick = () => {
				loadMonthFromLocalStorage(key);
			};
			list.appendChild(entry);
		});
	}
}

function generateJSON() {
	let data = {};
	$$('.grid-item:not(.weekday)').forEach(item => {
	    let num = parseInt(item.querySelector('span.num').textContent) -1;
	
	    data[num] = [];
	
	    item.querySelectorAll('.event').forEach(event => {
	        data[num].push({
	            title: event.querySelector('.top').innerHTML.replaceAll("<br>", "\n"),
	            body: event.querySelector('.bottom').innerHTML.replaceAll("<br>", "\n"),
	            class: event.className.split(' ')[1]
	        });
	    });
	});
	return data;
}

function saveMonthToLocalStorage() {
	let data = generateJSON();
	localStorage.setItem(`calendar-json-${year}-${month}`, JSON.stringify(data));
}

function loadMonthFromLocalStorage(key) {
	const toby = $('div#render-target');
	const data = JSON.parse(localStorage.getItem(key));

	year = parseInt(key.split('-')[2]);
	month = parseInt(key.split('-')[3]);
	let date = new Date(`${year}-${month}-01`);
	$("#month-year").textContent = MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();

	generateTable(year, month);

	const cells = $$('.grid-item:not(.weekday)');

	Object.keys(data).forEach(num => {
		const allEventsOnDate = data[num];
		const targetCell = cells[num];
		
		allEventsOnDate.forEach(event => {
			targetCell.appendChild(generateEvent(event.title, event.body, event.class));
		});
	});
}

function changeMonth(delta) {
	if ($$('.event').length > 0) {
		saveMonthToLocalStorage();
		queryLocalStorage();
	}
	// if (confirm("Changing the month will clear the current calendar. Do you want to continue?")) {
		month += delta;
		if (month < 1) {
			month = 12;
			year -= 1;
		} else if (month > 12) {
			month = 1;
			year += 1;
		}
		$('div#render-target').innerHTML = '';
		
		loadOrGenerateMonth();
	// }
}

function loadOrGenerateMonth() {
	const potentialKey = `calendar-json-${year}-${month}`
	if (localStorage[potentialKey]) {
		loadMonthFromLocalStorage(potentialKey);
	} else {
		generateTable(year, month);
	}
}

function showHelpPopup() {
	alert("Double-click on a date to add an event.\n\nDrag an event by it's handle to copy it to another date.\n\nRight-click on an event to change it's colour.")
}

window.onbeforeunload = () => {
	saveMonthToLocalStorage();
}

let d = new Date();
year = d.getUTCFullYear();
month = d.getUTCMonth()+1;
queryLocalStorage();
loadOrGenerateMonth();
