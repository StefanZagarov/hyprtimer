const container = document.getElementById('container');
const timerForm = document.getElementById('timerForm');
const form = document.querySelector('form');
const timer = document.getElementById('timer');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const setTimerButton = document.getElementById('setTimer');

timer.addEventListener('click', () => {
    container.style.display = 'none';

    const hours = timer.textContent.split(':')[0];
    const minutes = timer.textContent.split(':')[1];
    const seconds = timer.textContent.split(':')[2];

    form.elements.hours.value = hours;
    form.elements.minutes.value = minutes;
    form.elements.seconds.value = seconds;

    timerForm.style.display = 'flex';
});

form.elements.hours.addEventListener('input', () => {
    if (form.elements.hours.value.length > 2) {
        form.elements.hours.value = form.elements.hours.value.slice(0, 2);
    }
});

form.elements.minutes.addEventListener('input', () => {
    if (form.elements.minutes.value.length > 2) {
        form.elements.minutes.value = form.elements.minutes.value.slice(0, 2);
    }

    if (form.elements.minutes.value > 59) {
        form.elements.minutes.value = 59;
    }
});

form.elements.seconds.addEventListener('input', () => {
    if (form.elements.seconds.value.length > 2) {
        form.elements.seconds.value = form.elements.seconds.value.slice(0, 2);
    }

      if (form.elements.seconds.value > 59) {
        form.elements.seconds.value = 59;
    }
});


setTimerButton.addEventListener('click', () => {
    const timerConcat = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;


    timer.textContent = timerConcat;

    timerForm.style.display = 'none';
    container.style.display = 'flex';
});

function validateForm(form) {
    const hours = form.elements.hours.value;
    const minutes = form.elements.minutes.value;
    const seconds = form.elements.seconds.value;

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return false;
    }

    return true;
}