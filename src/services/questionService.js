/**
 * Question SOAP service implementation
 * Handles question management operations
 */

const Form = require('../models/formModel');
const Question = require('../models/questionModel');
const { verifyToken } = require('../middleware/auth');

const questionService = {
  /**
   * Add a question to a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.token - JWT token
   * @param {string} args.formId - Form ID
   * @param {string} args.title - Question title
   * @param {string} args.type - Question type
   * @param {boolean} args.required - Whether question is required
   * @param {string} [args.options] - Question options (for multiple choice)
   * @returns {Promise<Object>} Created question response
   */
  addQuestion: async (args) => {
    try {
      // Validate required fields
      if (!args.token || !args.formId || !args.title || !args.type === undefined || args.required === undefined) {
        return {
          success: false,
          message: 'Token, form ID, title, type, and required flag are required',
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

      // Create question
      const question = await Question.create({
        formId: parseInt(args.formId),
        title: args.title,
        type: args.type,
        required: args.required,
        options: args.options
      });

      // Format question for XML
      const formattedQuestion = {
        ...question,
        id: question.id.toString(),
        formId: question.form_id.toString(),
        text: question.title, // Map 'title' to 'text' as per XSD
        required: Boolean(question.required),
        order: question.order_num,
        createdAt: new Date(question.created_at).toISOString(),
        updatedAt: new Date(question.created_at).toISOString() // Assuming updated_at doesn't exist
      };

      return {
        success: true,
        question: formattedQuestion
      };
    } catch (error) {
      console.error('Add question error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to add question',
        errorCode: 'ADD_QUESTION_FAILED'
      };
    }
  },

  /**
   * Get question by ID
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.questionId - Question ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Question response
   */
  getQuestion: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.questionId || !args.token) {
        return {
          success: false,
          message: 'Form ID, question ID, and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get form to check access
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if form is published or user has access
      if (!form.is_published && user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Get question
      const question = await Question.findByIdAndFormId(
        parseInt(args.questionId),
        parseInt(args.formId)
      );

      // Format question for XML
      const formattedQuestion = {
        ...question,
        id: question.id.toString(),
        formId: question.form_id.toString(),
        text: question.title, // Map 'title' to 'text' as per XSD
        required: Boolean(question.required),
        order: question.order_num,
        createdAt: new Date(question.created_at).toISOString(),
        updatedAt: new Date(question.created_at).toISOString() // Assuming updated_at doesn't exist
      };

      return {
        success: true,
        question: formattedQuestion
      };
    } catch (error) {
      console.error('Get question error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get question',
        errorCode: 'GET_QUESTION_FAILED'
      };
    }
  },

  /**
   * Update a question
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.questionId - Question ID
   * @param {string} args.token - JWT token
   * @param {string} [args.title] - Question title
   * @param {string} [args.type] - Question type
   * @param {boolean} [args.required] - Whether question is required
   * @param {string} [args.options] - Question options
   * @param {number} [args.order] - Question order
   * @returns {Promise<Object>} Update result
   */
  updateQuestion: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.questionId || !args.token) {
        return {
          success: false,
          message: 'Form ID, question ID, and token are required',
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

      // Update question
      const updateData = {};
      if (args.title !== undefined) updateData.title = args.title;
      if (args.type !== undefined) updateData.type = args.type;
      if (args.required !== undefined) updateData.required = args.required;
      if (args.options !== undefined) updateData.options = args.options;
      if (args.order !== undefined) updateData.orderNum = args.order;

      await Question.update(parseInt(args.questionId), updateData);

      return {
        success: true,
        message: 'Question updated successfully'
      };
    } catch (error) {
      console.error('Update question error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to update question',
        errorCode: 'UPDATE_QUESTION_FAILED'
      };
    }
  },

  /**
   * Delete a question
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.questionId - Question ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Delete result
   */
  deleteQuestion: async (args) => {
    try {
      // Validate required fields
      if (!args.formId || !args.questionId || !args.token) {
        return {
          success: false,
          message: 'Form ID, question ID, and token are required',
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

      // Verify the question belongs to the form
      await Question.findByIdAndFormId(parseInt(args.questionId), parseInt(args.formId));

      // Delete question
      await Question.delete(parseInt(args.questionId));

      return {
        success: true,
        message: 'Question deleted successfully'
      };
    } catch (error) {
      console.error('Delete question error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to delete question',
        errorCode: 'DELETE_QUESTION_FAILED'
      };
    }
  },

  /**
   * List questions for a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} List of questions
   */
  listQuestions: async (args) => {
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

      // Get form to check access
      const form = await Form.findById(parseInt(args.formId));
      
      // Check if form is published or user has access
      if (!form.is_published && user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Get questions
      const questions = await Question.findByFormId(parseInt(args.formId));

      // Format questions for XML
      const formattedQuestions = questions.map(q => ({
        ...q,
        id: q.id.toString(),
        formId: q.form_id.toString(),
        text: q.title, // Map 'title' to 'text' as per XSD
        required: Boolean(q.required),
        order: q.order_num,
        createdAt: new Date(q.created_at).toISOString(),
        updatedAt: new Date(q.created_at).toISOString() // Assuming updated_at doesn't exist
      }));

      return {
        success: true,
        questions: formattedQuestions
      };
    } catch (error) {
      console.error('List questions error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to list questions',
        errorCode: 'LIST_QUESTIONS_FAILED'
      };
    }
  }
};

module.exports = questionService;