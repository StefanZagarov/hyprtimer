const displayContainer = document.getElementById("display-container");
const timerFormContainer = document.getElementById("timerForm");
const form = document.querySelector("form");
const timerDisplay = document.getElementById("timer");
const overtimeDisplay = document.getElementById("overtime");
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
const titleToggle = document.getElementById("title-toggle");
const overtimeToggle = document.getElementById("overtime-toggle");

// Cleanup reference
let cancelCountdown = null;

function setupUI() {
  render(window.state.getState());
  window.state.subscribe(render);
  setupEventListeners();

  if (!isVibrationSupported()) {
    document.getElementById("vibration-setting").style.display = "none";
  }
}

function render(currentState) {
  titleEl.textContent = currentState.title;
  timerDisplay.textContent = currentState.displayTime;
  overtimeDisplay.textContent = currentState.displayOvertime;
  showOvertime(currentState);

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

  timerModeBtns.forEach((btn) => {
    const isActive = btn.dataset.mode === currentState.settings.mode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive.toString());
    updateHighlightPosition();
  });

  ["chevron", "settings-panel"].forEach((id) => {
    const element = document.getElementById(id);
    element.classList.toggle("open", currentState.settings.isOpen);
  });

  // Settings UI elements linkage to the state
  vibrationToggle.checked = currentState.settings.vibration;
  titleToggle.checked = currentState.settings.showTitle;
  displayTitle(currentState);
  overtimeToggle.checked = currentState.settings.showOvertime;

  volumeSlider.value = currentState.settings.volume;
  updateVolumeDisplay(currentState.settings.volume);
}

// Settings reading
function updateVolumeDisplay(volume) {
  const volumeValue = document.querySelector("#volume-value");
  volumeValue.textContent = `${Math.round(volume * 100)}%`;
}
function displayTitle(currentState) {
  titleEl.style.visibility = currentState.settings.showTitle
    ? "visible"
    : "hidden";
}
function showOvertime(currentState) {
  if (
    currentState.state === "finished" &&
    currentState.settings.showOvertime === true
  ) {
    overtimeDisplay.style.visibility = "visible";
  } else {
    overtimeDisplay.style.visibility = "hidden";
  }
}
function isVibrationSupported() {
  const hasAPI = typeof navigator.vibrate === "function";

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return hasAPI && isMobile;
}

function updateHighlightPosition(initial = false) {
  const currentState = window.state.getState();
  const activeBtn = Array.from(timerModeBtns).find(
    (btn) => btn.dataset.mode === currentState.settings.mode,
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
  const { SETTINGS_KEYS } = window.electronAPI.constants;

  timerDisplay.addEventListener("click", () => {
    if (window.state.getState().ui.timerClickable) openTimerForm();
  });

  ["hours", "minutes", "seconds"].forEach((name) => {
    const element = form.elements[name];

    element.addEventListener("keydown", (e) => {
      if (["e", "E", "+", "-"].includes(e.key)) {
        e.preventDefault();
      }
    });

    element.addEventListener("input", (e) => {
      const field = e.target;

      if (field.value.length > 2) {
        field.value = field.value.slice(-2);
      }

      if (field.value.length === 1) {
        field.value = "0" + field.value;
      }

      if (field.value.length === 0) {
        field.value = "00";
      }
    });

    element.addEventListener("blur", (e) => {
      const target = e.target;
      const name = e.target.name;

      if (name === "hours") return;

      if (target.value > "59") {
        target.value = "59";
      }
    });
  });
  setTimerButton.addEventListener("click", handleSetTimer);
  clearButton.addEventListener("click", handleClearClick);
  startButton.addEventListener("click", handleStartClick);
  stopButton.addEventListener("click", handleStopClick);

  timerModeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const mode = e.currentTarget.dataset.mode;
      if (mode !== window.state.getState().mode) {
        window.state.setMode(mode);
      }
    });
  });

  settingsIcon.addEventListener("click", handleToggleSettingsPanel);

  vibrationToggle.addEventListener("change", (e) => {
    handleToggleSetting(SETTINGS_KEYS.VIBRATION, e);
  });
  titleToggle.addEventListener("change", (e) => {
    handleToggleSetting(SETTINGS_KEYS.SHOW_TITLE, e);
  });
  overtimeToggle.addEventListener("change", (e) => {
    handleToggleSetting(SETTINGS_KEYS.SHOW_OVERTIME, e);
  });

  volumeSlider.addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value);
    window.state.setVolume(volume);
    updateVolumeDisplay(volume);
  });
}

function handleStartClick() {
  const { displayTime } = window.state.getState();
  if (displayTime === "00:00:00") return;

  if (cancelCountdown) cancelCountdown();

  // Compute end time
  const [h, m, s] = displayTime.split(":").map(Number);
  const totalMs = (h * 3600 + m * 60 + s) * 1000;
  const endTime = Date.now() + totalMs;

  window.state.startTimer();

  // Launch the actual countdown
  cancelCountdown = window.timer.countDown(endTime);
}

function handleStopClick() {
  if (cancelCountdown) {
    cancelCountdown();
    cancelCountdown = null;
  }

  window.state.pauseTimer();
}

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

function handleSetTimer() {
  const timeString = `${form.elements.hours.value}:${form.elements.minutes.value}:${form.elements.seconds.value}`;
  timerFormContainer.style.display = "none";
  displayContainer.style.display = "flex";
  window.state.setTime(timeString);
  window.electronAPI.storage.saveTime(timeString);
}

function handleClearClick() {
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
};
