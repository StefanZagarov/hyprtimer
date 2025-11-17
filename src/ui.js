// Access state and functions through global objects and electronAPI
// state will be available as window.state after state.js loads
// countDown will be available as window.timer.countDown after timer.js loads
// saveTime and saveMode are available through window.electronAPI.storage

// --- DOM Elements ---
const displayContainer = document.getElementById("display-container");
const timerFormContainer = document.getElementById("timerForm");
const form = document.querySelector("form");
const timerDisplay = document.getElementById("timer");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const clearButton = document.getElementById("clear");
const setTimerButton = document.getElementById("setTimer");
const timerModeBtns = document.querySelectorAll(".toggle-option");
const highlight = document.getElementById("highlight");
const titleEl = document.getElementById("title");
const settingsIcon = document.getElementById("settings-icon");
const vibrationToggle = document.getElementById("vibration-toggle");
const volumeSlider = document.getElementById("volume-slider");

// --- Timer cleanup reference ---
let cancelCountdown = null;

function setupUI() {
  render(window.state.getState());
  window.state.subscribe(render);
  setupEventListeners();
}

function render(currentState) {
  timerDisplay.textContent = currentState.displayTime;
  titleEl.textContent = currentState.title;

  syncButton(startButton, currentState.ui.startButton);
  syncButton(stopButton, currentState.ui.stopButton);
  syncButton(clearButton, currentState.ui.clearButton);

  timerDisplay.classList.toggle(
    "disableTimerClick",
    !currentState.ui.timerClickable,
  );
  timerModeBtns.forEach((btn) =>
    btn.classList.toggle(
      "disableTimerClick",
      !currentState.ui.modeButtonsClickable,
    ),
  );

  // Update active class on mode buttons
  timerModeBtns.forEach((btn) => {
    const isActive = btn.dataset.mode === currentState.mode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive.toString());
    updateHighlightPosition();
  });

  // Toggle the settings' open class based on state
  ["chevron", "settings-panel"].forEach((id) => {
    const element = document.getElementById(id);
    element.classList.toggle("open", currentState.settings.isOpen);
  });

  // Settings UI elements linkage to the state
  vibrationToggle.checked = currentState.settings.vibration;

  // Volume slider
  volumeSlider.value = currentState.settings.volume;
  updateVolumeDisplay(currentState.settings.volume);
}

function updateVolumeDisplay(volume) {
  const volumeValue = document.querySelector(".volume-value");
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
}

function updateHighlightPosition(initial = false) {
  const currentState = window.state.getState();
  const activeBtn = Array.from(timerModeBtns).find(
    (btn) => btn.dataset.mode === currentState.mode,
  );

  if (activeBtn && initial) {
    highlight.style.transition = "none";
    highlight.style.width = `${activeBtn.offsetWidth + 1}px`;
    highlight.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  } else if (activeBtn) {
    highlight.style.transition = "transform 0.3s ease";
    highlight.style.width = `${activeBtn.offsetWidth + 1}px`;
    highlight.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }
}

function syncButton(el, config) {
  el.disabled = !config.enabled;
  el.classList.toggle("disabled", !config.enabled);
  el.style.display = config.visible ? "flex" : "none";
  if ("text" in config) el.textContent = config.text;
}

function setupEventListeners() {
  timerDisplay.addEventListener("click", () => {
    if (window.state.getState().ui.timerClickable) openTimerForm();
  });

  form.elements.hours.addEventListener("input", handleFormInput);
  form.elements.minutes.addEventListener("input", handleFormInput);
  form.elements.seconds.addEventListener("input", handleFormInput);

  setTimerButton.addEventListener("click", handleSetTimer);
  clearButton.addEventListener("click", handleClearClick);
  startButton.addEventListener("click", handleStartClick);
  stopButton.addEventListener("click", handleStopClick);

  timerModeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const mode = e.currentTarget.dataset.mode;
      if (mode !== window.state.getState().mode) {
        window.state.setMode(mode);
        window.electronAPI.storage.saveMode(mode);
      }
    });
  });

  settingsIcon.addEventListener("click", handleToggleSettingsPanel);
  //TODO: Make an object which will be used to make sure we send the proper setting names (type safety)
  vibrationToggle.addEventListener("change", (e) => {
    handleToggleSetting("vibration", e);
  });

  volumeSlider.addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value);
    window.state.setVolume(volume);
    window.audio.setVolume(volume);
    updateVolumeDisplay(volume);
  });
}

function handleStartClick() {
  const { displayTime } = window.state.getState();
  if (displayTime === "00:00:00") return;

  // Cancel any existing countdown (defensive)
  if (cancelCountdown) cancelCountdown();

  // Compute end time
  const [h, m, s] = displayTime.split(":").map(Number);
  const totalMs = (h * 3600 + m * 60 + s) * 1000;
  const endTime = Date.now() + totalMs;

  // Start the state machine
  window.state.startTimer();

  // Launch the actual countdown
  cancelCountdown = window.timer.countDown(endTime);
}

function handleStopClick() {
  // Cancel the running timer
  if (cancelCountdown) {
    cancelCountdown();
    cancelCountdown = null;
  }
  // Update state to paused
  window.state.pauseTimer();
}

// Settings handling
function handleToggleSettingsPanel() {
  window.state.toggleSettingsPanel();
  updateHighlightPosition(true);
}

function handleToggleSetting(setting, event) {
  window.state.updateSetting(setting, event.target.checked);
}

// Form Handling
function openTimerForm() {
  displayContainer.style.display = "none";
  timerFormContainer.style.display = "flex";

  const [h, m, s] = window.state.getState().displayTime.split(":");
  form.elements.hours.value = h;
  form.elements.minutes.value = m;
  form.elements.seconds.value = s;
}

// TODO: Make sure inputting letters is prohibited
// TODO: Maybe let maxed out fields (59) to change the 9 to the new number
function handleFormInput(e) {
  const field = e.target;
  const name = field.name;

  if (field.value.length > 2) {
    field.value = field.value.slice(-2);
  }

  if ((name === "minutes" || name === "seconds") && Number(field.value) > 59) {
    field.value = "59";
  }

  if (field.value.length === 1) {
    field.value = "0" + field.value;
  }
}

function handleSetTimer() {
  const timeString = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;
  timerFormContainer.style.display = "none";
  displayContainer.style.display = "flex";
  window.state.setTime(timeString);
  window.electronAPI.storage.saveTime(timeString);
}

function handleClearClick() {
  // Cancel any active countdown
  if (cancelCountdown) {
    cancelCountdown();
    cancelCountdown = null;
  }

  const { state: currState } = window.state.getState();
  if (currState === "finished") {
    window.state.resetFromFinished();
  } else {
    window.state.clearTimer();
  }
}

window.ui = {
  setupUI,
  updateDisplayTime: window.state.updateDisplayTime,
  updateTitle: window.state.updateTitle,
};
