// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");
const {
  TIMER_STATE,
  DEFAULT_TIME,
  DEFAULT_MODE,
  MODES,
} = require("./constants");

// Storage functions that use ipcRenderer directly
async function loadTime() {
  try {
    return await ipcRenderer.invoke("store-get", "timeSet", DEFAULT_TIME);
  } catch (e) {
    console.warn("Failed to load stored time, using default:", e);
    return DEFAULT_TIME;
  }
}

async function saveTime(time) {
  try {
    await ipcRenderer.invoke("store-set", "timeSet", time);
  } catch (e) {
    console.error("Failed to save time:", e);
  }
}

async function loadMode() {
  try {
    const mode = await ipcRenderer.invoke("store-get", "mode", DEFAULT_MODE);
    // Ensure only valid modes are returned
    return ["clock", "instant"].includes(mode) ? mode : DEFAULT_MODE;
  } catch (e) {
    console.warn("Failed to load stored mode, using default:", e);
    return DEFAULT_MODE;
  }
}

async function saveMode(mode) {
  try {
    if (!["clock", "instant"].includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    await ipcRenderer.invoke("store-set", "mode", mode);
  } catch (e) {
    console.error("Failed to save mode:", e);
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  onResume: (cb) => ipcRenderer.on("resume", cb),
  removeResume: (cb) => ipcRenderer.removeListener("resume", cb),

  store: {
    get: (key, defaultValue) =>
      ipcRenderer.invoke(`store-get`, key, defaultValue),
    set: (key, value) => ipcRenderer.invoke(`store-set`, key, value),
    has: (key) => ipcRenderer.invoke(`store-has`, key),
  },

  storage: {
    loadTime,
    loadMode,
    saveTime,
    saveMode,
  },

  constants: {
    TIMER_STATE,
    DEFAULT_TIME,
    DEFAULT_MODE,
    MODES,
  },
});
