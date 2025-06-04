const soap = require('soap');
const util = require('util');

// WSDL URL - pointing to the SOAP service endpoint
const WSDL_URL = 'http://localhost:3001/soap/formsclone?wsdl';

async function main() {
  try {
    console.log('Forms-Clone SOAP API Client Example');
    console.log('===================================');
    
    const client = await soap.createClientAsync(WSDL_URL);
    
    // 1. Create a user
    console.log('\n1. Testing Create User');
    const userResp = await client.createUserAsync({
      email: `test.user.${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      timezone: 'Europe/Tallinn'
    });
    console.log('CreateUser:', userResp[0]);
    const userId = userResp[0].user ? userResp[0].user.id : (userResp[0].data ? userResp[0].data.id : null);
    
    // 2. Login (Create Session)
    console.log('\n2. Testing Login');
    const sessionResp = await client.loginUserAsync({
      email: userResp[0].user.email,
      password: 'password123'
    });
    const token = sessionResp[0].token;
    console.log('CreateSession:', sessionResp[0]);
    
    // 3. Get User
    console.log('\n3. Testing Get User');
    const getUserResp = await client.getUserAsync({ token, userId });
    console.log('GetUser:', getUserResp[0].user);
    
    // 4. Update User
    console.log('\n4. Testing Update User');
    const updateUserResp = await client.updateUserAsync({ token, userId, name: 'Updated Test User' });
    console.log('UpdateUser:', updateUserResp[0]);
    
    // 5. Get Users
    console.log('\n5. Testing Get Users');
    const getUsersResp = await client.listUsersAsync({ token, page: 1, pageSize: 5 });
    console.log('GetUsers:', getUsersResp[0]);
    
    // 6. Create Form
    console.log('\n6. Testing Create Form');
    const formResp = await client.createFormAsync({
      token,
      title: 'Test Form', 
      description: 'A test form created from client.js'
    });
    console.log('CreateForm:', formResp[0]);
    const formId = formResp[0].form ? formResp[0].form.id : (formResp[0].data ? formResp[0].data.id : null);
    
    // 7. Get Form
    console.log('\n7. Testing Get Form');
    const getFormResp = await client.getFormAsync({ token, formId });
    console.log('GetForm:', getFormResp[0].form);
    
    // 8. Update Form
    console.log('\n8. Testing Update Form');
    const updateFormResp = await client.updateFormAsync({ token, formId, title: 'Updated Test Form' });
    console.log('UpdateForm:', updateFormResp[0]);
    
    // 9. Get Forms
    console.log('\n9. Testing Get Forms');
    const getFormsResp = await client.listFormsAsync({ token });
    console.log('GetForms:', getFormsResp[0].forms);
    
    // 10. Add Question
    console.log('\n10. Testing Add Question');
    const questionResp = await client.addQuestionAsync({
      token,
      formId,
      title: 'What is your name?', 
      type: 'text', 
      required: true 
    });
    console.log('AddQuestion:', questionResp[0]);
    const questionId = questionResp[0].question ? questionResp[0].question.id : (questionResp[0].data ? questionResp[0].data.id : null);
    
    // 11. Get Question
    console.log('\n11. Testing Get Question');
    const getQuestionResp = await client.getQuestionAsync({ token, formId, questionId });
    console.log('GetQuestion:', getQuestionResp[0].question);
    
    // 12. Update Question
    console.log('\n12. Testing Update Question');
    const updateQuestionResp = await client.updateQuestionAsync({ 
      token, 
      formId, 
      questionId, 
      title: 'What is your full name?' 
    });
    console.log('UpdateQuestion:', updateQuestionResp[0]);
    
    // 13. Get Questions
    console.log('\n13. Testing Get Questions');
    const getQuestionsResp = await client.listQuestionsAsync({ token, formId });
    console.log('GetQuestions:', getQuestionsResp[0].questions);
    
    // 14. Submit Response
    console.log('\n14. Testing Submit Response');
    const responseResp = await client.submitResponseAsync({
      token,
      formId,
      answers: [
        { questionId, value: 'John Doe' }
      ]
    });
    const responseId = responseResp[0].responseId;
    console.log('SubmitResponse:', responseResp[0]);
    
    // 15. Get Response
    console.log('\n15. Testing Get Response');
    const getResponseResp = await client.getResponseAsync({ token, formId, responseId });
    console.log('GetResponse:', getResponseResp[0].response);
    
    // 16. Update Response
    console.log('\n16. Testing Update Response');
    const updateResponseResp = await client.updateResponseAsync({ 
      token, 
      formId, 
      responseId, 
      answers: [
        { questionId, value: 'Jane Smith' }
      ]
    });
    console.log('UpdateResponse:', updateResponseResp[0]);
    
    // 17. Get Responses
    console.log('\n17. Testing Get Responses');
    const getResponsesResp = await client.listResponsesAsync({ token, formId });
    console.log('GetResponses:', getResponsesResp[0].responses);
    
    // 18. Delete Response
    console.log('\n18. Testing Delete Response');
    const deleteResponseResp = await client.deleteResponseAsync({ token, formId, responseId });
    console.log('DeleteResponse:', deleteResponseResp[0]);
    
    // 19. Delete Question
    console.log('\n19. Testing Delete Question');
    const deleteQuestionResp = await client.deleteQuestionAsync({ token, formId, questionId });
    console.log('DeleteQuestion:', deleteQuestionResp[0]);
    
    // 20. Delete Form
    console.log('\n20. Testing Delete Form');
    const deleteFormResp = await client.deleteFormAsync({ token, formId });
    console.log('DeleteForm:', deleteFormResp[0]);
    
    // 21. Delete Session (Logout)
    console.log('\n21. Testing Delete Session');
    const deleteSessionResp = await client.logoutUserAsync({ token });
    console.log('DeleteSession:', deleteSessionResp[0]);
    
    // 22. Delete User
    console.log('\n22. Testing Delete User');
    const relogin = await client.loginUserAsync({ email: userResp[0].user.email, password: 'password123' });
    const delToken = relogin[0].token;
    const deleteUserResp = await client.deleteUserAsync({ token: delToken, userId });
    console.log('DeleteUser:', deleteUserResp[0]);
    
    console.log('\nAll operations completed successfully!');
  } catch (error) {
    console.error('Error during operations:', error);
    throw error;
  }
}

main().catch(e => { console.error(e); process.exit(1); });
