/**
 * Forms-Clone SOAP API Server
 * Main server file for the SOAP version of the Forms-Clone API
 */

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
      
      // Form operations - to be implemented
      createForm: async function(args) {
        console.log('createForm called with args:', args);
        // Placeholder implementation
        return {
          success: true,
          form: {
            id: '1',
            title: args.title,
            description: args.description || '',
            userId: '1',
            isPublished: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      },
      
      // Question operations - to be implemented
      addQuestion: async function(args) {
        console.log('addQuestion called with args:', args);
        // Placeholder implementation
        return {
          success: true,
          question: {
            id: '1',
            formId: args.formId,
            title: args.title,
            type: args.type,
            required: args.required,
            options: args.options || '',
            order: 1
          }
        };
      },
      
      // Response operations - to be implemented
      submitResponse: async function(args) {
        console.log('submitResponse called with args:', args);
        // Placeholder implementation
        return {
          success: true,
          responseId: '1'
        };
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
