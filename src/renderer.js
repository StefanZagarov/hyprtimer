// TODO: Make sure inputting letters is prohibited
// TODO: Maybe let maxed out fields (59) to change the 9 to the new number
//
// Use global objects and electronAPI for renderer process
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load persisted data using electronAPI
    const time = await window.electronAPI.storage.loadTime();
    const mode = await window.electronAPI.storage.loadMode();

    // Initialize state (available as window.state after state.js loads)
    window.state.setTime(time);
    window.state.setMode(mode);

    // Start the UI (available as window.ui after ui.js loads)
    window.ui.setupUI();
  } catch (err) {
    console.error('Failed to initialize application:', err);
  }
});
