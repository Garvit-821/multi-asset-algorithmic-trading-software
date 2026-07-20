# Native Android APK Build & Capacitor Integration Guide

This document provides a comprehensive technical architecture record of how the **CryptoAgent** React, Vite, and TypeScript web application is packaged into a native Android Application (`.apk`) using **Ionic Capacitor**. 

It details the internal packaging mechanics, exact configuration files, every error encountered during the Linux/Gradle compilation process, and the terminal commands used to resolve them.

---

## Table of Contents
1. [Deep Technical Architecture: How Capacitor Packages React/Vite/TSX Apps](#1-deep-technical-architecture-how-capacitor-packages-reactvitetsx-apps)
   - [Phase A: Web Compilation (Vite & TypeScript Engine)](#phase-a-web-compilation-vite--typescript-engine)
   - [Phase B: Capacitor Asset Synchronization (`npx cap sync`)](#phase-b-capacitor-asset-synchronization-npx-cap-sync)
   - [Phase C: Android Native Bootstrapping (`BridgeActivity`)](#phase-c-android-native-bootstrapping-bridgeactivity)
   - [Phase D: JavaScript-to-Java IPC Bridge Execution](#phase-d-javascript-to-java-ipc-bridge-execution)
   - [Phase E: Network Stack & WebSocket Handling](#phase-e-network-stack--websocket-handling)
2. [Toolchain & Prerequisites](#2-toolchain--prerequisites)
3. [Step-by-Step Implementation Flow](#3-step-by-step-implementation-flow)
   - [Step 3.1: Mobile Viewport Optimization (`index.html`)](#step-31-mobile-viewport-optimization-indexhtml)
   - [Step 3.2: Capacitor Installation & Configuration](#step-32-capacitor-installation--configuration)
   - [Step 3.3: Native Android Project Generation](#step-33-native-android-project-generation)
4. [Troubleshooting & Errors Encountered](#4-troubleshooting--errors-encountered)
   - [Issue 1: Missing Android SDK Location (`sdk.dir`)](#issue-1-missing-android-sdk-location-sdkdir)
   - [Issue 2: Unaccepted Android SDK License Agreements](#issue-2-unaccepted-android-sdk-license-agreements)
   - [Issue 3: Read-Only SDK Directory Permissions](#issue-3-read-only-sdk-directory-permissions)
5. [Automated One-Click Build Script (`setup-android.sh`)](#5-automated-one-click-build-script-setup-androidsh)
6. [Master Command Cheat Sheet](#6-master-command-cheat-sheet)
7. [Locating & Installing the `.apk` on Android Devices](#7-locating--installing-the-apk-on-android-devices)

---

## 1. Deep Technical Architecture: How Capacitor Packages React/Vite/TSX Apps

Converting a modern React application written in TypeScript (`.tsx`) into an Android binary (`.apk`) involves a five-stage build and runtime pipeline:

```text
+-----------------------------------------------------------------------------------+
|                            DEVELOPMENT SOURCE CODE                                |
|  React 18 Components (.tsx) | TypeScript Engine | Tailwind CSS | Recharts Canvas  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | 1. npm run build (Vite Rollup Bundler)
                                          v
+-----------------------------------------------------------------------------------+
|                            PRODUCTION WEB BUNDLE                                  |
|  dist/index.html | dist/assets/index-[hash].js | dist/assets/index-[hash].css      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | 2. npx cap sync (Asset Mirroring)
                                          v
+-----------------------------------------------------------------------------------+
|                        ANDROID EMBEDDED ASSET STORE                               |
|  android/app/src/main/assets/public/                                              |
|  ├── index.html                                                                   |
|  ├── capacitor.js (Native Interop Client)                                         |
|  └── assets/ (Minified JavaScript, CSS, & Web Worker Bundles)                     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | 3. ./gradlew assembleDebug (Java/Kotlin Compiler)
                                          v
+-----------------------------------------------------------------------------------+
|                          NATIVE ANDROID APK PACKAGE                               |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Android OS Application Container                                            |  |
|  |                                                                             |  |
|  |  MainActivity.java (Extends BridgeActivity)                                 |  |
|  |        |                                                                    |  |
|  |        v                                                                    |  |
|  |  BridgeWebView (android.webkit.WebView Engine)                            |  |
|  |  Loads: https://localhost/index.html (Local Asset Protocol)               |  |
|  |        |                                                                    |  |
|  |        +<===> Capacitor JS Bridge <===> Java IPC Plugins (Haptics, Push)    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

### Phase A: Web Compilation (Vite & TypeScript Engine)
1. **TypeScript Transpilation**: The Vite compiler parses TypeScript files (`.ts`, `.tsx`), performs strict type checking, strips interface definitions, and transforms JSX syntax into valid JavaScript (`React.createElement` or `jsxRuntime` calls).
2. **Bundling**: Rollup bundles the JavaScript modules, React components, TradingView lightweight charts, and mathematical libraries into optimized chunk files stored in the `/dist` output folder.
3. **Asset Generation**: Global styles, Tailwind utility directives, and fonts are compiled into static `/dist/assets/index.css`.

---

### Phase B: Capacitor Asset Synchronization (`npx cap sync`)
When `npx cap sync` runs, Capacitor performs two operations:
1. **Asset Mirroring**: Copies the entire content of `/dist` into the native Android source directory:
   `android/app/src/main/assets/public/`
2. **Plugin Injection**: Generates native Java plugin registry bindings (`CapacitorPlugins.java`) and injects the client-side JavaScript bridge library (`capacitor.js`) into the web application asset directory.

---

### Phase C: Android Native Bootstrapping (`BridgeActivity`)
The generated `/android` directory is a complete Gradle project:
1. **Entry Point**: The app defines `MainActivity.java`:
   ```java
   package com.cryptoagent.app;
   import com.getcapacitor.BridgeActivity;

   public class MainActivity extends BridgeActivity {}
   ```
2. **WebView Initialization**: `BridgeActivity` inherits from Android's base activity classes. When the app launches, `BridgeActivity` instantiates an extended Chrome-based WebView instance (`BridgeWebView`).
3. **Local HTTP Server Scheme**: Capacitor configures `server.androidScheme: "https"` in `capacitor.config.json`. The WebView serves the local assets internally via `https://localhost/index.html` rather than `file://`. This bypasses browser security restrictions regarding origin policies and local file access.

---

### Phase D: JavaScript-to-Java IPC Bridge Execution
When your React code invokes a native capability (e.g. Device Haptics, Local Storage, or System Notifications):
1. JavaScript serializes the payload:
   `window.Capacitor.toNative("Haptics", "vibrate", { duration: 300 })`
2. The `BridgeWebView` intercepts the function call and dispatches a JSON RPC payload across Android's JavascriptInterface bridge to Java runtime handlers.
3. The native Java plugin processes the hardware call on the Android OS level and returns an asynchronous promise callback back to the JavaScript event loop.

---

### Phase E: Network Stack & WebSocket Handling
Trading feeds (e.g. Binance WebSockets at `wss://stream.binance.com:9443`) and Supabase PostgreSQL queries connect directly over the Android device's native network interface. Because the WebView is hosted on `https://localhost`, socket handshakes proceed without encountering mixed-content security blocks.

---

## 2. Toolchain & Prerequisites

To compile the Android APK directly on Linux, the following packages are required:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **OpenJDK**: OpenJDK 17 (`openjdk-17-jdk`)
- **Android SDK Tools**: `android-sdk`, `build-tools;34.0.0`, `platforms;android-34`
- **Gradle Wrapper**: Included in project repository (`android/gradlew`)

---

## 3. Step-by-Step Implementation Flow

### Step 3.1: Mobile Viewport Optimization (`index.html`)
To prevent viewport scaling distortion and handle device notch safe areas:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="theme-color" content="#ffffff" />
```

### Step 3.2: Capacitor Installation & Configuration
1. Install core dependencies:
   ```bash
   npm install @capacitor/core
   npm install -D @capacitor/cli @capacitor/android
   ```
2. Configure `capacitor.config.json` in root directory:
   ```json
   {
     "appId": "com.cryptoagent.app",
     "appName": "CryptoAgent",
     "webDir": "dist",
     "server": {
       "androidScheme": "https"
     },
     "plugins": {
       "SplashScreen": {
         "launchShowDuration": 2000,
         "backgroundColor": "#ffffff",
         "showSpinner": false
       }
     }
   }
   ```

### Step 3.3: Native Android Project Generation
1. Initialize native Android project structure:
   ```bash
   npx cap add android
   ```
2. Compile web production assets:
   ```bash
   npm run build
   ```
3. Sync web assets into Android project:
   ```bash
   npx cap sync
   ```

---

## 4. Troubleshooting & Errors Encountered

During compilation on Linux using `./gradlew assembleDebug`, three build issues were encountered and resolved.

---

### Issue 1: Missing Android SDK Location (`sdk.dir`)

#### Error Log:
```text
FAILURE: Build failed with an exception.
* What went wrong:
Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'.
> Could not determine the dependencies of null.
   > SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
     or by setting the sdk.dir path in your project's local properties file at '/.../android/local.properties'.
```

#### Root Cause:
Gradle requires an explicit property declaring the file system path of the Android SDK installation.

#### Solution:
Created `android/local.properties` specifying the SDK location:
```properties
sdk.dir=/usr/lib/android-sdk
```

---

### Issue 2: Unaccepted Android SDK License Agreements

#### Error Log:
```text
Checking the license for package Android SDK Build-Tools 34 in /usr/lib/android-sdk/licenses
Warning: License for package Android SDK Build-Tools 34 not accepted.

FAILURE: Build failed with an exception.
* What went wrong:
> Failed to install the following Android SDK packages as some licences have not been accepted.
     platforms;android-34 Android SDK Platform 34
     build-tools;34.0.0 Android SDK Build-Tools 34
```

#### Root Cause:
Google requires explicit acceptance of SHA-1 license signatures before downloading target build platforms.

#### Solution:
Created `/usr/lib/android-sdk/licenses/android-sdk-license` containing the required SHA-1 license hashes:
```bash
sudo mkdir -p /usr/lib/android-sdk/licenses
echo -e "89330d722b24741a1578b6f5598d3908744f4e68\n24333f8a63b6825ea9c5514f83c2829b004d1fee\n791244e692b300e653ee1134a772636dfef00a4d\nd56f5187479451eabf01fb78af6dfcb131a6481e" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license > /dev/null
```

---

### Issue 3: Read-Only SDK Directory Permissions

#### Error Log:
```text
Checking the license for package Android SDK Build-Tools 34 in /usr/lib/android-sdk/licenses
License for package Android SDK Build-Tools 34 accepted.
Preparing "Install Android SDK Build-Tools 34 v.34.0.0".
Warning: Failed to read or create install properties file.

FAILURE: Build failed with an exception.
* What went wrong:
> Failed to install the following SDK components:
     platforms;android-34 Android SDK Platform 34
     build-tools;34.0.0 Android SDK Build-Tools 34
  The SDK directory is not writable (/usr/lib/android-sdk)
```

#### Root Cause:
System package managers (`apt`) install `/usr/lib/android-sdk` under `root:root` ownership, preventing unprivileged user processes from writing compiled artifacts into `build-tools/34.0.0`.

#### Solution:
Changed ownership of `/usr/lib/android-sdk` to the active Linux user account:
```bash
sudo chown -R $USER:$USER /usr/lib/android-sdk
```

---

## 5. Automated One-Click Build Script (`setup-android.sh`)

To automate environment detection, license verification, permissions setup, and compilation into a single command, we implemented `setup-android.sh`:

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "Setting up Android SDK & Building APK"
echo "=========================================="

# Detect or install Android SDK
if [ -d "$HOME/Android/Sdk" ]; then
    SDK_PATH="$HOME/Android/Sdk"
    echo "Found Android SDK at: $SDK_PATH"
elif [ -d "/usr/lib/android-sdk" ]; then
    SDK_PATH="/usr/lib/android-sdk"
    echo "Found Android SDK at: $SDK_PATH"
else
    echo "Installing android-sdk and OpenJDK 17 via apt..."
    sudo apt update && sudo apt install -y android-sdk openjdk-17-jdk
    SDK_PATH="/usr/lib/android-sdk"
fi

# Ensure SDK directory permissions
if [ "$SDK_PATH" = "/usr/lib/android-sdk" ]; then
    echo "Granting write permissions to $SDK_PATH..."
    sudo chown -R $USER:$USER /usr/lib/android-sdk 2>/dev/null || true
fi

# Configure local.properties
echo "sdk.dir=$SDK_PATH" > android/local.properties
echo "Configured android/local.properties -> sdk.dir=$SDK_PATH"

# Auto-accept Android SDK licenses
echo "Accepting Android SDK License Agreements..."
sudo mkdir -p "$SDK_PATH/licenses" 2>/dev/null || mkdir -p "$SDK_PATH/licenses" 2>/dev/null || true
echo -e "89330d722b24741a1578b6f5598d3908744f4e68\n24333f8a63b6825ea9c5514f83c2829b004d1fee\n791244e692b300e653ee1134a772636dfef00a4d\nd56f5187479451eabf01fb78af6dfcb131a6481e" | sudo tee "$SDK_PATH/licenses/android-sdk-license" > /dev/null 2>&1 || true

if command -v sdkmanager &> /dev/null; then
    yes | sdkmanager --licenses 2>/dev/null || true
fi

# Build production bundle
echo "Building web production bundle..."
npm run build

# Sync Capacitor assets
echo "Syncing Capacitor native assets..."
npx cap sync

# Assemble debug APK
echo "Assembling Debug APK via Gradle..."
cd android
./gradlew assembleDebug

echo ""
echo "=========================================="
echo "BUILD SUCCESSFUL"
echo "APK Output Path:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo "=========================================="
```

---

## 6. Master Command Cheat Sheet

The complete sequence of terminal commands in chronological order:

```bash
# 1. Install Capacitor dependencies
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

# 2. Generate native Android project directory
npx cap add android

# 3. Grant write permissions on Android SDK directory
sudo chown -R $USER:$USER /usr/lib/android-sdk

# 4. Define SDK path in local.properties
echo "sdk.dir=/usr/lib/android-sdk" > android/local.properties

# 5. Pre-accept Google SDK licenses
sudo mkdir -p /usr/lib/android-sdk/licenses
echo -e "89330d722b24741a1578b6f5598d3908744f4e68\n24333f8a63b6825ea9c5514f83c2829b004d1fee\n791244e692b300e653ee1134a772636dfef00a4d\nd56f5187479451eabf01fb78af6dfcb131a6481e" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license > /dev/null

# 6. Execute one-click automated build
bash setup-android.sh
```

---

## 7. Locating & Installing the `.apk` on Android Devices

### APK Output Path
The compiled Android binary is generated at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Installation Methods

#### Method A: Direct Transfer
1. Copy `app-debug.apk` to your target Android device via USB cable, Google Drive, or local server.
2. Open the file manager on your Android device and tap `app-debug.apk`.
3. Allow *"Install from Unknown Sources"* if prompted, and click **Install**.

#### Method B: ADB Command Line
With **USB Debugging** enabled on your mobile device, execute:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Summary
The React web application now compiles into a native Android app binary (`.apk`) running on smartphone hardware with full touch support, native safe-area inset management, and low-latency WebSocket charting.
