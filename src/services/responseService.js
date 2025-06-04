/**
 * Response SOAP service implementation
 * Handles form response operations
 */

const Form = require('../models/formModel');
const Response = require('../models/responseModel');
const { verifyToken } = require('../middleware/auth');

const responseService = {
  /**
   * Submit a response to a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} [args.token] - JWT token (optional for public forms)
   * @param {Array} args.answers - Array of answer objects {questionId, value}
   * @returns {Promise<Object>} Created response ID
   */
  submitResponse: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.answers || !Array.isArray(args.answers) || args.answers.length === 0) {
        return {
          success: false,
          message: 'Form ID and answers are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Get form to check if it's published
      const form = await Form.findById(parseInt(args.formId));
      
      let userId = null;
      
      // Check if form is published or user has access
      if (!form.is_published) {
        // Token is required for non-published forms
        if (!args.token) {
          return {
            success: false,
            message: 'Access denied - authentication required for unpublished forms',
            errorCode: 'AUTH_REQUIRED'
          };
        }

        // Verify token
        const user = await verifyToken(args.token);
        userId = user.userId;
      } else if (args.token) {
        // If token is provided, get user ID for tracking
        try {
          const user = await verifyToken(args.token);
          userId = user.userId;
        } catch (error) {
          // Ignore token errors for published forms
        }
      }

      // Create response
      const response = await Response.create({
        formId: parseInt(args.formId),
        userId: userId ? parseInt(userId) : null
      });

      // Format answers with proper IDs
      const formattedAnswers = args.answers.map(answer => ({
        questionId: parseInt(answer.questionId),
        value: answer.value
      }));

      // Add answers to the response
      await Response.addAnswers(response.id, formattedAnswers);

      return {
        success: true,
        responseId: response.id.toString()
      };
    } catch (error) {
      console.error('Submit response error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to submit response',
        errorCode: 'SUBMIT_RESPONSE_FAILED'
      };
    }
  },

  /**
   * List responses for a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} List of responses
   */
  listResponses: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.token) {
        return {
          success: false,
          message: 'Form ID and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get form to check ownership
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Get responses
      const responses = await Response.findByFormId(parseInt(args.formId));
      
      // For each response, get its answers
      const responsesWithAnswers = await Promise.all(
        responses.map(async (response) => {
          const answers = await Response.findAnswers(response.id);
          
          // Format for XML
          return {
            ...response,
            id: response.id.toString(),
            formId: response.form_id.toString(),
            userId: response.user_id ? response.user_id.toString() : null,
            submittedAt: new Date(response.submitted_at).toISOString(),
            answers: answers.map(a => ({
              questionId: a.question_id.toString(),
              value: a.value
            }))
          };
        })
      );

      return {
        success: true,
        responses: responsesWithAnswers
      };
    } catch (error) {
      console.error('List responses error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to list responses',
        errorCode: 'LIST_RESPONSES_FAILED'
      };
    }
  },

  /**
   * Get a specific response
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.responseId - Response ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Response with answers
   */
  getResponse: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.responseId || !args.token) {
        return {
          success: false,
          message: 'Form ID, response ID, and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get form to check ownership
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Get response with answers
      const response = await Response.findByIdAndFormId(
        parseInt(args.responseId),
        parseInt(args.formId)
      );

      // Format for XML
      const formattedResponse = {
        ...response,
        id: response.id.toString(),
        formId: response.form_id.toString(),
        userId: response.user_id ? response.user_id.toString() : null,
        submittedAt: new Date(response.submitted_at).toISOString(),
        answers: response.answers.map(a => ({
          questionId: a.question_id.toString(),
          value: a.value
        }))
      };

      return {
        success: true,
        response: formattedResponse
      };
    } catch (error) {
      console.error('Get response error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get response',
        errorCode: 'GET_RESPONSE_FAILED'
      };
    }
  },

  /**
   * Update a response
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.responseId - Response ID
   * @param {string} args.token - JWT token
   * @param {Array} args.answers - Array of answer objects {questionId, value}
   * @returns {Promise<Object>} Update result
   */
  updateResponse: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.responseId || !args.token || !args.answers || !Array.isArray(args.answers)) {
        return {
          success: false,
          message: 'Form ID, response ID, token, and answers are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get form to check ownership
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Verify the response belongs to the form
      const response = await Response.findByIdAndFormId(
        parseInt(args.responseId), 
        parseInt(args.formId)
      );

      // Format answers with proper IDs
      const formattedAnswers = args.answers.map(answer => ({
        questionId: parseInt(answer.questionId),
        value: answer.value
      }));

      // Update answers
      await Response.updateAnswers(response.id, formattedAnswers);

      return {
        success: true,
        message: 'Response updated successfully'
      };
    } catch (error) {
      console.error('Update response error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to update response',
        errorCode: 'UPDATE_RESPONSE_FAILED'
      };
    }
  },

  /**
   * Delete a response
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.responseId - Response ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Delete result
   */
  deleteResponse: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.responseId || !args.token) {
        return {
          success: false,
          message: 'Form ID, response ID, and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get form to check ownership
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Verify the response belongs to the form
      await Response.findByIdAndFormId(parseInt(args.responseId), parseInt(args.formId));

      // Delete response
      await Response.delete(parseInt(args.responseId));

      return {
        success: true,
        message: 'Response deleted successfully'
      };
    } catch (error) {
      console.error('Delete response error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to delete response',
        errorCode: 'DELETE_RESPONSE_FAILED'
      };
    }
  }
};

module.exports = responseService;