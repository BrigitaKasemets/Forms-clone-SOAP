// Test script for comparing Forms-Clone REST and SOAP API responses
// This script tests equivalent endpoints and compares their responses
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const util = require('util');

// Configuration
const HOST = 'localhost';
const SOAP_PORT = '3001';
const REST_PORT = '3000';
const SOAP_ENDPOINT = `http://${HOST}:${SOAP_PORT}/soap/formsclone`;
const REST_ENDPOINT = `http://${HOST}:${REST_PORT}`;
const WSDL = `${SOAP_ENDPOINT}?wsdl`;
const RESULTS_DIR = path.join(__dirname, 'results');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').substring(0, 15);
const LOG_FILE = path.join(RESULTS_DIR, `comparison_${TIMESTAMP}.log`);

// Create results directory if it doesn't exist
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Initialize log file
let logContent = '';

function log(message) {
    const logMessage = typeof message === 'string' ? message : util.inspect(message, { depth: null });
    console.log(logMessage);
    logContent += logMessage + '\n';
}

function saveLog() {
    fs.writeFileSync(LOG_FILE, logContent);
    console.log(`\nLog file saved to: ${LOG_FILE}`);
}

// Function to create SOAP envelope
function createSoapEnvelope(body) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://formsclone.service/">
   <soapenv:Header/>
   <soapenv:Body>
      ${body}
   </soapenv:Body>
