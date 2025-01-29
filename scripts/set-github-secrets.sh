#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI not found. Installing..."
    brew install gh
fi

# Check if logged in
gh auth status || gh auth login

# Read .env.production and set secrets
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Clean up key/value
    key=$(echo $key | xargs)
    value=$(echo $value | xargs)
    
    # Set GitHub secret
    echo "Setting secret: $key"
    echo "$value" | gh secret set "$key" --repo "$(git remote get-url origin)"
done < .env.production

echo "Secrets have been set successfully!"