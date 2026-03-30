#!/bin/bash
set -e

echo "Building Universal Binary for macOS..."

# Build for both architectures
echo "Building for x86_64..."
npm run tauri build -- --target x86_64-apple-darwin

echo "Building for aarch64..."
npm run tauri build -- --target aarch64-apple-darwin

# Create universal binary
echo "Creating universal binary..."
lipo -create \
  src-tauri/target/x86_64-apple-darwin/release/voiceforge \
  src-tauri/target/aarch64-apple-darwin/release/voiceforge \
  -output src-tauri/target/release/voiceforge-universal

# Copy to app bundle
echo "Updating app bundle..."
cp src-tauri/target/release/voiceforge-universal \
  src-tauri/target/release/bundle/macos/VoiceForge.app/Contents/MacOS/VoiceForge

# Create DMG
echo "Creating universal DMG..."
hdiutil create -volname "VoiceForge" \
  -srcfolder src-tauri/target/release/bundle/macos/VoiceForge.app \
  -ov -format UDZO VoiceForge_universal.dmg

echo "✅ Done! Universal DMG created: VoiceForge_universal.dmg"
lipo -info src-tauri/target/release/bundle/macos/VoiceForge.app/Contents/MacOS/VoiceForge
