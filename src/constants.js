const TIMER_STATE = {
  IDLE: `idle`,
  RUNNING: `running`,
  PAUSED: `paused`,
  FINISHED: `finished`,
};
const MODES = [`clock`, `instant`];

const DEFAULT_TIME = `00:00:00`;
const DEFAULT_MODE = MODES[0];

module.exports = {
  TIMER_STATE,
  DEFAULT_TIME,
  DEFAULT_MODE,
  MODES,
};
