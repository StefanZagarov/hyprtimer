const timeUpSound = new Audio("./assets/alarms/jobs done.mp3");

function initAudio(state) {
  if (state.settings.volume !== undefined) {
    timeUpSound.volume = state.settings.volume;
  }
}

function playTimeUpSound() {
  timeUpSound.play().catch((e) => console.warn("Audio play failed:", e));
}

function setVolume(volume) {
  timeUpSound.volume = volume;
}

window.audio = { initAudio, playTimeUpSound, setVolume };
