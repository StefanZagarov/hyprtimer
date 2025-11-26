const TIMER_STATE = {
  IDLE: `idle`,
  RUNNING: `running`,
  PAUSED: `paused`,
  FINISHED: `finished`,
};
const SETTINGS_KEYS = {
  VOLUME: "volume",
  VIBRATION: "vibration",
  SHOW_TITLE: "showTitle",
  SHOW_OVERTIME: "showOvertime",
  MODE: "mode",
};

const MODES = [`instant`, `clock`];

const DEFAULT_TIME = `00:00:00`;
const DEFAULT_OVERTIME = `00:00:00`;
const DEFAULT_MODE = MODES[0];

module.exports = {
  TIMER_STATE,
  SETTINGS_KEYS,
  DEFAULT_TIME,
  DEFAULT_OVERTIME,
  DEFAULT_MODE,
  MODES,
};
