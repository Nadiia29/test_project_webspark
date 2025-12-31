document.addEventListener('DOMContentLoaded', function () {
	// ================== VIEW SWITCHER ==================
	const buttons = document.querySelectorAll('.cards-view__button');
	const listContainer = document.querySelector('.cards-list-container');
	const gridContainer = document.querySelector('.cards-grid-container');

	listContainer.style.display = 'block';
	gridContainer.style.display = 'none';

	buttons.forEach((btn) => {
		btn.classList.remove('is-active');
		btn.setAttribute('aria-pressed', 'false');
	});

	const listBtn = document.querySelector('.cards-view__button--list');
	if (listBtn) {
		listBtn.classList.add('is-active');
		listBtn.setAttribute('aria-pressed', 'true');
	}

	function setView(view) {
		if (view === 'grid') {
			gridContainer.style.display = 'grid';
			listContainer.style.display = 'none';
		} else {
			gridContainer.style.display = 'none';
			listContainer.style.display = 'block';
		}
	}

	buttons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const view = btn.dataset.view;

			buttons.forEach((b) => {
				b.classList.remove('is-active');
				b.setAttribute('aria-pressed', 'false');
			});

			btn.classList.add('is-active');
			btn.setAttribute('aria-pressed', 'true');

			setView(view);
		});
	});

	// ================== DATEPICKERS ==================
	function initDatepickers() {
		if (typeof flatpickr === 'undefined') {
			console.error('Flatpickr не знайдено! Підключіть бібліотеку.');
			return;
		}

		flatpickr.localize(flatpickr.l10ns.uk);

		const commonOptions = {
			dateFormat: 'd-m-Y',
			locale: 'uk',
			maxDate: 'today',
			allowInput: false,
			clickOpens: true,
			disableMobile: true,
			monthSelectorType: 'static',
			weekNumbers: false,
			placeholder: 'дд-мм-рррр',
		};

		try {
			const dateFrom = flatpickr('#date-from', {
				...commonOptions,
				defaultDate: new Date().fp_incr(-7),
				onClose(selectedDates) {
					if (selectedDates[0]) {
						dateTo.set('minDate', selectedDates[0]);
					}
				},
			});

			const dateTo = flatpickr('#date-to', {
				...commonOptions,
				defaultDate: 'today',
			});

			setupDateFiltering(dateFrom, dateTo);
		} catch (error) {
			console.error('Помилка ініціалізації datepicker:', error);
		}
	}

	// ================== DATE FILTER ==================
	function setupDateFiltering(dateFromPicker, dateToPicker) {
		const dateInputs = document.querySelectorAll('.datepicker');

		dateInputs.forEach((input) => {
			input.addEventListener('change', () => {
				applyDateFilter(dateFromPicker, dateToPicker);
			});
		});
	}

	function applyDateFilter(dateFromPicker, dateToPicker) {
		const fromDate = dateFromPicker.selectedDates[0];
		const toDate = dateToPicker.selectedDates[0];

		if (!fromDate || !toDate) {
			console.log('Оберіть обидві дати для фільтрації');
			return;
		}

		console.log('Фільтр від:', fromDate, 'до:', toDate);
	}

	document.querySelectorAll('.datepicker-clear').forEach((btn) => {
		btn.addEventListener('click', function () {
			const input = this.previousElementSibling;
			if (input && input._flatpickr) {
				input._flatpickr.clear();
			}
		});
	});

	initDatepickers();
});
