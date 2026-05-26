const { TIMER_STATE, SETTINGS_KEYS, DEFAULT_TIME, DEFAULT_OVERTIME, MODES } =
  window.electronAPI.constants;

const initialState = {
  state: TIMER_STATE.IDLE,
  timeSet: DEFAULT_TIME,
  displayTime: DEFAULT_TIME,
  displayOvertime: DEFAULT_OVERTIME,
  title: "Not set",
  ui: {
    startButton: { enabled: false, visible: true },
    stopButton: { enabled: false, visible: false },
    clearButton: { enabled: false, visible: true },
    resetButton: { enabled: false, visible: false },
    timerClickable: true,
    modeButtonsClickable: true,
  },
  settings: {
    isOpen: false,
    volume: 0.5,
    vibration: true,
    showTitle: true,
    showOvertime: true,
    mode: "instant",
  },
};

let currentState = { ...initialState };
const listeners = [];

function getState() {
  return { ...currentState };
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

function updateState(partialState) {
  currentState = { ...currentState, ...partialState };
  listeners.forEach((fn) => fn(currentState));
}

function toggleSettingsPanel() {
  const isSettingsOpen = !currentState.settings.isOpen;
  updateState({
    settings: {
      ...currentState.settings,
      isOpen: isSettingsOpen,
    },
  });
}

function updateSetting(key, value, loadedFromStorage = false) {
  const allowedKeys = Object.values(SETTINGS_KEYS);

  if (!allowedKeys.includes(key)) {
    console.error(`State Error: ${key} is not a valid setting.`);
    return;
  }

  updateState({
    settings: {
      ...currentState.settings,
      [key]: value,
    },
  });

  if (!loadedFromStorage) window.electronAPI.storage.saveSetting(key, value);
}

function loadSettings(settings) {
  let name = "";
  let value = "";
  try {
    Object.entries(settings).forEach((setting) => {
      const name = setting[0];
      const value = setting[1];
      updateSetting(name, value, true);
    });
  } catch (error) {
    console.warn(
      `Failed to load setting ${name} with value ${value}, resolving to default value. Error message:${error}`,
    );
  }
}

function setVolume(volume) {
  const validatedVolume = Math.max(0, Math.min(1, volume));
  updateSetting(SETTINGS_KEYS.VOLUME, validatedVolume);
  window.audio.setVolume(validatedVolume);
}

function setTime(time) {
  const isZero = time === DEFAULT_TIME;
  updateState({
    timeSet: time,
    displayTime: time,
    title: isZero ? "Not set" : "Timer set",
    ui: {
      ...currentState.ui,
      startButton: { enabled: !isZero, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: !isZero, visible: true },
      resetButton: { enabled: false, visible: false },
    },
  });
}

function updateDisplayTime(time) {
  updateState({ displayTime: time });
}

function updateDisplayOvertime(time) {
  updateState({ displayOvertime: time });
}

function startTimer() {
  if (
    currentState.displayTime === DEFAULT_TIME ||
    currentState.state === TIMER_STATE.RUNNING
  )
    return;

  updateState({
    state: TIMER_STATE.RUNNING,
    title: "Running...",
    ui: {
      startButton: { enabled: false, visible: false },
      stopButton: { enabled: true, visible: true },
      clearButton: { enabled: false, visible: false },
      resetButton: { enabled: false, visible: true },
      timerClickable: false,
      modeButtonsClickable: false,
    },
  });
}

function pauseTimer() {
  updateState({
    state: TIMER_STATE.PAUSED,
    title: "Paused",
    ui: {
      startButton: { enabled: true, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: false, visible: false },
      resetButton: { enabled: true, visible: true },
      timerClickable: true,
      modeButtonsClickable: true,
    },
  });
}

function finishTimer() {
  updateState({
    state: TIMER_STATE.FINISHED,
    title: "Finished",
    ui: {
      startButton: { enabled: false, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: false, visible: false },
      resetButton: { enabled: true, visible: true },
      timerClickable: false,
      modeButtonsClickable: true,
    },
  });
}

function resetFromFinished() {
  updateState({
    state: TIMER_STATE.IDLE,
    displayTime: currentState.timeSet,
    displayOvertime: DEFAULT_OVERTIME,
    title: "Timer set",
    ui: {
      startButton: { enabled: true, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: true, visible: true },
      resetButton: { enabled: false, visible: false },
      timerClickable: true,
      modeButtonsClickable: true,
    },
  });
}

function clearTimer() {
  const { state: currState } = currentState;
  if (currState === TIMER_STATE.IDLE) {
    updateState({
      timeSet: DEFAULT_TIME,
      displayTime: DEFAULT_TIME,
      title: "Not set",
      ui: {
        ...currentState.ui,
        startButton: { enabled: false, visible: true },
        stopButton: { enabled: false, visible: false },
        clearButton: { enabled: false, visible: true },
        resetButton: { enabled: false, visible: false },
      },
    });
  } else if (currState === TIMER_STATE.PAUSED) {
    updateState({
      state: TIMER_STATE.IDLE,
      displayTime: currentState.timeSet,
      title: "Timer set",
      ui: {
        ...currentState.ui,
        startButton: { enabled: true, visible: true },
        stopButton: { enabled: false, visible: false },
        clearButton: { enabled: true, visible: true },
        resetButton: { enabled: false, visible: false },
      },
    });
  }
}

function setMode(mode) {
  MODES.includes(mode)
    ? updateSetting(SETTINGS_KEYS.MODE, mode)
    : console.error(`Invalid mode selected`);
}

// Export public API to global scope for browser usage
window.state = {
  getState,
  subscribe,
  toggleSettingsPanel,
  updateSetting,
  setVolume,
  loadSettings,
  setTime,
  updateDisplayTime,
  updateDisplayOvertime,
  startTimer,
  pauseTimer,
  finishTimer,
  resetFromFinished,
  clearTimer,
  setMode,
};
