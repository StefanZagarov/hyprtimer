// Constants are available through window.electronAPI.constants
const { TIMER_STATE, DEFAULT_TIME, MODES } = window.electronAPI.constants;

const initialState = {
  state: TIMER_STATE.IDLE,
  timeSet: DEFAULT_TIME,
  displayTime: DEFAULT_TIME,
  mode: "instant",
  title: "Not set",
  ui: {
    startButton: { enabled: false, visible: true },
    stopButton: { enabled: false, visible: false },
    clearButton: { enabled: false, visible: true, text: "Clear" },
    timerClickable: true,
    modeButtonsClickable: true,
  },
  settings: {
    isOpen: false,
    volume: 0.5, // TODO: Add slider for the volume
    vibration: false, // Future TODO: add vibration for mobile
    showTitle: true,
    hideEndTimer: false, // Counter after timer ends
    mode: "instant", // Move mode here
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
    // ? - what does this check, why does it splice the listeners?
    if (index > -1) listeners.splice(index, 1);
  };
}

function updateState(partialState) {
  currentState = { ...currentState, ...partialState };
  listeners.forEach((fn) => fn(currentState));
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
      clearButton: { enabled: !isZero, visible: true, text: "Clear" },
    },
  });
}

function updateDisplayTime(time) {
  updateState({ displayTime: time });
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
      clearButton: { enabled: false, visible: true, text: "Reset" },
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
      clearButton: { enabled: true, visible: true, text: "Reset" },
      timerClickable: true,
      modeButtonsClickable: true,
    },
  });
}

function finishTimer() {
  updateState({
    state: TIMER_STATE.FINISHED,
    title: "Time since stopped: 00:00:00", // will be updated externally
    ui: {
      startButton: { enabled: false, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: true, visible: true, text: "Reset" },
      timerClickable: true,
      modeButtonsClickable: true,
    },
  });
}

function resetFromFinished() {
  updateState({
    state: TIMER_STATE.IDLE,
    displayTime: currentState.timeSet,
    title: "Timer set",
    ui: {
      startButton: { enabled: true, visible: true },
      stopButton: { enabled: false, visible: false },
      clearButton: { enabled: true, visible: true, text: "Clear" },
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
        clearButton: { enabled: false, visible: true, text: "Clear" },
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
        clearButton: { enabled: true, visible: true, text: "Clear" },
      },
    });
  }
}

function setMode(mode) {
  MODES.includes(mode)
    ? updateState({ mode })
    : console.error(`Invalid mode selected`);
}

function updateTitle(title) {
  updateState({ title });
}

// Export public API to global scope for browser usage
window.state = {
  getState,
  subscribe,
  setTime,
  updateDisplayTime,
  startTimer,
  pauseTimer,
  finishTimer,
  resetFromFinished,
  clearTimer,
  setMode,
  updateTitle,
};
