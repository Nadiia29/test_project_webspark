document.addEventListener('DOMContentLoaded', function () {
	// ================== VIEW SWITCHER ==================
	const buttons = document.querySelectorAll('.cards-view__button');
	const listContainer = document.querySelector('.cards-list-container');
	const gridContainer = document.querySelector('.cards-grid-container');

	if (listContainer) listContainer.style.display = 'block';
	if (gridContainer) gridContainer.style.display = 'none';

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
		if (!listContainer || !gridContainer) return;
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

	// ================== ФУНКЦІЯ ОТРИМАННЯ ДАТИ З КАРТКИ ==================
	function getCardDate(card) {
		const dateElement = card.querySelector(
			'.card__block--date .card__block-title, .card__block--date time',
		);
		if (!dateElement) return null;

		const dateStr = dateElement.getAttribute('datetime') || dateElement.textContent;
		if (!dateStr) return null;

		const parts = dateStr.split('-');
		if (parts.length === 3) {
			const [day, month, year] = parts;
			const parsedDate = new Date(`${year}-${month}-${day}`);
			if (!isNaN(parsedDate.getTime())) {
				parsedDate.setHours(0, 0, 0, 0);
				return parsedDate;
			}
		}
		return null;
	}

	// ================== ФУНКЦІЯ ФІЛЬТРАЦІЇ ==================
	function applyDateFilter(fromPicker, toPicker) {
		const fromDate = fromPicker.selectedDates[0];
		const toDate = toPicker.selectedDates[0];

		const cards = document.querySelectorAll('.card');

		cards.forEach((card) => {
			const cardDate = getCardDate(card);

			if (!cardDate) {
				card.style.display = '';
				return;
			}

			let isVisible = true;

			if (fromDate && cardDate < fromDate) {
				isVisible = false;
			}
			if (toDate && cardDate > toDate) {
				isVisible = false;
			}

			card.style.display = isVisible ? '' : 'none';
		});
	}

	// ================== DATEPICKERS ==================
	function initDatepickers() {
		if (typeof flatpickr === 'undefined') {
			console.error('Flatpickr не знайдено! Підключіть бібліотеку.');
			return;
		}

		// flatpickr.localize(flatpickr.l10ns.en);

		const disableDates = function (date) {
			const minDate = new Date(2016, 7, 1);
			minDate.setHours(0, 0, 0, 0);
			return date < minDate;
		};

		const customLocale = {
			weekdays: {
				shorthand: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
				longhand: [
					'Sunday',
					'Monday',
					'Tuesday',
					'Wednesday',
					'Thursday',
					'Friday',
					'Saturday',
				],
			},
			months: {
				shorthand: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				],
				longhand: [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December',
				],
			},
			firstDayOfWeek: 0,
			rangeSeparator: ' to ',
			weekAbbreviation: 'Wk',
			scrollTitle: 'Scroll to increment',
			toggleTitle: 'Click to toggle',
			amPM: ['AM', 'PM'],
			yearAriaLabel: 'Year',
			monthAriaLabel: 'Month',
			hourAriaLabel: 'Hour',
			minuteAriaLabel: 'Minute',
		};

		const commonOptions = {
			dateFormat: 'd-m-Y',
			locale: customLocale,
			disable: [disableDates],
			maxDate: 'today',
			allowInput: false,
			clickOpens: true,
			disableMobile: true,
			monthSelectorType: 'static',
			weekNumbers: false,
			placeholder: 'dd-mm-yyyy',
		};

		try {
			const dateFromPicker = flatpickr('#date-from', {
				...commonOptions,
				onChange() {
					const fromDate = dateFromPicker.selectedDates[0];
					const toDate = dateToPicker.selectedDates[0];

					if (fromDate) {
						dateToPicker.set('minDate', fromDate);
						// Якщо дата в to менша за from, оновлюємо to
						if (toDate && toDate < fromDate) {
							dateToPicker.setDate(fromDate);
						}
					} else {
						dateToPicker.set('minDate', null);
					}
					applyDateFilter(dateFromPicker, dateToPicker);
				},
			});

			const dateToPicker = flatpickr('#date-to', {
				...commonOptions,
				defaultDate: '09-08-2016',
				onReady(selectedDates, dateStr, instance) {
					instance.config.firstDayOfWeek = 1;
					instance.redraw();
				},
				onChange() {
					// Якщо дата в to менша за from, корегуємо from
					const fromDate = dateFromPicker.selectedDates[0];
					const toDate = dateToPicker.selectedDates[0];
					if (fromDate && toDate && toDate < fromDate) {
						dateFromPicker.setDate(toDate);
					}
					applyDateFilter(dateFromPicker, dateToPicker);
				},
			});

			applyDateFilter(dateFromPicker, dateToPicker);
		} catch (error) {
			console.error('Помилка ініціалізації datepicker:', error);
		}
	}

	// ================== ВІДКРИТТЯ КАЛЕНДАРЯ ПО КЛІКУ НА ІКОНКУ ==================
	document.querySelectorAll('.calendar-icon-box').forEach((iconBox) => {
		iconBox.addEventListener('click', (e) => {
			e.stopPropagation();
			const wrapper = iconBox.closest('.datepicker-wrapper');
			if (wrapper) {
				const input = wrapper.querySelector('.datepicker');
				if (input && input._flatpickr) {
					input._flatpickr.open();
				}
			}
		});
	});

	// ================== ОЧИЩЕННЯ ДАТ  ==================
	document.querySelectorAll('.datepicker-clear').forEach((btn) => {
		btn.addEventListener('click', function () {
			const wrapper = this.closest('.datepicker-wrapper');
			if (!wrapper) return;

			const input = wrapper.querySelector('.datepicker');
			if (input && input._flatpickr) {
				input._flatpickr.clear();
				const fromPicker = document.querySelector('#date-from')._flatpickr;
				const toPicker = document.querySelector('#date-to')._flatpickr;
				applyDateFilter(fromPicker, toPicker);
			}
		});
	});

	initDatepickers();

	// ================== LOAD MORE ==================
	const loadMoreBtn = document.querySelector('.btn__load-more');

	loadMoreBtn?.addEventListener('click', () => {
		const listContainer = document.querySelector('.cards-list-container');
		const gridContainer = document.querySelector('.cards-grid-container');

		const isListVisible = listContainer && getComputedStyle(listContainer).display !== 'none';
		const activeContainer = isListVisible ? listContainer : gridContainer;

		if (!activeContainer) return;

		// Знаходимо останню картку в активному контейнері
		const lastCard = activeContainer.querySelector('.card:last-child');
		if (!lastCard) return;

		// Temporary imitation of loading data
		const newCard = lastCard.cloneNode(true);

		// Додаємо нову картку в кінець
		activeContainer.appendChild(newCard);

		// Оновлюємо фільтрацію (щоб нова картка теж фільтрувалась)
		const fromPicker = document.querySelector('#date-from')?._flatpickr;
		const toPicker = document.querySelector('#date-to')?._flatpickr;
		if (fromPicker && toPicker) {
			applyDateFilter(fromPicker, toPicker);
		}
	});
});
