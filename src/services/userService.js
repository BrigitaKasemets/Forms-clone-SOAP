/**
 * User SOAP service implementation
 * Handles user management operations
 */

const User = require('../models/userModel');
const { verifyToken, isAdmin } = require('../middleware/auth');

const userService = {
  /**
   * Create a new user
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.email - User email
   * @param {string} args.password - User password
   * @param {string} args.name - User name
   * @returns {Promise<Object>} Created user response
   */
  createUser: async (args) => {
    try {
      // Validate required fields
      if (!args.email || !args.password || !args.name) {
        return {
          success: false,
          message: 'Email, password, and name are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Create user
      const user = await User.create({
        email: args.email,
        password: args.password,
        name: args.name,
        role: 'user' // Default role
      });

      // Format created_at as ISO string for XML
      const formattedUser = {
        ...user,
        id: user.id.toString(),
        createdAt: new Date(user.created_at).toISOString()
      };

      return {
        success: true,
        user: formattedUser
      };
    } catch (error) {
      console.error('Create user error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to create user',
        errorCode: 'CREATE_USER_FAILED'
      };
    }
  },

  /**
   * Get user by ID
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.userId - User ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} User response
   */
  getUser: async (args) => {
    try {
      // Validate required fields
      if (!args.userId || !args.token) {
        return {
          success: false,
          message: 'User ID and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const authenticatedUser = await verifyToken(args.token);

      // Check permissions - users can only see their own profile unless admin
      if (authenticatedUser.userId.toString() !== args.userId && authenticatedUser.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Get user
      const user = await User.findById(parseInt(args.userId));

      // Format created_at as ISO string for XML
      const formattedUser = {
        ...user,
        id: user.id.toString(),
        createdAt: new Date(user.created_at).toISOString()
      };

      return {
        success: true,
        user: formattedUser
      };
    } catch (error) {
      console.error('Get user error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to get user',
        errorCode: 'GET_USER_FAILED'
      };
    }
  },

  /**
   * Update user
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.userId - User ID
   * @param {string} args.token - JWT token
   * @param {string} [args.name] - User name
   * @param {string} [args.email] - User email
   * @param {string} [args.password] - User password
   * @returns {Promise<Object>} Update response
   */
  updateUser: async (args) => {
    try {
      // Validate required fields
      if (!args.userId || !args.token) {
        return {
          success: false,
          message: 'User ID and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const authenticatedUser = await verifyToken(args.token);

      // Check permissions - users can only update their own profile unless admin
      if (authenticatedUser.userId.toString() !== args.userId && authenticatedUser.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Update user
      const updateData = {};
      if (args.name) updateData.name = args.name;
      if (args.email) updateData.email = args.email;
      if (args.password) updateData.password = args.password;

      await User.update(parseInt(args.userId), updateData);

      return {
        success: true,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Update user error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to update user',
        errorCode: 'UPDATE_USER_FAILED'
      };
    }
  },

  /**
   * Delete user
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.userId - User ID
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Delete response
   */
  deleteUser: async (args) => {
    try {
      // Validate required fields
      if (!args.userId || !args.token) {
        return {
          success: false,
          message: 'User ID and token are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Verify token
      const authenticatedUser = await verifyToken(args.token);

      // Check permissions - users can only delete their own profile unless admin
      if (authenticatedUser.userId.toString() !== args.userId && authenticatedUser.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied',
          errorCode: 'ACCESS_DENIED'
        };
      }

      // Delete user
      await User.delete(parseInt(args.userId));

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Delete user error:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to delete user',
        errorCode: 'DELETE_USER_FAILED'
      };
    }
  }
};

module.exports = userService;
