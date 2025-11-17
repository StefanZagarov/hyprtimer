// Use global objects and electronAPI for renderer process
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load persisted data using electronAPI
    const [time, mode, settings] = await Promise.all([
      await window.electronAPI.storage.loadTime(),
      await window.electronAPI.storage.loadMode(),
      await window.electronAPI.storage.loadSettings(),
    ]);

    if (window.audio) {
      window.audio.initAudio({ settings });
    }

    // Initialize state (available as window.state after state.js loads)
    window.state.setTime(time);
    window.state.setMode(mode);
    window.state.loadSettings(settings);

    // Start the UI (available as window.ui after ui.js loads)
    window.ui.setupUI();
  } catch (err) {
    console.error("Failed to initialize application:", err);
  }
});
