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

async function saveSetting(key, value) {
  try {
    // Validate settings keys to prevent injection attacks
    const validKeys = [
      "volume",
      "vibration",
      "showTitle",
      "showEndTimer",
      "mode",
    ];
    if (!validKeys.includes(key)) {
      throw new Error("Invalid settings key:", key);
    }

    // Validate volume value
    if (
      key === "volume" &&
      (typeof value !== "number" || value < 0 || value > 1)
    ) {
      throw new Error("Invalid volume value:", value);
    }

    await ipcRenderer.invoke("store-set", `settings.${key}`, value);
  } catch (e) {
    console.error("Failed to save settings:", e);
  }
}

async function loadSettings() {
  try {
    // Load each setting with fallback
    const [volume, vibration, showTitle, showEndTimer, mode] =
      await Promise.all([
        ipcRenderer.invoke("store-get", "settings.volume", 0.5),
        ipcRenderer.invoke("store-get", "settings.vibration", true),
        ipcRenderer.invoke("store-get", "settings.showTitle", true),
        ipcRenderer.invoke("store-get", "settings.showEndTimer", true),
        ipcRenderer.invoke("store-get", "settings.mode", "instant"),
      ]);

    return { volume, vibration, showTitle, showEndTimer, mode };
  } catch (e) {
    console.warn("Failed to load settings, using defaults:", e);
    return {
      volume: 0.5,
      vibration: true,
      showTitle: true,
      showEndTimer: true,
      mode: "instant",
    };
  }
}

// SOON WILL BE REDUNDANT --->
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
// <--- SOON WILL BE REDUNDANT

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
    saveSetting,
    loadSettings,
  },

  constants: {
    TIMER_STATE,
    DEFAULT_TIME,
    DEFAULT_MODE,
    MODES,
  },
});
