#!/bin/bash
# Script to get SHA-1 from a JKS/keystore file

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-keystore.jks> [alias-name]"
    echo ""
    echo "Example:"
    echo "  $0 my-release-key.jks"
    echo "  $0 my-release-key.jks my-key-alias"
    echo ""
    echo "For debug keystore (default Android debug):"
    echo "  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android"
    exit 1
fi

KEYSTORE_FILE="$1"
ALIAS="${2:-androiddebugkey}"

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo "Error: Keystore file not found: $KEYSTORE_FILE"
    exit 1
fi

echo "Getting SHA-1 from: $KEYSTORE_FILE"
echo "Alias: $ALIAS"
echo ""

# Try without password first (for debug keystore)
if [ "$KEYSTORE_FILE" = "$HOME/.android/debug.keystore" ] || [ "$KEYSTORE_FILE" = "~/.android/debug.keystore" ]; then
    echo "Detected debug keystore, using default password..."
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass android -keypass android 2>/dev/null | grep -A 2 "Certificate fingerprints" | grep SHA1
else
    echo "Enter keystore password (or press Enter to try without password):"
    read -s STORE_PASS
    
    if [ -z "$STORE_PASS" ]; then
        echo "Trying without password..."
        keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" 2>/dev/null | grep -A 2 "Certificate fingerprints" | grep SHA1
    else
        echo "Enter key password (or press Enter if same as keystore password):"
        read -s KEY_PASS
        
        if [ -z "$KEY_PASS" ]; then
            KEY_PASS="$STORE_PASS"
        fi
        
        keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$ALIAS" -storepass "$STORE_PASS" -keypass "$KEY_PASS" 2>/dev/null | grep -A 2 "Certificate fingerprints" | grep SHA1
    fi
fi
