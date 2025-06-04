#!/bin/bash

# Run script for Forms-Clone SOAP API
# This script starts the SOAP server

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm to run this application."
    exit 1
fi

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.."

# Check if .env file exists, if not create it from template
if [ ! -f "./src/config/.env" ]; then
    echo "Creating .env file from template..."
    cp "./src/config/.env.example" "./src/config/.env"
    echo "Created .env file. Please review and update it if necessary."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "Dependencies installed."
fi

# Check if database is initialized
if [ ! -f "./data/forms.db" ]; then
    echo "Initializing database..."
    mkdir -p data
    npm run init-db
    echo "Database initialized."
fi

# Start the server
echo "Starting Forms-Clone SOAP server..."
npm run dev
