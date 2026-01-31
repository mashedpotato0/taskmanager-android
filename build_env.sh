#!/bin/bash

PROJECT_DIR=$(pwd)
SDK_DIR="$PROJECT_DIR/local_sdk"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip"

mkdir -p "$SDK_DIR"

if [ ! -d "$SDK_DIR/cmdline-tools" ]; then
    echo "Downloading Android Command Line Tools..."
    wget -q $CMDLINE_TOOLS_URL -O tools.zip
    unzip -q tools.zip -d "$SDK_DIR"
    rm tools.zip
    
    mkdir -p "$SDK_DIR/cmdline-tools/latest"
    mv "$SDK_DIR/cmdline-tools/"* "$SDK_DIR/cmdline-tools/latest/" 2>/dev/null
fi

export ANDROID_HOME="$SDK_DIR"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

echo "Installing SDK Platforms and Build Tools..."
yes | sdkmanager --sdk_root="$SDK_DIR" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

echo "Environment ready! ANDROID_HOME is set to $SDK_DIR"
