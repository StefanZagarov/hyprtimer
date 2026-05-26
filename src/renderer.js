// Use global objects and electronAPI for renderer process
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load persisted data using electronAPI
    const [time, settings] = await Promise.all([
      await window.electronAPI.storage.loadTime(),
      await window.electronAPI.storage.loadSettings(),
    ]);

    // Remove focus from all elements - prevents buttons from being selected on widnow focus, or tab button
    document.querySelectorAll('button, [role="button"]').forEach((el) => {
      el.tabIndex = -1;
    });

    if (window.audio) {
      window.audio.initAudio({ settings });
    }

    // Initialize state (available as window.state after state.js loads)
    window.state.setTime(time);
    window.state.loadSettings(settings);

    // Start the UI (available as window.ui after ui.js loads)
    window.ui.setupUI();
    window.keybindings.setupKeybindings();
  } catch (err) {
    console.error("Failed to initialize application:", err);
  }
});
