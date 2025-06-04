#!/bin/bash

# Test script for Forms-Clone SOAP API
# This script tests the main SOAP endpoints

# Configuration
HOST="localhost"
PORT="3001"
ENDPOINT="http://${HOST}:${PORT}/soap/formsclone"
WSDL="${ENDPOINT}?wsdl"

echo "Testing Forms-Clone SOAP API"
echo "============================"
echo "WSDL URL: ${WSDL}"
echo

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed. Please install curl to run this test."
    exit 1
fi

# Check if server is running
echo "Testing server connection..."
curl -s --head "${WSDL}" > /dev/null
if [ $? -ne 0 ]; then
    echo "Error: Server is not running or not accessible."
    echo "Please start the server with 'npm run dev' before running tests."
    exit 1
fi
echo "Server is running."
echo

# Test login operation
echo "Testing loginUser operation..."
LOGIN_REQUEST='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://formsclone.service/">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:LoginRequest>
         <ser:email>admin@example.com</ser:email>
         <ser:password>password123</ser:password>
      </ser:LoginRequest>
   </soapenv:Body>
</soapenv:Envelope>'

LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: text/xml" -d "${LOGIN_REQUEST}" "${ENDPOINT}")
echo "Login response received."

# Extract token from login response
TOKEN=$(echo ${LOGIN_RESPONSE} | sed -n 's/.*<token>\([^<]*\)<\/token>.*/\1/p')
if [ -z "${TOKEN}" ]; then
    echo "Error: Failed to get token from login response."
    echo "Response: ${LOGIN_RESPONSE}"
    exit 1
fi
echo "Login successful. Token received."
echo

# Test create user operation
echo "Testing createUser operation..."
# Generate unique email using timestamp
TIMESTAMP=$(date +%s)
UNIQUE_EMAIL="test${TIMESTAMP}@example.com"
CREATE_USER_REQUEST='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://formsclone.service/">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:CreateUserRequest>
         <ser:email>'${UNIQUE_EMAIL}'</ser:email>
         <ser:password>password123</ser:password>
         <ser:name>Test User</ser:name>
      </ser:CreateUserRequest>
   </soapenv:Body>
</soapenv:Envelope>'

CREATE_USER_RESPONSE=$(curl -s -X POST -H "Content-Type: text/xml" -d "${CREATE_USER_REQUEST}" "${ENDPOINT}")
echo "Create user response received."

# Extract user ID from create user response
USER_ID=$(echo ${CREATE_USER_RESPONSE} | sed -n 's/.*<id>\([^<]*\)<\/id>.*/\1/p')
if [ -z "${USER_ID}" ]; then
    echo "Error: Failed to get user ID from create user response."
    echo "Response: ${CREATE_USER_RESPONSE}"
    exit 1
fi
echo "User creation successful. User ID: ${USER_ID}"
echo

echo "All tests completed successfully."
echo "============================"