</soapenv:Envelope>`;
}

// Helper function to parse XML to JS object
async function parseXml(xml) {
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    return parser.parseStringPromise(xml);
}

// Function to compare responses
async function compareResponses(soapResponse, restResponse, testName) {
    log(`\nCOMPARISON: ${testName}`);
    
    // Parse SOAP XML to JS object for easier comparison
    let soapObj;
    try {
        soapObj = await parseXml(soapResponse);
        log(`SOAP Response (parsed):`);
        // Handle different namespace formats
        const soapBody = soapObj['soap:Envelope'] ? soapObj['soap:Envelope']['soap:Body'] : 
                        soapObj['SOAP-ENV:Envelope'] ? soapObj['SOAP-ENV:Envelope']['SOAP-ENV:Body'] : 
                        soapObj.Envelope ? soapObj.Envelope.Body : null;
        log(soapBody);
    } catch (error) {
        log(`Error parsing SOAP response: ${error.message}`);
        log(`Raw SOAP response: ${soapResponse}`);
    }
    
    log(`REST Response:`);
    log(restResponse);
    
    // Basic success comparison (this can be enhanced based on actual response formats)
    const soapSuccess = soapResponse.includes('success>true<') || 
                       (soapObj && (
                        (soapObj['soap:Envelope'] && soapObj['soap:Envelope']['soap:Body']) ||
                        (soapObj['SOAP-ENV:Envelope'] && soapObj['SOAP-ENV:Envelope']['SOAP-ENV:Body']) ||
                        (soapObj.Envelope && soapObj.Envelope.Body)
                       ));
    
    const restSuccess = typeof restResponse === 'object' && 
                       (restResponse.success === true || 
                        !restResponse.error);
    
    if (soapSuccess && restSuccess) {
        log('✅ PASS: Both APIs returned successful responses');
    } else if (!soapSuccess && !restSuccess) {
        log('✅ PASS: Both APIs returned error responses (expected)');
    } else {
        log('❌ FAIL: Inconsistent success status between APIs');
        log(`SOAP Success: ${soapSuccess}, REST Success: ${restSuccess}`);
    }
    
    log('-----------------------------------');
}

// Main function to run tests
async function runTests() {
    log('Forms-Clone API Comparison Test');
    log('===============================');
    log(`Started at: ${new Date().toISOString()}`);
    log(`SOAP WSDL URL: ${WSDL}`);
    log(`REST API URL: ${REST_ENDPOINT}`);
    log('');
    
    // Generate random suffix to avoid conflicts
    const RANDOM_SUFFIX = Date.now();
    
    // Test data
    const TEST_EMAIL = `test${RANDOM_SUFFIX}@example.com`;
    const TEST_PASSWORD = 'TestPassword123!';  // Strong password for both APIs
    const TEST_NAME = `Test User ${RANDOM_SUFFIX}`;
    const TEST_FORM_TITLE = `Test Form ${RANDOM_SUFFIX}`;
    const TEST_FORM_DESCRIPTION = `Description for test form ${RANDOM_SUFFIX}`;
    const TEST_QUESTION_TEXT = `What is your name? ${RANDOM_SUFFIX}`;
    const TEST_QUESTION_TYPE = 'shorttext';  // Valid question type for both APIs
    
    try {
        // Check if servers are running
        log('Testing server connections...');
        
        try {
            await axios.head(WSDL);
            log('SOAP server is running.');
        } catch (error) {
            log('Error: SOAP server is not running or not accessible.');
            log('Please start the server with "npm run dev" before running tests.');
            return;
        }
        
        try {
            await axios.head(`${REST_ENDPOINT}/health`);
            log('REST server is running.');
        } catch (error) {
            log('Error: REST server is not running or not accessible.');
            log('Please start the server with "npm run dev" in forms-clone-api directory before running tests.');
            return;
        }
        
        log('Both servers are running.');
        log('');
        
        // TEST 1: User Registration
        log('TEST 1: Creating User (Register)');
        log('--------------------------------');
        
        // SOAP: Create User
        const soapCreateUserBody = `<ser:CreateUserRequest>
         <ser:email>${TEST_EMAIL}</ser:email>
         <ser:password>${TEST_PASSWORD}</ser:password>
         <ser:name>${TEST_NAME}</ser:name>
      </ser:CreateUserRequest>`;
        
        const soapCreateUserResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapCreateUserBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP User Creation Response:');
        log(soapCreateUserResponse.data);
        
        // Extract SOAP user ID using xml2js
        const soapCreateUserData = await parseXml(soapCreateUserResponse.data);
        let soapUserId;
        if (soapCreateUserData['soap:Envelope']) {
            soapUserId = soapCreateUserData['soap:Envelope']['soap:Body']['tns:CreateUserResponse']?.user?.id;
        } else if (soapCreateUserData['SOAP-ENV:Envelope']) {
            soapUserId = soapCreateUserData['SOAP-ENV:Envelope']['SOAP-ENV:Body'].CreateUserResponse?.user?.id;
        }
        
        if (!soapUserId) {
            log('❌ Failed to get SOAP user ID');
        } else {
            log(`✅ SOAP User created with ID: ${soapUserId}`);
        }
        
        // REST: Create User
        const restCreateUserResponse = await axios.post(
            `${REST_ENDPOINT}/users`,
            {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                name: TEST_NAME
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        log('REST User Creation Response:');
        log(restCreateUserResponse.data);
        
        const restUserId = restCreateUserResponse.data.id;
        
        if (!restUserId) {
            log('❌ Failed to get REST user ID');
        } else {
            log(`✅ REST User created with ID: ${restUserId}`);
        }
        
        // Compare user creation responses
        await compareResponses(soapCreateUserResponse.data, restCreateUserResponse.data, 'User Creation');
        
        // TEST 2: User Authentication (Login)
        log('\nTEST 2: User Authentication (Login)');
        log('---------------------------------');
        
        // SOAP: Login
        const soapLoginBody = `<ser:LoginRequest>
         <ser:email>${TEST_EMAIL}</ser:email>
         <ser:password>${TEST_PASSWORD}</ser:password>
      </ser:LoginRequest>`;
        
        const soapLoginResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapLoginBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Login Response:');
        log(soapLoginResponse.data);
        
        // Extract SOAP token
        const soapLoginData = await parseXml(soapLoginResponse.data);
        let soapToken;
        if (soapLoginData['soap:Envelope']) {
            soapToken = soapLoginData['soap:Envelope']['soap:Body']['tns:LoginResponse']?.token;
        } else if (soapLoginData['SOAP-ENV:Envelope']) {
            soapToken = soapLoginData['SOAP-ENV:Envelope']['SOAP-ENV:Body'].LoginResponse?.token;
        }
        
        if (!soapToken) {
            log('❌ Failed to get SOAP token');
        } else {
            log('✅ SOAP Login successful, token received');
        }
        
        // REST: Login
        const restLoginResponse = await axios.post(
            `${REST_ENDPOINT}/sessions`,
            {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        log('REST Login Response:');
        log(restLoginResponse.data);
        
        const restToken = restLoginResponse.data.token;
        
        if (!restToken) {
            log('❌ Failed to get REST token');
        } else {
            log('✅ REST Login successful, token received');
        }
        
        // Compare login responses
        await compareResponses(soapLoginResponse.data, restLoginResponse.data, 'User Login');
        
        // TEST 3: Creating a Form
        log('\nTEST 3: Creating a Form');
        log('---------------------');
        
        // SOAP: Create Form
        const soapCreateFormBody = `<ser:CreateFormRequest>
         <ser:token>${soapToken}</ser:token>
         <ser:title>${TEST_FORM_TITLE}</ser:title>
         <ser:description>${TEST_FORM_DESCRIPTION}</ser:description>
      </ser:CreateFormRequest>`;
        
        const soapCreateFormResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapCreateFormBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Create Form Response:');
        log(soapCreateFormResponse.data);
        
        // Extract SOAP form ID
        const soapCreateFormData = await parseXml(soapCreateFormResponse.data);
        let soapFormId;
        if (soapCreateFormData['soap:Envelope']) {
            soapFormId = soapCreateFormData['soap:Envelope']['soap:Body']['tns:CreateFormResponse']?.form?.id;
        } else if (soapCreateFormData['SOAP-ENV:Envelope']) {
            soapFormId = soapCreateFormData['SOAP-ENV:Envelope']['SOAP-ENV:Body'].CreateFormResponse?.form?.id;
        }
        
        if (!soapFormId) {
            log('❌ Failed to get SOAP form ID');
        } else {
            log(`✅ SOAP Form created with ID: ${soapFormId}`);
        }
        
        // REST: Create Form
        const restCreateFormResponse = await axios.post(
            `${REST_ENDPOINT}/forms`,
            {
                title: TEST_FORM_TITLE,
                description: TEST_FORM_DESCRIPTION
            },
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Create Form Response:');
        log(restCreateFormResponse.data);
        
        const restFormId = restCreateFormResponse.data.id;
        
        if (!restFormId) {
            log('❌ Failed to get REST form ID');
        } else {
            log(`✅ REST Form created with ID: ${restFormId}`);
        }
        
        // Compare form creation responses
        await compareResponses(soapCreateFormResponse.data, restCreateFormResponse.data, 'Form Creation');
        
        // TEST 4: Get Forms List
        log('\nTEST 4: Get Forms List');
        log('--------------------');
        
        // SOAP: Get Forms
        const soapGetFormsBody = `<ser:ListFormsRequest>
         <ser:token>${soapToken}</ser:token>
      </ser:ListFormsRequest>`;
        
        const soapGetFormsResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapGetFormsBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Get Forms Response:');
        log(soapGetFormsResponse.data);
        
        // REST: Get Forms
        const restGetFormsResponse = await axios.get(
            `${REST_ENDPOINT}/forms`,
            { 
                headers: { 
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Get Forms Response:');
        log(restGetFormsResponse.data);
        
        // Compare get forms responses
        await compareResponses(soapGetFormsResponse.data, restGetFormsResponse.data, 'Get Forms List');
        
        // TEST 5: Adding a Question to a Form
        log('\nTEST 5: Adding a Question to a Form');
        log('---------------------------------');
        
        // SOAP: Add Question
        const soapAddQuestionBody = `<ser:AddQuestionRequest>
         <ser:token>${soapToken}</ser:token>
         <ser:formId>${soapFormId}</ser:formId>
         <ser:title>${TEST_QUESTION_TEXT}</ser:title>
         <ser:type>${TEST_QUESTION_TYPE}</ser:type>
         <ser:required>true</ser:required>
      </ser:AddQuestionRequest>`;
        
        const soapAddQuestionResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapAddQuestionBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Add Question Response:');
        log(soapAddQuestionResponse.data);
        
        // Extract SOAP question ID
        const soapAddQuestionData = await parseXml(soapAddQuestionResponse.data);
        let soapQuestionId;
        if (soapAddQuestionData['soap:Envelope']) {
            soapQuestionId = soapAddQuestionData['soap:Envelope']['soap:Body']['tns:AddQuestionResponse']?.question?.id;
        } else if (soapAddQuestionData['SOAP-ENV:Envelope']) {
            soapQuestionId = soapAddQuestionData['SOAP-ENV:Envelope']['SOAP-ENV:Body'].AddQuestionResponse?.question?.id;
        }
        
        if (!soapQuestionId) {
            log('❌ Failed to get SOAP question ID');
        } else {
            log(`✅ SOAP Question added with ID: ${soapQuestionId}`);
        }
        
        // REST: Add Question
        const restAddQuestionResponse = await axios.post(
            `${REST_ENDPOINT}/forms/${restFormId}/questions`,
            {
                text: TEST_QUESTION_TEXT,
                type: TEST_QUESTION_TYPE,
                required: true
            },
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Add Question Response:');
        log(restAddQuestionResponse.data);
        
        const restQuestionId = restAddQuestionResponse.data.id;
        
        if (!restQuestionId) {
            log('❌ Failed to get REST question ID');
        } else {
            log(`✅ REST Question added with ID: ${restQuestionId}`);
        }
        
        // Compare add question responses
        await compareResponses(soapAddQuestionResponse.data, restAddQuestionResponse.data, 'Add Question');
        
        // TEST 6: Get Form with Questions
        log('\nTEST 6: Get Form with Questions');
        log('-----------------------------');
        
        // SOAP: Get Form with Questions
        const soapGetFormBody = `<ser:GetFormRequest>
         <ser:token>${soapToken}</ser:token>
         <ser:formId>${soapFormId}</ser:formId>
      </ser:GetFormRequest>`;
        
        const soapGetFormResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapGetFormBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Get Form with Questions Response:');
        log(soapGetFormResponse.data);
        
        // REST: Get Form with Questions
        const restGetFormResponse = await axios.get(
            `${REST_ENDPOINT}/forms/${restFormId}?includeQuestions=true`,
            { 
                headers: { 
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Get Form with Questions Response:');
        log(restGetFormResponse.data);
        
        // Compare get form with questions responses
        await compareResponses(soapGetFormResponse.data, restGetFormResponse.data, 'Get Form with Questions');
        
        // TEST 7: Submit Form Response
        log('\nTEST 7: Submit Form Response');
        log('--------------------------');
        
        // Test response data
        const TEST_RESPONSE_VALUE = `John Doe ${RANDOM_SUFFIX}`;
        
        // SOAP: Submit Response
        const soapSubmitResponseBody = `<ser:SubmitResponseRequest>
         <ser:token>${soapToken}</ser:token>
         <ser:formId>${soapFormId}</ser:formId>
         <ser:answers>
            <ser:questionId>${soapQuestionId}</ser:questionId>
            <ser:value>${TEST_RESPONSE_VALUE}</ser:value>
         </ser:answers>
      </ser:SubmitResponseRequest>`;
        
        const soapSubmitResponseResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapSubmitResponseBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Submit Response Response:');
        log(soapSubmitResponseResponse.data);
        
        // Extract SOAP response ID
        const soapSubmitResponseData = await parseXml(soapSubmitResponseResponse.data);
        let soapResponseId;
        if (soapSubmitResponseData['soap:Envelope']) {
            soapResponseId = soapSubmitResponseData['soap:Envelope']['soap:Body']['tns:SubmitResponseResponse']?.responseId;
        } else if (soapSubmitResponseData['SOAP-ENV:Envelope']) {
            soapResponseId = soapSubmitResponseData['SOAP-ENV:Envelope']['SOAP-ENV:Body'].SubmitResponseResponse?.responseId;
        }
        
        if (!soapResponseId) {
            log('❌ Failed to get SOAP response ID');
        } else {
            log(`✅ SOAP Response submitted with ID: ${soapResponseId}`);
        }
        
        // REST: Submit Response
        const restSubmitResponseResponse = await axios.post(
            `${REST_ENDPOINT}/forms/${restFormId}/responses`,
            {
                answers: [
                    {
                        questionId: restQuestionId,
                        answer: TEST_RESPONSE_VALUE
                    }
                ]
            },
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Submit Response Response:');
        log(restSubmitResponseResponse.data);
        
        const restResponseId = restSubmitResponseResponse.data.id;
        
        if (!restResponseId) {
            log('❌ Failed to get REST response ID');
        } else {
            log(`✅ REST Response submitted with ID: ${restResponseId}`);
        }
        
        // Compare submit response responses
        await compareResponses(soapSubmitResponseResponse.data, restSubmitResponseResponse.data, 'Submit Form Response');
        
        // TEST 8: Get Form Responses
        log('\nTEST 8: Get Form Responses');
        log('------------------------');
        
        // SOAP: Get Form Responses
        const soapGetResponsesBody = `<ser:ListResponsesRequest>
         <ser:token>${soapToken}</ser:token>
         <ser:formId>${soapFormId}</ser:formId>
      </ser:ListResponsesRequest>`;
        
        const soapGetResponsesResponse = await axios.post(
            SOAP_ENDPOINT,
            createSoapEnvelope(soapGetResponsesBody),
            { headers: { 'Content-Type': 'text/xml' } }
        );
        
        log('SOAP Get Form Responses Response:');
        log(soapGetResponsesResponse.data);
        
        // REST: Get Form Responses
        const restGetResponsesResponse = await axios.get(
            `${REST_ENDPOINT}/forms/${restFormId}/responses`,
            { 
                headers: { 
                    'Authorization': `Bearer ${restToken}`
                } 
            }
        );
        
        log('REST Get Form Responses Response:');
        log(restGetResponsesResponse.data);
        
        // Compare get form responses responses
        await compareResponses(soapGetResponsesResponse.data, restGetResponsesResponse.data, 'Get Form Responses');
        
        // Summary
        log('\nTest Summary');
        log('===========');
        log(`Tested at: ${new Date().toISOString()}`);
        log(`See detailed results in: ${LOG_FILE}`);
        
    } catch (error) {
        log(`ERROR: ${error.message}`);
        if (error.response) {
            log('Response data:');
            log(error.response.data);
            log(`Status: ${error.response.status}`);
        }
    } finally {
        saveLog();
    }
}

// Run the tests
runTests();
