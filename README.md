# Task Manager Android

A mobile task management app built with web technologies (HTML/CSS/JS) and packaged as a native Android application using [Capacitor](https://capacitorjs.com/).

## Features

- Create, view, and manage tasks on Android
- Native Android app experience powered by Capacitor
- Web-first codebase (`www/`) that runs in any browser too

## Tech Stack

| Layer | Technology |
|---|---|
| App Framework | Capacitor 8 |
| Platform | Android |
| Frontend | HTML, CSS, JavaScript |
| Runtime | WebView (Android) |

## Project Structure

```
taskmanager-android/
├── www/                  # Web app source (HTML, CSS, JS)
│   ├── index.html
│   ├── css/
│   └── js/
├── android/              # Native Android project (Gradle)
├── capacitor.config.json # Capacitor configuration
├── package.json
├── run_app.py            # Helper script to build & run
├── start.sh              # Linux build/run script
└── start.bat             # Windows build/run script
```

## Setup

### Prerequisites

- Node.js
- Android Studio + Android SDK
- Java 17+

### Install dependencies

```bash
npm install
```

### Run on Android

```bash
# Using the helper script
bash start.sh

# Or manually
npx cap sync android
npx cap open android
```

Then build and run the project from Android Studio, or use:

```bash
npx cap run android
```

### Run in browser (development)

Open `www/index.html` directly in your browser, or serve it with any static file server.
