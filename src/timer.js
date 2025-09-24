// === DOM ELEMENTS ===
// Get references to key UI elements for manipulation
const container = document.getElementById('container');
const timerFormContainer = document.getElementById('timerForm');
const form = document.querySelector('form');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const clearButton = document.getElementById('clear');
const setTimerButton = document.getElementById('setTimer');
const timerModeBtns = document.querySelectorAll('.toggle-option');
const highlingt = document.getElementById('highlight');

// Notes
// TODO CURRENT: Instant doesnt count the seconds normally, it slows down then speeds up
// TODO CURRENT: Implement a toggle between the two types of countdown, one for the current and one to take the current time as base second, check the chat with Qwen
// TODO: Add transition time for the hover effects
// Suggestion: Add a small text saying the exact time (in HH:MM:SS) when the timer has stopped

// === TIMER STATE MACHINE ===
// Defines all possible states the timer can be in
// This prevents invalid transitions (e.g., starting a finished timer)
const timerState = {
    IDLE: `idle`,      // Timer set but not running
    RUNNING: `running`, // Actively counting down
    PAUSED: `paused`,   // Stopped mid-countdown
    FINISHED: `finished` // Countdown reached zero
};

// Current state of the timer (starts idle)
let state = timerState.IDLE;

// Stores the original time the user set (e.g., "01:30:00")
// Used to reset or restart from the same duration
let timeSet = `00:00:00`;

// Holds a reference to the cleanup function returned by countDown()
// Allows safe cancellation of the current countdown
let cancelCountdown = null;

// Store the timer mode
let currentTimerMode = timerModeBtns[0].dataset.mode;

// ================================
// EVENT LISTENERS
// ================================

// === FORM INTERACTIONS ===
// Clicking the timer display opens the edit form
timerDisplay.addEventListener('click', handleTimerForm);

// Input fields update in real-time and validate input
form.elements.hours.addEventListener('input', handleFormInput);
form.elements.minutes.addEventListener('input', handleFormInput);
form.elements.seconds.addEventListener('input', handleFormInput);

// === BUTTON CLICK HANDLERS ===
// Apply actions when buttons are clicked
setTimerButton.addEventListener('click', handleSetTimer);   // Save edited time
clearButton.addEventListener('click', handleResetTimer);    // Reset timer based on current state
startButton.addEventListener('click', handleStartTimer);    // Start or resume countdown
stopButton.addEventListener('click', handleStopTimer);      // Pause the running timer

timerModeBtns.forEach(button => {
    button.addEventListener('click', handleTimerMode);
});
// ================================
// FUNCTIONS
// ================================

function handleTimerMode(e) {
    const btn = e.currentTarget;

    if (btn.dataset.mode === currentTimerMode) return;

    timerModeBtns.forEach(button => {
        const isActive = button.dataset.mode === btn.dataset.mode;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive);
    });

    highlight.style.width = `${btn.offsetWidth + 1}px`;
    highlight.style.transform = `translateX(${btn.offsetLeft}px)`;

    currentTimerMode = btn.dataset.mode;
}

/**
 * Opens the time edit form when the user clicks the timer display.
 * Pre-fills the form with the current displayed time.
 */
function handleTimerForm() {
    container.style.display = 'none'; // Hide main timer view

    // Extract current time from display (HH:MM:SS)
    const hours = timerDisplay.textContent.split(':')[0];
    const minutes = timerDisplay.textContent.split(':')[1];
    const seconds = timerDisplay.textContent.split(':')[2];

    // Populate form fields
    form.elements.hours.value = hours;
    form.elements.minutes.value = minutes;
    form.elements.seconds.value = seconds;

    // Show the form
    timerFormContainer.style.display = 'flex';
}

/**
 * Handles real-time input validation in the time form.
 * - Limits input to 2 digits
 * - Caps minutes/seconds at 59
 * - Auto-pads single-digit values with a leading zero
 */
function handleFormInput(input) {
    const target = input.target.name; // Which field changed: hours, minutes, seconds

    // Prevent more than 2 digits
    if (form.elements[target].value.length > 2) {
        form.elements[target].value = form.elements[target].value.slice(1);
    }

    // Ensure minutes and seconds don't exceed 59
    if ((target === "minutes" || target === "seconds") && form.elements[target].value > 59) {
        form.elements[target].value = 59;
    }

    // Auto-pad with '0' if single digit
    if (form.elements[target].value.length < 2) {
        form.elements[target].value = '0' + form.elements[target].value;
    }
}

/**
 * Saves the time from the form and updates the display.
 * Shows/hides UI elements appropriately.
 * Enables start/clear buttons unless time is zero.
 */
function handleSetTimer() {
    // Save the formatted time string
    timeSet = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;

    // Update the main display
    timerDisplay.textContent = timeSet;

    // Switch back to main view
    timerFormContainer.style.display = 'none';
    container.style.display = 'flex';

    // Reset button labels and enable controls
    clearButton.textContent = 'Clear';
    enableButton(startButton, 'start');
    enableButton(clearButton, 'clear');

    // Timer is now idle (ready to start)
    state = timerState.IDLE;

    // Disable start/clear if time is zero
    if (timeSet === '00:00:00') {
        disableButton(startButton);
        disableButton(clearButton);
    }
}

/**
 * Handles resetting the timer based on current state:
 * - FINISHED → Reset to original time, ready to restart
 * - IDLE → Clear to 00:00:00 and disable buttons
 * - PAUSED → Reset to original time, go back to idle
 */
