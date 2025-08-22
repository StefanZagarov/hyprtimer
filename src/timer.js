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

setTimerButton.addEventListener('click', () => {
    const timerConcat = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;
    console.log(timerConcat);

    timer.textContent = timerConcat;

    timerForm.style.display = 'none';
    container.style.display = 'flex';
});