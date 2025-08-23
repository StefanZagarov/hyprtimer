const container = document.getElementById('container');
const timerForm = document.getElementById('timerForm');
const form = document.querySelector('form');
const timer = document.getElementById('timer');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const setTimerButton = document.getElementById('setTimer');

// Notes
// After a reset, the first second passes way too quickly

let timeSet = `00:00:00`;
let remainingTime = `00:00:00`;
let endTime = `0`;

let isRunning = false;
let hasPaused = false;
let hasFinished = false;

let intervalId = null;

timer.addEventListener('click', () => {
    container.style.display = 'none';

    const hours = timer.textContent.split(':')[0];
    const minutes = timer.textContent.split(':')[1];
    const seconds = timer.textContent.split(':')[2];

    form.elements.hours.value = hours;
    form.elements.minutes.value = minutes;
    form.elements.seconds.value = seconds;

    timerForm.style.display = 'flex';
    form.elements.minutes.focus();
});

form.elements.hours.addEventListener('input', () => {
    if (form.elements.hours.value.length > 2) {
        form.elements.hours.value = form.elements.hours.value.slice(1);
    }

    if (form.elements.hours.value.length < 2) {
        form.elements.hours.value = '0' + form.elements.hours.value;
    }
});

form.elements.minutes.addEventListener('input', () => {
    if (form.elements.minutes.value.length > 2) {
        form.elements.minutes.value = form.elements.minutes.value.slice(1);
    }

    if (form.elements.minutes.value > 59) {
        form.elements.minutes.value = 59;
    }

    if (form.elements.minutes.value.length < 2) {
        form.elements.minutes.value = '0' + form.elements.minutes.value;
    }
});

form.elements.seconds.addEventListener('input', () => {
    if (form.elements.seconds.value.length > 2) {
        form.elements.seconds.value = form.elements.seconds.value.slice(1);
    }

    if (form.elements.seconds.value > 59) {
        form.elements.seconds.value = 59;
    }

    if (form.elements.seconds.value.length < 2) {
        form.elements.seconds.value = '0' + form.elements.seconds.value;
    }
});

setTimerButton.addEventListener('click', () => {
    const timerConcat = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;

    timeSet = timerConcat;

    timer.textContent = timerConcat;

    timerForm.style.display = 'none';
    container.style.display = 'flex';
});

resetButton.addEventListener('click', () => {
    clearInterval(intervalId);

    if (!isRunning && !hasPaused) {
        timer.textContent = '00:00:00';
    }

    if (!isRunning && hasPaused) {
        timer.textContent = timeSet;

        hasPaused = false;
    }
});

startButton.addEventListener('click', () => {
    if (timer.textContent === '00:00:00') return;

    isRunning = true;

    startButton.style.display = 'none';
    stopButton.style.display = 'flex';

    if (!hasPaused) {
        const [hours, minutes, seconds] = timeSet.split(`:`).map(Number);

        const setTimeInMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
        endTime = Date.now() + setTimeInMilliseconds;
    }
    else {
        endTime = Date.now() + remainingTime;
    }

    hasPaused = false;
    intervalId = setInterval(() => {
        if (!isRunning) return;

        remainingTime = endTime - Date.now();

        // Update the displayed time
        const hours = Math.floor(remainingTime / 3600000);
        const minutes = Math.floor((remainingTime % 3600000) / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        timer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (remainingTime <= 0) {
            isRunning = false;
            hasFinished = true;

            // Gray out the stop button
            stopButton.classList.remove('stop');
            stopButton.classList.add('disabled');
        }
    }, 1000);
});

stopButton.addEventListener('click', () => {
    isRunning = false;
    hasPaused = true;

    clearInterval(intervalId);

    stopButton.style.display = 'none';
    startButton.style.display = 'flex';
});

