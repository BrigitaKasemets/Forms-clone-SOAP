/**
 * Authentication SOAP service implementation
 * Handles user login/logout operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { verifyToken } = require('../middleware/auth');

const sessionService = {
  /**
   * Login user and create a session
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.email - User email
   * @param {string} args.password - User password
   * @returns {Promise<Object>} Login response with token
   */
  loginUser: async (args) => {
    try {
      // Validate required fields
      if (!args.email || !args.password) {
        return {
          success: false,
          message: 'Email and password are required',
          errorCode: 'MISSING_FIELDS'
        };
      }

      // Validate credentials
      const user = await User.validateCredentials(args.email, args.password);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        success: true,
        token,
        userId: user.id.toString()
      };
    } catch (error) {
      console.error('Login error:', error);
      
      return {
        success: false,
        message: error.message || 'Authentication failed',
        errorCode: 'AUTH_FAILED'
      };
    }
  },

  /**
   * Logout user (invalidate session)
   * 
   * @param {Object} args - The SOAP request arguments
   * @param {string} args.token - JWT token
   * @returns {Promise<Object>} Logout response
   */
  logoutUser: async (args) => {
    try {
      // In a real implementation, you might want to add the token to a blacklist
      // Since JWT is stateless, we'll just verify the token is valid
      await verifyToken(args.token);

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      return {
        success: false,
        message: error.message || 'Logout failed',
        errorCode: 'LOGOUT_FAILED'
      };
    }
  }
};

module.exports = sessionService;
