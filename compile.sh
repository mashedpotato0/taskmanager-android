#!/bin/bash

echo "Starting compilation process..."

# env
if [ -f "build_env.sh" ]; then
    echo "Sourcing build environment..."
    source build_env.sh
else
    echo "Warning: build_env.sh not found. SDK environment might not be configured."
fi

# deps
echo "Installing NPM dependencies..."
npm install

# sync
echo "Syncing Capacitor project..."
npx cap sync android

# build
echo "Building APK using Gradle..."
cd android || exit 1
./gradlew assembleDebug

echo "Build complete! APK should be located in: android/app/build/outputs/apk/debug/app-debug.apk"
