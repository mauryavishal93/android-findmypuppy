#!/bin/bash

# Google OAuth Setup Script
# This script helps you add Google OAuth credentials to your .env file

echo "🔐 Setting up Google OAuth credentials..."

# Google OAuth credentials
# IMPORTANT: Replace these with your actual credentials from Google Cloud Console
# Never commit actual credentials to git!
read -p "Enter your Google OAuth Client ID: " GOOGLE_CLIENT_ID
read -sp "Enter your Google OAuth Client Secret: " GOOGLE_CLIENT_SECRET
echo ""
VITE_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    touch .env
fi

# Function to add or update a variable in .env
add_or_update_env_var() {
    local var_name=$1
    local var_value=$2
    local file=$3
    
    # Check if variable already exists
    if grep -q "^${var_name}=" "$file"; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^${var_name}=.*|${var_name}=${var_value}|" "$file"
        else
            # Linux
            sed -i "s|^${var_name}=.*|${var_name}=${var_value}|" "$file"
        fi
        echo "✅ Updated ${var_name} in .env"
    else
        # Add new variable
        echo "" >> "$file"
        echo "# Google OAuth Configuration" >> "$file"
        echo "${var_name}=${var_value}" >> "$file"
        echo "✅ Added ${var_name} to .env"
    fi
}

# Add or update Google OAuth variables
add_or_update_env_var "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID" ".env"
add_or_update_env_var "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET" ".env"
add_or_update_env_var "VITE_GOOGLE_CLIENT_ID" "$VITE_GOOGLE_CLIENT_ID" ".env"

echo ""
echo "✨ Google OAuth credentials have been configured!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. For production, add these variables to your Render dashboard"
echo ""
echo "🔍 Verify the setup by checking your server logs for:"
echo "   '🔐 Google OAuth Initialized with Client ID: ...'"
echo ""
echo "⚠️  SECURITY: Never commit your .env file or actual credentials to git!"
echo ""
