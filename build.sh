#!/bin/bash
set -e

echo "=== Starting build process ==="

# Install root dependencies (React app)
echo "Installing root dependencies..."
npm install

# Build React app
echo "Building React app..."
npm run build

# Install server dependencies
echo "Installing server dependencies..."
cd server && npm install

echo "=== Build completed successfully! ===" 