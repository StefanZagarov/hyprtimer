// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onResume: (cb) => ipcRenderer.on('resume', cb),
    removeResume: (cb) => ipcRenderer.removeListener('resume', cb)
});