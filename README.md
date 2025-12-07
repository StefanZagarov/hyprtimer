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

Download the latest release for your platform from the [Releases](https://github.com/StefanZagarov/Hyprtimer/releases) page.

#### Linux

**Debian/Ubuntu (.deb)**
```bash
# Download the .deb file from releases, then install:
sudo dpkg -i hyprtimer_*.deb

# If there are dependency issues:
sudo apt-get install -f

# Launch from applications menu or run:
hyprtimer
```

**Fedora/RHEL (.rpm)**
```bash
# Download the .rpm file from releases, then install:
sudo rpm -i hyprtimer-*.rpm

# Or using dnf:
sudo dnf install ./hyprtimer-*.rpm

# Launch from applications menu or run:
hyprtimer
```

**Arch Linux / Other distros (.zip - portable)**
```bash
# Download the .zip file from releases, then extract:
unzip hyprtimer-linux-x64-*.zip

# Move to your preferred location (example using ~/.local/share):
mkdir -p ~/.local/share/hyprtimer
mv hyprtimer-linux-x64/* ~/.local/share/hyprtimer/

# Download and install the icon:
mkdir -p ~/.local/share/icons
curl -L https://raw.githubusercontent.com/StefanZagarov/Hyprtimer/main/src/assets/icons/icon.png \
  -o ~/.local/share/icons/hyprtimer.png

# Create a desktop entry for application launchers (rofi, dmenu, etc.):
cat > ~/.local/share/applications/hyprtimer.desktop << EOF
[Desktop Entry]
Name=Hyprtimer
Comment=Precise countdown timer
Exec=$HOME/.local/share/hyprtimer/hyprtimer
Icon=hyprtimer
Terminal=false
Type=Application
Categories=Utility;
EOF

# Update desktop database:
update-desktop-database ~/.local/share/applications/

# Now you can launch with rofi by typing "Hyprtimer"
```

#### Windows

1. Download the `.exe` installer from releases
2. Run the installer (it will install Hyprtimer to your system)
3. Launch Hyprtimer from the Start menu or Desktop shortcut

#### macOS

1. Download the `.zip` file from releases
2. Extract the archive
3. Move `Hyprtimer.app` to your Applications folder
4. Launch Hyprtimer from Applications or Launchpad

#### Build from Source

```bash
# Clone the repository
git clone https://github.com/StefanZagarov/Hyprtimer.git
cd Hyprtimer

# Install dependencies
npm install

# Run in development mode
npm start

# Or build for your platform
npm run make
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

Electron Forge will create platform-specific installers in the `out/make/` directory:
- **Linux**: `.deb`, `.rpm`, `.zip`
- **Windows**: `.exe` (Squirrel installer)
- **macOS**: `.zip`

Releases are automatically built for all platforms when you push a version tag (e.g., `v1.0.0`).

## Tech Stack

- **Electron** - Cross-platform desktop framework
- **Electron Forge** - Build and packaging toolchain
- **Electron Store** - Persistent storage
- Vanilla JavaScript (no frameworks - lightweight and fast)

## Platform Support

- **Linux** (tested on Arch Linux/Hyprland)
  - Debian/Ubuntu (`.deb`) - Auto-installs desktop entry
  - Fedora/RHEL (`.rpm`) - Auto-installs desktop entry
  - Portable (`.zip`) - Manual desktop entry setup required
- **Windows** 
  - Installer (`.exe`) - Auto-creates Start Menu shortcuts
- **macOS**
  - Portable (`.zip`) - Drag to Applications folder

The application is built with Electron to ensure cross-platform compatibility. 

**Note:** `.deb` and `.rpm` packages automatically install desktop entries for application launchers (rofi, dmenu, application menus). Portable `.zip` users need to follow the manual setup instructions above.