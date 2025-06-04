/**
 * Test script for Forms-Clone SOAP API
 * Tests various operations against the SOAP API
 */

const soap = require('soap');
const util = require('util');

// WSDL URL
const url = 'http://localhost:3001/soap/formsclone?wsdl';

// Run all tests
async function runTests() {
  try {
    console.log('Forms-Clone SOAP API Tests');
    console.log('=========================');
    
    // Step 1: Login
    console.log('\n1. Testing Login');
    const loginResult = await login('admin@example.com', 'password123');
    const token = loginResult.token;
    console.log('Login successful, received token');
    
    // Step 2: Create a form
    console.log('\n2. Testing Create Form');
    const formResult = await createForm(token, 'Test Form', 'A test form');
    const formId = formResult.form.id;
    console.log(`Form created with ID: ${formId}`);
    
    // Step 3: Add a question
    console.log('\n3. Testing Add Question');
    const questionResult = await addQuestion(token, formId, 'What is your name?', 'text', true);
    const questionId = questionResult.question.id;
    console.log(`Question added with ID: ${questionId}`);
    
    // Step 4: Get form with questions
    console.log('\n4. Testing Get Form');
    const getFormResult = await getForm(formId, token);
    console.log(`Retrieved form with ${getFormResult.questions ? getFormResult.questions.length : 0} questions`);
    
    // Step 5: Update form
    console.log('\n5. Testing Update Form');
    const updateFormResult = await updateForm(token, formId, 'Updated Test Form');
    console.log('Form update result:', updateFormResult.success ? 'Success' : 'Failed');
    
    // Step 6: Update question
    console.log('\n6. Testing Update Question');
    const updateQuestionResult = await updateQuestion(token, formId, questionId, 'What is your full name?');
    console.log('Question update result:', updateQuestionResult.success ? 'Success' : 'Failed');
    
    // Step 7: List forms
    console.log('\n7. Testing List Forms');
    const listFormsResult = await listForms(token);
    console.log(`Retrieved ${listFormsResult.forms ? listFormsResult.forms.length : 0} forms`);
    
    // Step 8: Submit a response
    console.log('\n8. Testing Submit Response');
    const answers = [
      { questionId: questionId, value: 'John Doe' }
    ];
    const submitResponseResult = await submitResponse(formId, token, answers);
    const responseId = submitResponseResult.responseId;
    console.log(`Response submitted with ID: ${responseId}`);
    
    // Step 9: Get response
    console.log('\n9. Testing Get Response');
    const getResponseResult = await getResponse(token, formId, responseId);
    console.log(`Retrieved response with ${getResponseResult.response.answers ? getResponseResult.response.answers.length : 0} answers`);
    
    // Step 10: List responses
    console.log('\n10. Testing List Responses');
    const listResponsesResult = await listResponses(token, formId);
    console.log(`Retrieved ${listResponsesResult.responses ? listResponsesResult.responses.length : 0} responses`);
    
    // Step 11: Update response
    console.log('\n11. Testing Update Response');
    const updatedAnswers = [
      { questionId: questionId, value: 'Jane Smith' }
    ];
    const updateResponseResult = await updateResponse(token, formId, responseId, updatedAnswers);
    console.log('Response update result:', updateResponseResult.success ? 'Success' : 'Failed');
    
    // Step 12: Create a new user
    console.log('\n12. Testing Create User');
    const createUserResult = await createUser('test@example.com', 'password', 'Test User');
    const userId = createUserResult.user.id;
    console.log(`User created with ID: ${userId}`);
    
    // Step 13: Get user
    console.log('\n13. Testing Get User');
    const getUserResult = await getUser(token, userId);
    console.log(`Retrieved user: ${getUserResult.user.name}`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Function implementations
async function login(email, password) {
  const client = await soap.createClientAsync(url);
  const result = await client.loginUserAsync({
    email: email,
    password: password
  });
  return result[0];
}

async function createUser(email, password, name) {
  const client = await soap.createClientAsync(url);
  const result = await client.createUserAsync({
    email: email,
    password: password,
    name: name
  });
  return result[0];
}

async function getUser(token, userId) {
  const client = await soap.createClientAsync(url);
  const result = await client.getUserAsync({
    token: token,
    userId: userId
  });
  return result[0];
}

async function createForm(token, title, description = '') {
  const client = await soap.createClientAsync(url);
  const result = await client.createFormAsync({
    token: token,
    title: title,
    description: description
  });
  return result[0];
}

async function getForm(formId, token) {
  const client = await soap.createClientAsync(url);
  const result = await client.getFormAsync({
    formId: formId,
    token: token
  });
  return result[0];
}

async function updateForm(token, formId, title, description, isPublished) {
  const client = await soap.createClientAsync(url);
  const args = {
    token: token,
    formId: formId
  };
  
  if (title !== undefined) args.title = title;
  if (description !== undefined) args.description = description;
  if (isPublished !== undefined) args.isPublished = isPublished;
  
  const result = await client.updateFormAsync(args);
  return result[0];
}

async function listForms(token) {
  const client = await soap.createClientAsync(url);
  const result = await client.listFormsAsync({
    token: token
  });
  return result[0];
}

async function addQuestion(token, formId, title, type, required, options) {
  const client = await soap.createClientAsync(url);
  const args = {
    token: token,
    formId: formId,
    title: title,
    type: type,
    required: required
  };
  
  if (options !== undefined) args.options = options;
  
  const result = await client.addQuestionAsync(args);
  return result[0];
}

async function updateQuestion(token, formId, questionId, title, type, required, options, order) {
  const client = await soap.createClientAsync(url);
  const args = {
    token: token,
    formId: formId,
    questionId: questionId
  };
  
  if (title !== undefined) args.title = title;
  if (type !== undefined) args.type = type;
  if (required !== undefined) args.required = required;
  if (options !== undefined) args.options = options;
  if (order !== undefined) args.order = order;
  
  const result = await client.updateQuestionAsync(args);
  return result[0];
}

async function submitResponse(formId, token, answers) {
  const client = await soap.createClientAsync(url);
  const result = await client.submitResponseAsync({
    formId: formId,
    token: token,
    answers: answers
  });
  return result[0];
}

async function getResponse(token, formId, responseId) {
  const client = await soap.createClientAsync(url);
  const result = await client.getResponseAsync({
    token: token,
    formId: formId,
    responseId: responseId
  });
  return result[0];
}

async function listResponses(token, formId) {
  const client = await soap.createClientAsync(url);
  const result = await client.listResponsesAsync({
    token: token,
    formId: formId
  });
  return result[0];
}

async function updateResponse(token, formId, responseId, answers) {
  const client = await soap.createClientAsync(url);
  const result = await client.updateResponseAsync({
    token: token,
    formId: formId,
    responseId: responseId,
    answers: answers
  });
  return result[0];
}

// Run the tests
runTests();
