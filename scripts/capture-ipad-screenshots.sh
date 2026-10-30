#!/usr/bin/env bash

# Directory for App Store screenshots
OUTPUT_DIR="assets/app-store-screenshots/ipad-13"
mkdir -p "$OUTPUT_DIR"

# Device ID for iPad Pro 13-inch (M4) or booted simulator
DEVICE_ID="922A1672-7CD7-459E-869D-B86F9012411B"

# Determine filename
if [ -n "$1" ]; then
    FILENAME="$1.png"
else
    COUNT=$(ls -1 "$OUTPUT_DIR" 2>/dev/null | grep -E '^screenshot_[0-9]+\.png$' | wc -l | tr -d ' ')
    INDEX=$((COUNT + 1))
    FILENAME=$(printf "screenshot_%02d.png" "$INDEX")
fi

DEST="$OUTPUT_DIR/$FILENAME"

echo "📸 Taking screenshot of iPad Pro 13-inch (M4)..."
xcrun simctl io "$DEVICE_ID" screenshot --mask=black "$DEST"

if [ -f "$DEST" ]; then
    WIDTH=$(sips -g pixelWidth "$DEST" | awk '/pixelWidth/{print $2}')
    HEIGHT=$(sips -g pixelHeight "$DEST" | awk '/pixelHeight/{print $2}')
    ALPHA=$(sips -g hasAlpha "$DEST" | awk '/hasAlpha/{print $2}')
    echo "✅ Screenshot saved successfully: $DEST"
    echo "   Dimensions: ${WIDTH}x${HEIGHT} px (Required: 2064x2752 or 2752x2064)"
    echo "   Has Alpha: $ALPHA (App Store requires: no)"
else
    echo "❌ Failed to take screenshot."
    exit 1
fi
