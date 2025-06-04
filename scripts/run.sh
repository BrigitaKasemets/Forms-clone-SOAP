#!/bin/bash

# Run script for Forms-Clone API
# This script starts both the SOAP and REST API servers

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

# Check if .env file exists for SOAP API, if not create it from template
if [ ! -f "./src/config/.env" ]; then
    echo "Creating SOAP API .env file from template..."
    cp "./src/config/.env.example" "./src/config/.env"
    
    # Generate a secure JWT secret and update .env file
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i '' "s/your_jwt_secret_key_here/$JWT_SECRET/g" "./src/config/.env"
    
    echo "Created SOAP API .env file with secure JWT secret."
fi

# Check if .env file exists for REST API, if not create it from template
if [ -d "./forms-clone-api" ]; then
    if [ ! -f "./forms-clone-api/.env" ] && [ -f "./forms-clone-api/.env.example" ]; then
        echo "Creating REST API .env file from template..."
        cp "./forms-clone-api/.env.example" "./forms-clone-api/.env"
        
        # Generate a secure JWT secret and update .env file
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i '' "s/your_strong_jwt_secret_here/$JWT_SECRET/g" "./forms-clone-api/.env"
        
        echo "Created REST API .env file with secure JWT secret."
    fi
fi

# Install dependencies for SOAP API if needed
if [ ! -d "node_modules" ]; then
    echo "Installing SOAP API dependencies..."
    npm install
    echo "SOAP API dependencies installed."
fi

# Install dependencies for REST API if needed
if [ -d "forms-clone-api" ] && [ ! -d "forms-clone-api/node_modules" ]; then
    echo "Installing REST API dependencies..."
    cd forms-clone-api
    npm install
    cd ..
    echo "REST API dependencies installed."
fi

# Check if database is initialized
if [ ! -f "./data/forms.db" ]; then
    echo "Initializing database..."
    mkdir -p data
    npm run init-db
    echo "Database initialized."
fi

# Start both servers in background
echo "Starting Forms-Clone SOAP and REST API servers..."

# Start REST API in background
if [ -d "forms-clone-api" ]; then
    echo "Starting REST API server..."
    cd forms-clone-api
    npm run dev &
    REST_PID=$!
    cd ..
    echo "REST API server started with PID: $REST_PID"
fi

# Start SOAP API
echo "Starting SOAP API server..."
npm run dev

# This will only execute if the SOAP server stops
if [ -n "$REST_PID" ]; then
    echo "Stopping REST API server..."
    kill $REST_PID
fi
