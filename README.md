# FocusGrid (Task Manager Android)

A standalone, privacy-focused mobile habit and task management application built with web technologies (HTML/CSS/JS) and packaged natively for Android using [Capacitor](https://capacitorjs.com/).

## Features

- **100% Offline & Private:** All data is strictly kept on-device using local storage. No server sync or external backend required.
- **Advanced Task Types:**
  - **Boolean:** Simple checkbox habits (e.g., Reading, Gym).
  - **Time:** Set target times with conditions ("Before" or "After").
  - **Score:** Set custom max scores with options to cap them or allow percentage overflow.
- **Dynamic Stats & Charting:**
  - **Sleep & Wake Tracking:** A dedicated chart combining sleep and wake times, including a smart visual crossover fix for times extending past midnight.
  - **Tracked Stats:** Automatically generates isolated graphs for any score tasks you choose to track visually.
  - **Daily Efficiency Score:** A calculated percentage grade based on your habit weightings.
- **Automated Compilation Pipeline:** Custom shell scripts automatically pull the Android SDK, sync web assets, and build your release-ready APK.

## Tech Stack

| Layer | Technology |
|---|---|
| App Framework | Capacitor 8 |
| Platform | Android |
| Frontend | Vanilla HTML, CSS, JavaScript (Chart.js) |
| Runtime | WebView (Android) |

## Project Structure

```
taskmanager-android/
├── www/                  # Web app source (HTML, CSS, JS)
│   ├── index.html
│   ├── css/
│   └── js/
├── android/              # Native Android project (Gradle)
├── local_sdk/            # Auto-downloaded Android SDK build tools
├── build_env.sh          # SDK Environment variables
├── compile.sh            # Master script to compile the debug APK
├── run_app.py            # Local desktop test server
├── start.sh              # Local desktop launch script
└── package.json
```

## Compilation & Build

To generate the Android `.apk` directly on your machine without Android Studio:

```bash
chmod +x compile.sh
./compile.sh
```

This master script will:
1. Source `build_env.sh` (Downloading the Android SDK tools locally if missing).
2. Install npm dependencies.
3. Sync the `www/` web assets to the native Android framework via Capacitor.
4. Use Gradle to assemble the debug APK.

Once complete, your compiled application will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Local Desktop Testing

You can preview the app on your PC browser by running:

```bash
./start.sh
```
