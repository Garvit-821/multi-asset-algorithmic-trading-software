#!/bin/bash
set -e

echo "=========================================="
echo "🚀 Setting up Android SDK & Building APK"
echo "=========================================="

# Detect or install Android SDK
if [ -d "$HOME/Android/Sdk" ]; then
    SDK_PATH="$HOME/Android/Sdk"
    echo "✅ Found Android SDK at: $SDK_PATH"
elif [ -d "/usr/lib/android-sdk" ]; then
    SDK_PATH="/usr/lib/android-sdk"
    echo "✅ Found Android SDK at: $SDK_PATH"
else
    echo "📦 Installing android-sdk and OpenJDK 17 via apt..."
    sudo apt update && sudo apt install -y android-sdk openjdk-17-jdk
    SDK_PATH="/usr/lib/android-sdk"
fi

# Ensure SDK directory permissions
if [ "$SDK_PATH" = "/usr/lib/android-sdk" ]; then
    echo "🔑 Granting write permissions to $SDK_PATH..."
    sudo chown -R $USER:$USER /usr/lib/android-sdk 2>/dev/null || true
fi

# Configure local.properties
echo "sdk.dir=$SDK_PATH" > android/local.properties
echo "📝 Configured android/local.properties -> sdk.dir=$SDK_PATH"

# Auto-accept Android SDK licenses
echo "📜 Accepting Android SDK License Agreements..."
sudo mkdir -p "$SDK_PATH/licenses" 2>/dev/null || mkdir -p "$SDK_PATH/licenses" 2>/dev/null || true
echo -e "89330d722b24741a1578b6f5598d3908744f4e68\n24333f8a63b6825ea9c5514f83c2829b004d1fee\n791244e692b300e653ee1134a772636dfef00a4d\nd56f5187479451eabf01fb78af6dfcb131a6481e" | sudo tee "$SDK_PATH/licenses/android-sdk-license" > /dev/null 2>&1 || true

if command -v sdkmanager &> /dev/null; then
    yes | sdkmanager --licenses 2>/dev/null || true
fi

# Build production bundle
echo "🔨 Building web production bundle..."
npm run build

# Sync Capacitor assets
echo "⚡ Syncing Capacitor native assets..."
npx cap sync

# Assemble debug APK
echo "📦 Assembling Debug APK via Gradle..."
cd android
./gradlew assembleDebug

echo ""
echo "=========================================="
echo "🎉 BUILD SUCCESSFUL!"
echo "📍 APK Output Path:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo "=========================================="