function handleResetTimer() {
    // Cancel any active countdown (cleanup)
    if (cancelCountdown) cancelCountdown();
    cancelCountdown = null;

    if (state == timerState.FINISHED) {
        state = timerState.IDLE;
        timerDisplay.textContent = timeSet; // Restore original time

        clearButton.textContent = 'Clear';
        hideButton(stopButton);
        showButton(startButton);
    }
    else if (state === timerState.IDLE) {
        timerDisplay.textContent = '00:00:00';
        disableButton(startButton);
        disableButton(clearButton);
    }
    else if (state === timerState.PAUSED) {
        timerDisplay.textContent = timeSet;
        state = timerState.IDLE;
        clearButton.textContent = 'Clear';
    }
}

/**
 * Starts the countdown:
 * - Validates time is not zero
 * - Updates UI: hides start, shows stop, disables clear
 * - Calculates end time in milliseconds from now
 * - Enters RUNNING state
 * - Launches the countDown() engine
 */
function handleStartTimer() {
    if (timerDisplay.textContent === '00:00:00') return;
    // Redundant under normal circumstances, but just in case: If the timer is already running, don't start it again
    if (cancelCountdown) return;

    // Update UI: hide start, show stop, disable clear
    hideButton(startButton);
    enableButton(stopButton, 'stop');
    showButton(stopButton);
    disableButton(clearButton);
    clearButton.textContent = 'Reset';

    let displayTime = timerDisplay.textContent;
    let endTime = `0`;

    let [hours, minutes, seconds] = [0, 0, 0];

    // If starting from idle, use the saved time; otherwise, use current display
    if (state == timerState.IDLE) {
        [hours, minutes, seconds] = timeSet.split(`:`).map(Number);
    }
    else {
        [hours, minutes, seconds] = displayTime.split(`:`).map(Number);
    }

    // Convert total time to milliseconds
    const setTimeInMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    // Calculate absolute end time (wall-clock time when timer should finish)
    endTime = Date.now() + setTimeInMilliseconds;

    // Enter running state
    state = timerState.RUNNING;

    // Start the countdown engine and store its cleanup function
    cancelCountdown = countDown(endTime);
}

/**
 * The core countdown engine.
 * Uses real-time calculation to avoid drift.
 * 
 * How it works:
 * 1. Calculates remaining seconds using Math.ceil → ensures 1 full second is shown until deadline
 * 2. Only updates DOM when the displayed second changes
 * 3. Schedules next tick to wake up just after the next whole second (aligned with wall-clock)
 * 4. Handles system resume via Electron's powerMonitor (via window.electronAPI)
 * 5. Returns a cleanup function to prevent memory leaks
 * 
 * This design is:
 * - Accurate: hits 00:00 exactly at deadline
 * - Efficient: only runs once per second
 * - Resilient: recovers from system sleep
 * - Synchronized: visually aligned with clock seconds
 * 
 * @param {number} endTime - The absolute timestamp (Date.now()) when the timer should finish
 * @returns {function} Cleanup function to stop the timer safely
 */
function countDown(endTime) {
    const startTime = Date.now(); // Get the start time immediately
    let timer = 0;         // Stores setTimeout ID for cancellation
    let lastSec = -1;      // Tracks last displayed second to avoid redundant updates

    /**
     * Main tick function — called once per second (aligned to clock)
     * Recalculates remaining time and updates display if changed.
     */
    const tick = () => {
        // If already finished, do nothing (safety guard)
        if (state === timerState.FINISHED) return;

        // Calculate remaining whole seconds, rounded up to ensure full second display
        // Math.ceil ensures that 999ms still shows as 1 second
        // Math.max(0, ...) prevents negative values
        const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

        // Only update DOM if the displayed second has changed
        if (left !== lastSec) {
            lastSec = left;

            // Format into HH:MM:SS with leading zeros
            const h = String(Math.floor(left / 3600)).padStart(2, '0');
            const m = String(Math.floor((left % 3600) / 60)).padStart(2, '0');
            const s = String(left % 60).padStart(2, '0');
            timerDisplay.textContent = `${h}:${m}:${s}`;
            console.log(left, Date.now());
            // If time is up, finish the timer
            if (left === 0) { finishTimer(); return; }
        }

        // Calculate delay to wake up just after the next whole second
        // Example: if current time is :123, wait 877ms + 5ms → wake at :005 of next second
        // This ensures visual alignment with wall-clock seconds and avoids 999ms jitter
        // ! Option between this and instant start (and start with current millisecond)
        let delay = 0;

        if (currentTimerMode === 'clock') {
            console.log('clock');
            delay = 1000 - (Date.now() % 1000) + 5;

        }
        else if (currentTimerMode === 'instant') {
            console.log('instant');

            const elapsed = Date.now() - startTime;
            const nextTickTime = startTime + Math.ceil((elapsed + 1) / 1000) * 1000;
            delay = Math.max(0, nextTickTime - Date.now());
        }

        timer = setTimeout(tick, delay);
    };

    /**
     * Called when timer reaches zero.
     * Updates state, cleans up, and adjusts UI.
     */
    const finishTimer = () => {
        state = timerState.FINISHED;
        clearTimeout(timer);                  // Cancel any pending timeout
        window.electronAPI.removeResume(tick); // Unregister from resume events

        // Update UI
        disableButton(stopButton);
        clearButton.textContent = 'Reset';
        enableButton(clearButton, 'clear');
    };

    // Start the countdown
    tick();

    // Register this tick function to be called when system resumes from sleep
    window.electronAPI.onResume(tick);

    // Return a cleanup function to safely stop the timer
    return () => {
        clearTimeout(timer);
        window.electronAPI.removeResume(tick);
    };
};

/**
 * Pauses the running timer.
 * - Sets state to PAUSED
 * - Cancels the countdown (via cleanup function)
 * - Updates UI: hide stop, show start, enable clear
 */
function handleStopTimer() {
    state = timerState.PAUSED;

    if (cancelCountdown) cancelCountdown();
    cancelCountdown = null;

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