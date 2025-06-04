#!/bin/bash
# Script to run the API comparison tests

echo "Installing required npm packages for the test..."
npm install axios xml2js --save-dev

echo "Running the API comparison tests..."
node tests/compare_apis.js

exit_code=$?
if [ $exit_code -eq 0 ]; then
  echo "✅ Tests completed successfully!"
else
  echo "❌ Tests failed with exit code $exit_code"
fi

echo "Check the test results in the tests/results directory."
