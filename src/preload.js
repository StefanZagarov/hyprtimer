// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");
const {
  TIMER_STATE,
  SETTINGS_KEYS,
  DEFAULT_TIME,
  DEFAULT_MODE,
  MODES,
  DEFAULT_OVERTIME,
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
    const validKeys = Object.values(SETTINGS_KEYS);

    if (!validKeys.includes(key)) {
      throw new Error("Invalid settings key:", key);
    }

    // Validate volume value
    if (
      key === SETTINGS_KEYS.VOLUME &&
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
    const [volume, vibration, showTitle, showOvertime, mode] =
      await Promise.all([
        ipcRenderer.invoke(
          "store-get",
          `settings.${SETTINGS_KEYS.VOLUME}`,
          0.5,
        ),
        ipcRenderer.invoke(
          "store-get",
          `settings.${SETTINGS_KEYS.VIBRATION}`,
          true,
        ),
        ipcRenderer.invoke(
          "store-get",
          `settings.${SETTINGS_KEYS.SHOW_TITLE}`,
          true,
        ),
        ipcRenderer.invoke(
          "store-get",
          `settings.${SETTINGS_KEYS.SHOW_OVERTIME}`,
          true,
        ),
        ipcRenderer.invoke(
          "store-get",
          `settings.${SETTINGS_KEYS.MODE}`,
          "instant",
        ),
      ]);

    return { volume, vibration, showTitle, showOvertime, mode };
  } catch (e) {
    console.warn("Failed to load settings, using defaults:", e);
    return {
      volume: 0.5,
      vibration: true,
      showTitle: true,
      showOvertime: true,
      mode: "instant",
    };
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
    saveTime,
    saveSetting,
    loadSettings,
  },

  constants: {
    TIMER_STATE,
    SETTINGS_KEYS,
    DEFAULT_TIME,
    DEFAULT_OVERTIME,
    DEFAULT_MODE,
    MODES,
  },
});
