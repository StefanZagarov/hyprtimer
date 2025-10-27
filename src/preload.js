// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onResume: (cb) => ipcRenderer.on("resume", cb),
  removeResume: (cb) => ipcRenderer.removeListener("resume", cb),

    store: {
        get: (key, defaultValue) => ipcRenderer.invoke(`store-get`, key, defaultValue),
        set: (key, value) => ipcRenderer.invoke(`store-set`, key, value),
        has: (key) => ipcRenderer.invoke(`store-has`, key)
    }
});
