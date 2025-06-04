/**
 * Form SOAP service implementation
 * Handles form management operations
 */

const Form = require('../models/formModel');
const Question = require('../models/questionModel');
const { verifyToken } = require('../middleware/auth');

const formService = {
  /**
   * Create a new form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.token - JWT token
   * @param {string} args.title - Form title
   * @param {string} [args.description] - Form description
   * @returns {Promise<Object>} Created form response
   */
  createForm: async (args) => {
    try {
      // Validate required fields
      if (!args.token || !args.title) {
        return {
          success: false,
          message: 'Token and title are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Create form
      const form = await Form.create({
        title: args.title,
        description: args.description || '',
        userId: user.userId,
        isPublished: false
      });

      // Format dates for XML
      const formattedForm = {
        ...form,
        id: form.id.toString(),
        userId: form.user_id.toString(),
        isPublished: Boolean(form.is_published),
        createdAt: new Date(form.created_at).toISOString(),
        updatedAt: new Date(form.updated_at).toISOString()
      };

      return {
        success: true,
        form: formattedForm
      };
    } catch (error) {
      console.error('Create form error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to create form',
        errorCode: 'CREATE_FORM_FAILED'
      };
    }
  },

  /**
   * Get form by ID
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} [args.token] - JWT token (required for non-published forms)
   * @returns {Promise<Object>} Form response
   */
  getForm: async (args) => {
    try {
      // Validate required fields
      if (!args.formId) {
        return {
          success: false,
          message: 'Form ID is required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Get form
      const form = await Form.findById(parseInt(args.formId));

      // Check if form is published or user has access
      if (!form.is_published) {
        // Token is required for non-published forms
        if (!args.token) {
          return {
            success: false,
            message: 'Access denied - authentication required',
            errorCode: 'AUTH_REQUIRED'
          };
        }

        // Verify token
        const user = await verifyToken(args.token);

        // Check if user owns the form or is admin
        if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
          return {
            success: false,
            message: 'Access denied',
            errorCode: 'ACCESS_DENIED'
          };
        }
      }

      // Get questions
      const questions = await Question.findByFormId(parseInt(args.formId));

      // Format form for XML
      const formattedForm = {
        ...form,
        id: form.id.toString(),
        userId: form.user_id.toString(),
        isPublished: Boolean(form.is_published),
        createdAt: new Date(form.created_at).toISOString(),
        updatedAt: new Date(form.updated_at).toISOString()
      };

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
        form: formattedForm,
        questions: formattedQuestions
      };
    } catch (error) {
      console.error('Get form error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get form',
        errorCode: 'GET_FORM_FAILED'
      };
    }
  },

  /**
   * List forms for authenticated user
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} List of forms
   */
  listForms: async (args) => {
    try {
      // Validate required fields
      if (!args.token) {
        return {
          success: false,
          message: 'Token is required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const user = await verifyToken(args.token);

      // Get forms created by user or all forms for admin
      const forms = user.role === 'admin'
        ? await Form.findAll()
        : await Form.findByUserId(user.userId);

      // Format forms for XML
      const formattedForms = forms.map(form => ({
        ...form,
        id: form.id.toString(),
        userId: form.user_id.toString(),
        isPublished: Boolean(form.is_published),
        createdAt: new Date(form.created_at).toISOString(),
        updatedAt: new Date(form.updated_at).toISOString()
      }));

      return {
        success: true,
        forms: formattedForms
      };
    } catch (error) {
      console.error('List forms error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to list forms',
        errorCode: 'LIST_FORMS_FAILED'
      };
    }
  },

  /**
   * Update a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.token - JWT token
   * @param {string} [args.title] - Form title
   * @param {string} [args.description] - Form description
   * @param {boolean} [args.isPublished] - Form published status
   * @returns {Promise<Object>} Update result
   */
  updateForm: async (args) => {
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

      // Get form
      const form = await Form.findById(parseInt(args.formId));

      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Update form
      const updateData = {};
      if (args.title !== undefined) updateData.title = args.title;
      if (args.description !== undefined) updateData.description = args.description;
      if (args.isPublished !== undefined) updateData.is_published = args.isPublished;

      await Form.update(parseInt(args.formId), updateData);

      return {
        success: true,
        message: 'Form updated successfully'
      };
    } catch (error) {
      console.error('Update form error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to update form',
        errorCode: 'UPDATE_FORM_FAILED'
      };
    }
  },

  /**
   * Delete a form
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.formId - Form ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Delete result
   */
  deleteForm: async (args) => {
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

      // Get form
      const form = await Form.findById(parseInt(args.formId));

      // Check if user owns the form or is admin
      if (user.userId.toString() !== form.user_id.toString() && user.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Delete form (and related questions/responses through CASCADE)
      await Form.delete(parseInt(args.formId));

      return {
        success: true,
        message: 'Form deleted successfully'
      };
    } catch (error) {
      console.error('Delete form error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to delete form',
        errorCode: 'DELETE_FORM_FAILED'
      };
    }
  }
};

module.exports = formService;