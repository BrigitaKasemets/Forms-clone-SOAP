/**
 * Authentication middleware for SOAP services
 * Validates JWT tokens for protected operations
 */

const jwt = require('jsonwebtoken');
const { getAsync } = require('../db/db');

/**
 * Verifies a JWT token and attaches the user to the request object
 * 
 * @param {string} token - The JWT token to verify
 * @returns {Promise<Object>} - The decoded user object
 */
const verifyToken = async (token) => {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists in database
    const user = await getAsync('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Middleware to check if the user has admin role
 * 
 * @param {Object} user - The authenticated user object
 * @returns {boolean} - True if user is admin, throws error otherwise
 */
const isAdmin = async (user) => {
  if (user.role !== 'admin') {
    throw new Error('Admin role required');
  }
  return true;
};

/**
 * Verifies that a user has permission to access a specific form
 * 
 * @param {number} userId - The user ID
 * @param {number} formId - The form ID
 * @returns {Promise<boolean>} - True if user has access, throws error otherwise
 */
const hasFormAccess = async (userId, formId) => {
  const form = await getAsync('SELECT user_id, is_published FROM forms WHERE id = ?', [formId]);
  
  if (!form) {
    throw new Error('Form not found');
  }
  
  // Allow access if the user is the owner or the form is published
  if (form.user_id === userId || form.is_published) {
    return true;
  }
  
  throw new Error('Access denied');
};

module.exports = {
  verifyToken,
  isAdmin,
  hasFormAccess
};
