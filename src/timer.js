// src/timer.js
// Access state and ui through global objects
// state is available as window.state
// ui is available as window.ui

// Assume timeUpSound is accessible globally or via module
// If you prefer, move this into a sound.js module later
const timeUpSound = new Audio("./assets/alarms/jobs done.mp3");

/**
 * Starts a countdown timer that updates based on real wall-clock time.
 * Preserves your original timing logic for "clock" and "instant" modes.
 *
 * @param {number} endTime - Absolute timestamp (Date.now() + durationMs) when timer should end
 * @returns {function} Cleanup function to stop the timer
 */
function countDown(endTime) {
  const startTime = Date.now();
  let timerId = null;
  let lastSec = -1;

  // Update title to "Running..."
  window.ui.updateTitle("Running...");

  const tick = () => {
    // Guard: stop if already finished (e.g., cleared externally)
    if (window.state.getState().state === "finished") {
      return;
    }

    const now = Date.now();
    const left = Math.max(0, Math.ceil((endTime - now) / 1000));

    // Only update display when second changes
    if (left !== lastSec) {
      lastSec = left;

      const h = String(Math.floor(left / 3600)).padStart(2, "0");
      const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
      const s = String(left % 60).padStart(2, "0");
      const displayTime = `${h}:${m}:${s}`;

      window.ui.updateDisplayTime(displayTime);

      // Debug log (you can remove or guard with env flag)
      console.log(left, now, window.state.getState().mode);

      if (left === 0) {
        finishTimer();
        return;
      }
    }

    // Compute next tick delay based on mode
    let delay = 0;
    const currentMode = window.state.getState().mode;

    if (currentMode === "clock") {
      delay = 1000 - (Date.now() % 1000) + 5; // your original +5ms tweak
    } else if (currentMode === "instant") {
      const elapsed = Date.now() - startTime;
      const nextTickTime = startTime + Math.ceil((elapsed + 1) / 1000) * 1000;
      delay = Math.max(0, nextTickTime - Date.now());
    }

    timerId = setTimeout(tick, delay);
  };

  const finishTimer = () => {
    // Clear timeout
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }

    // Unregister from Electron resume
    window.electronAPI.removeResume(tick);

    // Transition state
    window.state.finishTimer();

    // Play sound
    timeUpSound.play().catch((e) => console.warn("Audio play failed:", e));

    // Start "time since finished" counter
    timeSinceFinishedCount();
  };

  // Start ticking
  tick();

  // Register for system resume (e.g., after sleep)
  window.electronAPI.onResume(tick);

  // Return cleanup function
  return () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    window.electronAPI.removeResume(tick);
  };
}

/**
 * Counts upward from 00:00:00 showing "Time since stopped: HH:MM:SS"
 */
function timeSinceFinishedCount() {
  const startTime = Date.now();
  let _timerId = null;

  const tick = () => {
    // Stop if no longer in FINISHED state
    if (window.state.getState().state !== "finished") {
      return;
    }

    const elapsedMs = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsedMs / 1000);

    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");

    window.ui.updateTitle(`Time since stopped: ${h}:${m}:${s}`);

    const nextTickDelay = Math.max(0, 1000 - (elapsedMs % 1000));
    _timerId = setTimeout(tick, nextTickDelay);
  };

  tick();
  window.electronAPI.onResume(tick);

  // Optional: return cleanup if needed externally
  // For now, it self-terminates when state changes
}

// Export to global scope
window.timer = {
  countDown,
  // timeSinceFinishedCount is internal, but you can export if needed
};
