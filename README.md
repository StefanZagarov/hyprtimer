# Hyprtimer

A precise, cross-platform countdown timer built with Electron. Clean interface, accurate timing, and flexible configuration for everyday use.

## Features

- **Dual Timing Modes**
  - **Instant Mode** (default): Timer starts immediately when you press start
  - **Clock Mode**: Syncs with real-world clock seconds - perfect for starting multiple timers simultaneously
  
- **Overtime Counter**: Automatically tracks elapsed time after the timer finishes

- **Persistent Settings**: Your timer configuration and preferences are saved automatically

- **Customizable**
  - Adjustable volume control
  - Toggle title display
  - Toggle overtime counter
  - Vibration feedback (on supported devices)

- **Clean, Minimal Interface**: Distraction-free design focused on the essentials

## Quick Start

### Installation

**Option 1: Download Release (Recommended)**
```bash
# Coming soon - pre-built binaries will be available in Releases
```

**Option 2: Build from Source**
```bash
# Clone the repository
git clone https://github.com/StefanZagarov/Hyprtimer.git
cd Hyprtimer

# Install dependencies
npm install

# Run the application
npm start
```

## Usage

### Setting a Timer

1. Click on the timer display (`00:00:00`)
2. Enter hours, minutes, and seconds
3. Click "Set Timer"
4. Press "Start" to begin the countdown

### Timing Modes

Access timing modes through the settings panel (gear icon):

- **Instant Mode**: Timer decrements immediately upon starting. Best for general use and maximum responsiveness.

- **Clock Mode**: Timer updates sync with system clock's round seconds. Ideal when you need to start multiple timers at exactly the same time, or want alignment with real-world clock seconds.

### Overtime Counter

When the timer reaches zero, an overtime counter automatically starts tracking elapsed time. This is useful for seeing how much extra time a task took, or general time awareness after the timer completes

Toggle this feature on/off in settings if you don't need it.

### Settings

Click the gear icon to access:
- **Title Display**: Show/hide the timer status text
- **Overtime Counter**: Enable/disable elapsed time tracking
- **Vibration**: Haptic feedback on timer completion (mobile devices only)
- **Volume**: Adjust the alarm sound level
- **Timing Mode**: Switch between Instant and Clock modes

## Building & Packaging

### Development
```bash
npm start
```

### Package for your platform
```bash
npm run package
```

### Create distribution packages
```bash
npm run make
```

Electron Forge will create platform-specific installers in the `out/` directory:
- **Linux**: `.deb`, `.rpm`, `.zip`
- **Windows**: `.exe`, `.zip` (when built on Windows)
- **macOS**: `.dmg`, `.zip` (when built on macOS)

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Electron Forge** - Build and packaging toolchain
- **Electron Store** - Persistent storage
- Vanilla JavaScript (no frameworks - lightweight and fast)

## Platform Support

- **Linux** (tested on Arch Linux/Hyprland)
- **Windows** (planned)
- **macOS** (planned)

The application is built with Electron to ensure cross-platform compatibility.