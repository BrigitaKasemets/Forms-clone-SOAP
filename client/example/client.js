/**
 * Forms-Clone SOAP API Client Example
 * A simple Node.js client to demonstrate how to connect to the SOAP API
 */

const soap = require('soap');
const util = require('util');

// WSDL URL
const url = 'http://localhost:3001/soap/formsclone?wsdl';

// Login function
async function login(email, password) {
  try {
    const client = await soap.createClientAsync(url);
    
    const result = await client.loginUserAsync({
      email: email,
      password: password
    });
    
    console.log('Login Result:');
    console.log(util.inspect(result, {depth: null, colors: true}));
    
    return result[0];
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
}

// Create user function
async function createUser(email, password, name) {
  try {
    const client = await soap.createClientAsync(url);
    
    const result = await client.createUserAsync({
      email: email,
      password: password,
      name: name
    });
    
    console.log('Create User Result:');
    console.log(util.inspect(result, {depth: null, colors: true}));
    
    return result[0];
  } catch (error) {
    console.error('Create User Error:', error);
    throw error;
  }
}

// Create form function
async function createForm(token, title, description = '') {
  try {
    const client = await soap.createClientAsync(url);
    
    const result = await client.createFormAsync({
      token: token,
      title: title,
      description: description
    });
    
    console.log('Create Form Result:');
    console.log(util.inspect(result, {depth: null, colors: true}));
    
    return result[0];
  } catch (error) {
    console.error('Create Form Error:', error);
    throw error;
  }
}

// Main function to run the example
async function runExample() {
  try {
    console.log('Forms-Clone SOAP API Client Example');
    console.log('===================================');
    
    // Step 1: Login
    console.log('\nStep 1: Login with admin user');
    const loginResult = await login('admin@example.com', 'password123');
    const token = loginResult.token;
    
    // Step 2: Create a new user
    console.log('\nStep 2: Create a new user');
    await createUser('newuser@example.com', 'userpassword', 'New Test User');
    
    // Step 3: Create a form
    console.log('\nStep 3: Create a new form');
    const formResult = await createForm(token, 'Test Feedback Form', 'A form for testing the SOAP API');
    
    console.log('\nExample completed successfully!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Run the example
runExample();
