#!/bin/bash
set -e

echo "=== Starting build process ==="

# Install root dependencies (React app)
echo "Installing root dependencies..."
npm install --verbose

# Check if react-scripts is available
echo "Checking if react-scripts is available..."
if ! command -v react-scripts &> /dev/null; then
    echo "react-scripts not found in PATH, trying npx..."
    npx react-scripts --version
fi

# Build React app
echo "Building React app..."
npm run build

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install

echo "=== Build completed successfully! ===" 