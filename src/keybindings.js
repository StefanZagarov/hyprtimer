function setupKeybindings() {
  document.addEventListener("keydown", (e) => {
    // Skip if typing in the form fields
    if (e.target.tagName === "INPUT") return;

    switch (e.key) {
      case " ":
      case "s":
      case "S":
        // Space scrolls by default
        e.preventDefault();
        toggleStartStop();
        break;
      case "r":
      case "R":
        resetTimer();
        break;
      case "c":
      case "C":
        clearTimer();
        break;
    }
  });
}

function toggleStartStop() {
  const { ui } = window.state.getState();
  if (ui.startButton.visible && ui.startButton.enabled) {
    document.getElementById("start").click();
  } else if (ui.stopButton.visible && ui.stopButton.enabled) {
    document.getElementById("stop").click();
  }
}

function resetTimer() {
  const { ui } = window.state.getState();
  if (ui.resetButton.visible && ui.resetButton.enabled) {
    document.getElementById("reset").click();
  }
}
function clearTimer() {
  const { ui } = window.state.getState();
  if (ui.clearButton.visible && ui.clearButton.enabled) {
    document.getElementById("clear").click();
  }
}

window.keybindings = { setupKeybindings };
