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
	sessionInput = $("#session-input");
	sessionRoundel = target.querySelector("span.session-num");

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
	sessionInput.value = parseInt(sessionRoundel.textContent);

	// Hide the popup if clicking outside of it
	document.onclick = f => {
		// console.log(f.target);
		if (!f.target.classList.contains('color-swatch') && !f.target.classList.contains('session-input')) {
			colorPickerPopup.style.visibility = 'hidden';
			sessionInput.onchange = null;
			sessionInput.value = "";
			document.onclick = null;
		}
	}

	sessionInput.onchange = f => {
		sessionRoundel.textContent = sessionInput.value;
		if (sessionRoundel.textContent === "0" || sessionRoundel.textContent === "") {
			sessionRoundel.classList.add("invisible");
		} else {
			sessionRoundel.classList.remove("invisible");
		}
	}
	sessionInput.onwheel = f => {
		f.preventDefault();
		if (f.deltaY < 0) {
			sessionInput.stepUp();
		} else {
			sessionInput.stepDown();
		}
		sessionRoundel.textContent = sessionInput.value;
		if (sessionRoundel.textContent === "0" || sessionRoundel.textContent === "") {
			sessionRoundel.classList.add("invisible");
		} else {
			sessionRoundel.classList.remove("invisible");
		}
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

function legendDoubleClick(e) {
	if (e.target === e.currentTarget) {
		addLegend(e.currentTarget);
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

function resetTable() {
	const toby = $('div#render-target');
	toby.innerHTML = '';
	WEEKDAYS.forEach(weekday => {
		const headerElem = document.createElement('div');
		headerElem.className = 'grid-item weekday';
		headerElem.textContent = weekday;
		toby.appendChild(headerElem);
	});
}

function generateTable(year, month) {
	const toby = $('div#render-target');
	
	resetTable();
	let date = new Date(`${year}-${month}-01`);

	$("#month-year").textContent = MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();

	while (date.getUTCMonth() == month-1) {
		const elem = document.createElement('div');
		elem.className = 'grid-item';

		const num = document.createElement('span');
		num.className = 'num';
		num.textContent = date.getUTCDate();
		elem.appendChild(num);

		let index = date.getUTCDay() + 1;
		if (index > 7) { index = 1 }

		elem.style.gridColumnStart = index;

		elem.ondblclick = itemDoubleClick;

		elem.ondragover = itemDragOver;
		elem.ondrop = itemOnDrop;

		toby.appendChild(elem);
		date.setUTCDate(date.getUTCDate() + 1);
	}
	addLegendBox();
}

function addLegendBox() {
	const legend = document.createElement('div');
	legend.className = 'grid-item legend';

	const qrbox = document.createElement('div');
	qrbox.className = 'grid-item qrbox';

	const registered = document.createElement('span');
	registered.className = 'num';
	registered.textContent = 'Registered Programs:';
	registered.ondblclick = legendDoubleClick;
	legend.appendChild(registered);

	const dropin = document.createElement('span');
	dropin.className = 'num';
	dropin.textContent = 'Drop-In Programs:';
	dropin.ondblclick = legendDoubleClick;
	legend.appendChild(dropin);

	const qrhead = document.createElement('span');
	qrhead.className = 'num';
	qrhead.textContent = 'Program Descriptions & Registration Info:';
	qrbox.appendChild(qrhead);

	const qrimg = document.createElement('div');
	// qrimg.src = './assets/makerspace-events-trans.png';

	let startDate = `${year}-${month.toString().padStart(2,'0')}-01`;
	let endDate = `${year}-${(month+1).toString().padStart(2,'0')}-01`;
	if (month == 12) {endDate = `${year+1}-01-01`;}
	const qrcode = new QRCode(qrimg, {
		text: `https://wsplibrary.bibliocommons.com/v2/events?q=Makerspace&startDate=${startDate}&endDate=${endDate}`,
		width: 150,
		height: 150,
		colorLight: '#f4f7fa',
		colorDark: 'black',
		correctLevel: QRCode.CorrectLevel.L
	});
	qrbox.appendChild(qrimg);
	
	const lastWeekday = $$('div.grid-item.weekday')[6];
	const firstDay = $('div.grid-item:not(.weekday)');
	const lastDay = $('div.grid-item:not(:has(~div.grid-item))');

	if (firstDay.style.gridColumnStart != 1) {
		// Legend at top left
		legend.style.gridColumnStart = 1;
		lastWeekday.after(legend);

		if (firstDay.style.gridColumnStart > 3) {
			qrbox.style.gridColumnStart == 2;
			legend.after(qrbox);
		} else {
			qrbox.style.gridColumnStart = 7;
			lastDay.after(qrbox);
		}
	} else if (lastDay.style.gridColumnStart === 7) {
		// Legend at bottom left
		legend.style.gridColumnStart = 1;
		lastDay.after(legend);

		qrbox.style.gridGolumnStart = 2;
		legend.after(qrbox);
	} else {
		// Legend at bottom right
		legend.style.gridColumnStart = 7;
		lastDay.after(legend);

		if (lastDay.style.gridColumnStart != 6) {
			qrbox.style.gridColumnStart = 6;
			lastDay.after(qrbox);
		} else {
			console.log("unable to place qr at bottom");
		}
	}
}

function addEvent(parent) {
	parent.appendChild(generateEvent("New Event", "Description", "red", "0"));
}

function addLegend(parent) {
	parent.after(generateEvent("Event Type", "", "red", "0"));
}

function generateEvent(title, body, color, session) {
	const event = document.createElement("div");
	event.className = `event ${color}`;
	event.draggable = true;

	const group = document.createElement("div");
	group.className = 'group';
	event.appendChild(group);

	const top = document.createElement('span');
	top.className = 'top';
	top.contentEditable = true;
	top.innerHTML = title.replaceAll("\n", "<br>");
	group.appendChild(top);

	if (body) {
		const bottom = document.createElement('span');
		bottom.className = 'bottom';
		bottom.contentEditable = true;
		bottom.innerHTML = body.replaceAll("\n", "<br>");
		group.appendChild(bottom);
	}
	
	const deleteButton = document.createElement('span');
	deleteButton.classList.add("text-button");
	deleteButton.innerHTML = closeTemplate.outerHTML;
	deleteButton.setAttribute('title', 'Delete Event');
	deleteButton.setAttribute('data-html2canvas-ignore', 'true');
	deleteButton.onclick = (e) => { event.remove(); saveMonthToLocalStorage(); };
	event.appendChild(deleteButton);
	event.oncontextmenu = eventRightClick;
	event.ondragstart = eventDragStart;

	const sessionRoundel = document.createElement('span');
	sessionRoundel.classList.add('session-num');
	sessionRoundel.textContent = session;
	if (session === "0" || session === "" || session === null) {
		sessionRoundel.classList.add("invisible");
	}
	event.appendChild(sessionRoundel);

	return event;
}

function generatePDF() {
	$('.page-area').classList.add('borderless');
	$$('.session-num').forEach(roundel => {
		roundel.classList.add('adjust');
	});
	$$('.group').forEach(group => {
		group.classList.add('adjust');
	});
	$('.month-year').classList.add('adjust');
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
		$$('.session-num').forEach(roundel => {
			roundel.classList.remove('adjust');
		});
		$$('.group').forEach(group => {
			group.classList.remove('adjust');
		});
		$('.month-year').classList.remove('adjust');
	}, 3000);
}

function queryLocalStorage() {
	const list = $('#saved-calendars-list');
	list.innerHTML = '';
	let keys = [];
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key.startsWith('calendar-json-')) {
			keys.push(key);
		}
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

function generateJSON() {
	let data = {};
	$$('.grid-item:not(.weekday):not(.legend):not(.qrbox)').forEach(item => {
	    let num = parseInt(item.querySelector('span.num').textContent) - 1;
	    data[num] = [];
	    item.querySelectorAll('.event').forEach(event => {
	        data[num].push({
	            title: event.querySelector('.top').innerHTML.replaceAll("<br>", "\n"),
	            body: event.querySelector('.bottom').innerHTML.replaceAll("<br>", "\n"),
	            class: event.className.split(' ')[1],
				session: event.querySelector('span.session-num').textContent
	        });
	    });

		data['year'] = year;
		data['month'] = month;
	});

	const legend = $("div.grid-item.legend");
	data['legend'] = {};
	data['legend']['registered'] = legendGobbler($("div.grid-item.legend span.num:first-of-type"));
	data['legend']['dropin'] = legendGobbler($("div.grid-item.legend span.num:last-of-type"));
	
	return data;
}

function legendGobbler(startElem) {
	let nextSibling = startElem.nextElementSibling;
	let arr = [];
    while (nextSibling) {
        if (nextSibling.nodeName.toLowerCase() === "span") {
            break; 
        }
        arr.push({
			title: nextSibling.querySelector('.top').innerHTML.replaceAll("<br>", "\n"),
			class: nextSibling.className.split(' ')[1]
		});
        nextSibling = nextSibling.nextElementSibling;
    }
	return arr;
}

function exportJSON() {
	const file = new Blob([JSON.stringify(generateJSON())], { type: "application/json" }); // Create a new Blob with the config.
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    const fileName = `calendar-${year}-${month}`; // Ask the user for a name for the file, the default is the current timestamp.
    if (fileName) {
        a.download = fileName + ".json";
        document.body.appendChild(a); // Append the link to the body.
        a.click(); // Click it.
        document.body.removeChild(a); //Remove it
        URL.revokeObjectURL(a.href); //Get rid of the url to our file
    }
}

function importTrigger() {
    $("#file-import").click();
}

function importJSON() {
	const file = $('input#file-import')['files'][0]; // Get the file from the hidden file input.
	const reader = new FileReader();
	reader.onload = function() {
		const data = JSON.parse(reader.result);
		alert(`Loaded calendar-json-${data.year}-${data.month}`);
		localStorage.setItem(`calendar-json-${data.year}-${data.month}`, JSON.stringify(data));
		resetTable();
		loadMonthFromLocalStorage(`calendar-json-${data.year}-${data.month}`);
	}
	reader.readAsText(file);	
	$('input#file-import').value = "";
}

function saveMonthToLocalStorage() {
	let data = generateJSON();
	localStorage.setItem(`calendar-json-${year}-${month}`, JSON.stringify(data));
}

function loadMonthFromLocalStorage(key) {
	resetTable();
	const toby = $('div#render-target');
	const data = JSON.parse(localStorage.getItem(key));

	year = parseInt(key.split('-')[2]);
	month = parseInt(key.split('-')[3]);
	let date = new Date(`${year}-${month}-01`);
	$("#month-year").textContent = MONTHS[date.getUTCMonth()] + ' ' + date.getUTCFullYear();

	generateTable(year, month);

	const cells = $$('.grid-item:not(.weekday):not(.legend):not(.qrbox)');

	Object.keys(data).forEach(num => {
		if (typeof data[num] === 'object' && num != 'legend') {
			const allEventsOnDate = data[num];
			const targetCell = cells[num];
			
			allEventsOnDate.forEach(event => {
				targetCell.appendChild(generateEvent(event.title, event.body, event.class, event.session));
			});
		}
	});
	if (data.legend) {
		const registeredHead = $("div.grid-item.legend span.num:first-of-type");
		data.legend.registered.reverse().forEach(entry => {
			registeredHead.after(generateEvent(entry.title, '', entry.class, ''));
		});
	
		const dropinHead = $("div.grid-item.legend span.num:last-of-type");
		data.legend.dropin.reverse().forEach(entry => {
			dropinHead.after(generateEvent(entry.title, '', entry.class, ''));
		});
	}
}

function changeMonth(delta) {
	if ($$('.event').length > 0) {
		saveMonthToLocalStorage();
	} else {
		localStorage.removeItem(`calendar-json-${year}-${month}`);
	}
	queryLocalStorage();
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
	const potentialKey = `calendar-json-${year}-${month}`;
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
