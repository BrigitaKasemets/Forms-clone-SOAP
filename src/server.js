const express = require('express');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

// Import services
const sessionService = require('./services/sessionService');
const userService = require('./services/userService');
const formService = require('./services/formService');
const questionService = require('./services/questionService');
const responseService = require('./services/responseService');

// Create Express app
const app = express();
const PORT = process.env.SOAP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load WSDL file
const wsdlPath = path.join(__dirname, '..', 'wsdl', 'formsClone.wsdl');

// SOAP Service Implementation
const serviceObject = {
  FormsCloneService: {
    FormsClonePort: {
      // Authentication operations
      loginUser: async function(args) {
        console.log('loginUser called with args:', args);
        try {
          return await sessionService.loginUser(args);
        } catch (error) {
          console.error('Error in loginUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      logoutUser: async function(args) {
        console.log('logoutUser called with args:', args);
        try {
          return await sessionService.logoutUser(args);
        } catch (error) {
          console.error('Error in logoutUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },

      // User operations
      createUser: async function(args) {
        console.log('createUser called with args:', args);
        try {
          return await userService.createUser(args);
        } catch (error) {
          console.error('Error in createUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      getUser: async function(args) {
        console.log('getUser called with args:', args);
        try {
          return await userService.getUser(args);
        } catch (error) {
          console.error('Error in getUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      updateUser: async function(args) {
        console.log('updateUser called with args:', args);
        try {
          return await userService.updateUser(args);
        } catch (error) {
          console.error('Error in updateUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      deleteUser: async function(args) {
        console.log('deleteUser called with args:', args);
        try {
          return await userService.deleteUser(args);
        } catch (error) {
          console.error('Error in deleteUser operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      listUsers: async function(args) {
        console.log('listUsers called with args:', args);
        try {
          return await userService.listUsers(args);
        } catch (error) {
          console.error('Error in listUsers operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      
      // Form operations
      createForm: async function(args) {
        console.log('createForm called with args:', args);
        try {
          return await formService.createForm(args);
        } catch (error) {
          console.error('Error in createForm operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      getForm: async function(args) {
        console.log('getForm called with args:', args);
        try {
          return await formService.getForm(args);
        } catch (error) {
          console.error('Error in getForm operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      listForms: async function(args) {
        console.log('listForms called with args:', args);
        try {
          return await formService.listForms(args);
        } catch (error) {
          console.error('Error in listForms operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      updateForm: async function(args) {
        console.log('updateForm called with args:', args);
        try {
          return await formService.updateForm(args);
        } catch (error) {
          console.error('Error in updateForm operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      deleteForm: async function(args) {
        console.log('deleteForm called with args:', args);
        try {
          return await formService.deleteForm(args);
        } catch (error) {
          console.error('Error in deleteForm operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      
      // Question operations
      addQuestion: async function(args) {
        console.log('addQuestion called with args:', args);
        try {
          return await questionService.addQuestion(args);
        } catch (error) {
          console.error('Error in addQuestion operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      getQuestion: async function(args) {
        console.log('getQuestion called with args:', args);
        try {
          return await questionService.getQuestion(args);
        } catch (error) {
          console.error('Error in getQuestion operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      updateQuestion: async function(args) {
        console.log('updateQuestion called with args:', args);
        try {
          return await questionService.updateQuestion(args);
        } catch (error) {
          console.error('Error in updateQuestion operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      deleteQuestion: async function(args) {
        console.log('deleteQuestion called with args:', args);
        try {
          return await questionService.deleteQuestion(args);
        } catch (error) {
          console.error('Error in deleteQuestion operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      listQuestions: async function(args) {
        console.log('listQuestions called with args:', args);
        try {
          return await questionService.listQuestions(args);
        } catch (error) {
          console.error('Error in listQuestions operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      
      // Response operations
      submitResponse: async function(args) {
        console.log('submitResponse called with args:', args);
        try {
          return await responseService.submitResponse(args);
        } catch (error) {
          console.error('Error in submitResponse operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      listResponses: async function(args) {
        console.log('listResponses called with args:', args);
        try {
          return await responseService.listResponses(args);
        } catch (error) {
          console.error('Error in listResponses operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      getResponse: async function(args) {
        console.log('getResponse called with args:', args);
        try {
          return await responseService.getResponse(args);
        } catch (error) {
          console.error('Error in getResponse operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      updateResponse: async function(args) {
        console.log('updateResponse called with args:', args);
        try {
          return await responseService.updateResponse(args);
        } catch (error) {
          console.error('Error in updateResponse operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      },
      deleteResponse: async function(args) {
        console.log('deleteResponse called with args:', args);
        try {
          return await responseService.deleteResponse(args);
        } catch (error) {
          console.error('Error in deleteResponse operation:', error);
          return {
            success: false,
            message: 'Internal server error',
            errorCode: 'SERVER_ERROR'
          };
        }
      }
    }
  }
};

// Start the server
const server = app.listen(PORT, () => {
  console.log(`SOAP server listening on port ${PORT}`);
  
  // Create SOAP server
  soap.listen(server, '/soap/formsclone', serviceObject, fs.readFileSync(wsdlPath, 'utf8'));
  console.log(`WSDL available at: http://localhost:${PORT}/soap/formsclone?wsdl`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down');
    process.exit(0);
  });
});

module.exports = app;
