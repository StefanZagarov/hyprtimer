const container = document.getElementById('container');
const timerFormContainer = document.getElementById('timerForm');
const form = document.querySelector('form');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const clearButton = document.getElementById('clear');
const setTimerButton = document.getElementById('setTimer');

// Notes
// Sometimes when the time is set to 1 second, it counts down to -1:-1:-1, or if its 2 seconds it counts down to 00:00:00 and then -1:-1:-1

const timerState = {
    IDLE: `idle`,
    RUNNING: `running`,
    PAUSED: `paused`,
    FINISHED: `finished`,
};

let state = timerState.IDLE;
let timeSet = `00:00:00`;

let intervalId = null;

// ================================
// EVENT LISTENERS
// ================================

// Form
timerDisplay.addEventListener('click', handleTimerForm);
form.elements.hours.addEventListener('input', handleFormInput);
form.elements.minutes.addEventListener('input', handleFormInput);
form.elements.seconds.addEventListener('input', handleFormInput);

// Buttons
setTimerButton.addEventListener('click', handleSetTimer);
clearButton.addEventListener('click', handleResetTimer);
startButton.addEventListener('click', handleStartTimer);
stopButton.addEventListener('click', handleStopTimer);

// ================================
// FUNCTIONS
// ================================

function handleTimerForm() {
    container.style.display = 'none';

    const hours = timerDisplay.textContent.split(':')[0];
    const minutes = timerDisplay.textContent.split(':')[1];
    const seconds = timerDisplay.textContent.split(':')[2];

    form.elements.hours.value = hours;
    form.elements.minutes.value = minutes;
    form.elements.seconds.value = seconds;

    timerFormContainer.style.display = 'flex';
}

function handleFormInput(input) {
    const target = input.target.name;

    if (form.elements[target].value.length > 2) {
        form.elements[target].value = form.elements[target].value.slice(1);
    }

    if ((target === "minutes" || target === "seconds") && form.elements[target].value > 59) {
        console.log(form.elements[target].value);
        form.elements[target].value = 59;
    }

    if (form.elements[target].value.length < 2) {
        form.elements[target].value = '0' + form.elements[target].value;
    }
}

function handleSetTimer() {
    timeSet = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;

    timerDisplay.textContent = timeSet;

    timerFormContainer.style.display = 'none';
    container.style.display = 'flex';

    clearButton.textContent = 'Clear';
    enableButton(startButton, 'start');

    state = timerState.IDLE;

    if (timeSet === '00:00:00') {
        disableButton(startButton);
    }
}

function handleResetTimer() {
    clearInterval(intervalId);

    if (state == timerState.FINISHED) {
        state = timerState.IDLE;
        timerDisplay.textContent = timeSet;

        clearButton.textContent = 'Clear';
        hideButton(stopButton);
        showButton(startButton);
    }
    else if (state === timerState.IDLE) {
        timerDisplay.textContent = '00:00:00';
        disableButton(startButton);
    }
    else if (state === timerState.PAUSED) {
        timerDisplay.textContent = timeSet;
        state = timerState.IDLE;
        clearButton.textContent = 'Clear';
    }
}

function handleStartTimer() {
    if (timerDisplay.textContent === '00:00:00') return;

    hideButton(startButton);
    enableButton(stopButton, 'stop');
    showButton(stopButton);
    disableButton(clearButton);
    clearButton.textContent = 'Reset';

    let displayTime = timerDisplay.textContent;
    let endTime = `0`;

    let [hours, minutes, seconds] = [0, 0, 0];

    if (state == timerState.IDLE) {
        [hours, minutes, seconds] = timeSet.split(`:`).map(Number);
    }
    else {
        [hours, minutes, seconds] = displayTime.split(`:`).map(Number);
    }

    const setTimeInMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    endTime = Date.now() + setTimeInMilliseconds;

    state = timerState.RUNNING;

    countDown(endTime, displayTime);
}

function countDown(endTime, displayTime) {
    intervalId = setInterval(() => {
        if (state === timerState.FINISHED) return;

        displayTime = endTime - Date.now();
        console.log(endTime, displayTime);

        // Update the displayed time
        const hours = Math.floor(displayTime / 3600000);
        const minutes = Math.floor((displayTime % 3600000) / 60000);
        const seconds = Math.floor((displayTime % 60000) / 1000);

        timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (displayTime <= 0) {
            state = timerState.FINISHED;

            clearInterval(intervalId);

            disableButton(stopButton);
            clearButton.textContent = 'Reset';
            enableButton(clearButton, 'clear');
        }
    }, 1000);
}

function handleStopTimer() {
    state = timerState.PAUSED;

    clearInterval(intervalId);

    hideButton(stopButton);
    showButton(startButton);
    enableButton(clearButton, 'clear');
}

// ================================
// BUTTON MANAGEMENT FUNCTIONS
// ================================

function disableButton(button) {
    button.classList.add('disabled');
    button.disabled = true;
}

function enableButton(button, id) {
    button.classList.remove('disabled');
    button.disabled = false;
}

function hideButton(button) {
    button.style.display = 'none';
}

function showButton(button) {
    button.style.display = 'flex';
}