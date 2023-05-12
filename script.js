'use strict';

const dateInput1 = document.querySelector('#first-date');
const dateInput2 = document.querySelector('#second-date');
const calendar = document.querySelector('.calendar-wrapper');
const presets = document.querySelector('.presets');
const results = document.querySelector('#results');
const calculateButton = document.querySelector('#calculate');
const days = document.querySelector('#days');
const duration = document.querySelector('#duration');
const resultsList = document.querySelector('.results-list');
const errorMessage = document.querySelector('.error-message');
const resultsHeader = document.querySelector('#results-header');
const regex = /[0-9.]/;
const sep = '.';

const messages = {
    invalidDates: `Invalid dates`,
    secondDate: `Second date should be after first`,
};

const validationLimits = {
    min: 8,
    max: 10,
};

const datesState = {
    firstDate: null,
    secondDate: null,
    firstDateValid: null,
    secondDateValid: null,
    datesValid: null,
    isDatesValid() {
        this.datesValid = this.firstDateValid && this.secondDateValid;
    },
};

const durationModifier = {
    seconds: 60 * 60 * 24,
    minutes: 60 * 24,
    hours: 24,
    days: 1,
};

const dayTypes = {
    all: [0, 1, 2, 3, 4, 5, 6],
    work: [1, 2, 3, 4, 5],
    weekends: [6, 0],
};

init();

loadDateFromLS();

function init() {
    calendar.addEventListener('keypress', enterCharactersToDateInputs);
    calendar.addEventListener('keyup', handleInput);
    calendar.addEventListener('change', validateInput);
    presets.addEventListener('click', applyPreset);
    calculateButton.addEventListener('click', calculateResults);
}

// event delegation
function enterCharactersToDateInputs(e) {
    if (!e.target.classList.contains('date-input')) {
        return;
    }

    const key = e.key;
    if (
        !regex.test(key) ||
        (e.target.value.length >= validationLimits.max &&
            e.target.selectionEnd - e.target.selectionStart === 0)
    ) {
        e.preventDefault();
    }
}

function handleInput(e) {
    if (e.target.value.length < validationLimits.min) {
        return;
    }
    validateInput(e.target);
}

function validateInput(input) {
    const node = input.target ? input.target : input;

    if (!node.classList.contains('date-input')) {
        return;
    }

    if (!isDateValid(node.value)) {
        node.style.backgroundColor = '#FFE5E0';
        node.style.borderColor = '#731510';
        updateDatesState(node.dataset.input, false);
        setSecondInputState(datesState.firstDateValid);
    } else {
        node.style.backgroundColor = '#B2D5D9';
        node.style.borderColor = '#275459';
        updateDatesState(node.dataset.input, true, node.value);
        setSecondInputState(datesState.firstDateValid);
        errorMessage.style.display = 'none';
    }
}

function setSecondInputState(state) {
    dateInput2.disabled = !state;
}

function isDateValid(date) {
    return !isNaN(new Date(date).getTime());
}

function applyPreset(e) {
    if (!datesState.firstDateValid) {
        return;
    }
    const presetType = e.target.dataset.preset;
    const date = new Date(datesState.firstDate);
    let updatedDate;

    if (presetType === 'week') {
        updatedDate = new Date(date.setDate(date.getDate() + 7));
    }
    if (presetType === 'month') {
        updatedDate = new Date(date.setMonth(date.getMonth() + 1));
    }

    const formattedDate = `${
        updatedDate.getMonth() + 1
    }${sep}${updatedDate.getDate()}${sep}${updatedDate.getFullYear()}`;

    dateInput2.value = formattedDate;
    validateInput(dateInput2);
}

function updateDatesState(id, state, value) {
    datesState[`${id}Valid`] = state;

    if (value) {
        datesState[`${id}`] = new Date(value).getTime();
    }

    datesState.isDatesValid();
}

function calculateResults() {
    if (!datesState.datesValid) {
        displayErrorMessage(messages.invalidDates);
        return;
    }

    if (datesState.firstDate > datesState.secondDate) {
        displayErrorMessage(messages.secondDate);
        return;
    }

    getSpecificDaysBetweenDates(datesState.firstDate, datesState.secondDate);
}

function displayErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'flex';
}

function getSpecificDaysBetweenDates(firstDate, secondDate) {
    const date1 = new Date(firstDate);
    const date2 = new Date(secondDate);
    const durationValue = duration.value;

    let delta = 0;

    while (date1 < date2) {
        date1.setDate(date1.getDate() + 1);
        if (dayTypes[days.value].includes(date1.getDay())) {
            delta++;
        }
    }

    const entry = `Difference between dates in ${durationValue} is: ${
        delta * durationModifier[durationValue]
    }`;
    addResult(entry);
    addResultToLocaleStorage(entry);
}

function addResult(res, direction = 'start') {
    const newLi = document.createElement('li');
    newLi.textContent = res;

    if (direction === 'start') {
        resultsList.prepend(newLi);
    }
    if (direction === 'end') {
        resultsList.append(newLi);
    }
    displayeResultsHeader();
}

function displayeResultsHeader() {
    if (resultsHeader.style.display !== 'block') {
        resultsHeader.style.display = 'block';
    }
}

function addResultToLocaleStorage(res) {
    let results = JSON.parse(localStorage.getItem('results'));

    results.unshift(res);

    localStorage.setItem('results', JSON.stringify(results.slice(0, 10)));
}

function loadDateFromLS() {
    let results;
    if (localStorage.getItem('results') === null) {
        results = [];
        localStorage.setItem('results', JSON.stringify(results));
    } else {
        results = JSON.parse(localStorage.getItem('results'));
        results.forEach((res) => {
            addResult(res, 'end');
        });
    }
    if (results.length !== 0) {
        displayeResultsHeader();
    }
}
