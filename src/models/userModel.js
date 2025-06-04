/**
 * User model for Forms-Clone SOAP API
 * Handles database operations for users
 */

const bcrypt = require('bcryptjs');
const { runAsync, getAsync, allAsync } = require('../db/db');

class User {
  /**
   * Create a new user
   * 
   * @param {Object} userData - User data object
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @param {string} [userData.role='user'] - User role (default: 'user')
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    try {
      // Check if email already exists
      const existingUser = await getAsync('SELECT * FROM users WHERE email = ?', [userData.email]);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Insert user
      const { lastID } = await runAsync(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [userData.email, hashedPassword, userData.name, userData.role || 'user']
      );

      // Return created user (without password)
      return await this.findById(lastID);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a user by ID
   * 
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  static async findById(id) {
    try {
      const user = await getAsync(
        'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
        [id]
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a user by email
   * 
   * @param {string} email - User email
   * @returns {Promise<Object>} User object
   */
  static async findByEmail(email) {
    try {
      const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a user
   * 
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(id, userData) {
    try {
      // Check if user exists
      await this.findById(id);

      const updates = [];
      const values = [];

      // Add fields to update
      if (userData.name) {
        updates.push('name = ?');
        values.push(userData.name);
      }

      if (userData.email) {
        // Check if email is already in use by another user
        const existingUser = await getAsync('SELECT * FROM users WHERE email = ? AND id != ?', [userData.email, id]);
        if (existingUser) {
          throw new Error('Email already in use');
        }

        updates.push('email = ?');
        values.push(userData.email);
      }

      if (userData.password) {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        updates.push('password = ?');
        values.push(hashedPassword);
      }

      if (userData.role) {
        updates.push('role = ?');
        values.push(userData.role);
      }

      // If no updates, return the user
      if (updates.length === 0) {
        return await this.findById(id);
      }

      // Add user ID to values array
      values.push(id);

      // Update user
      await runAsync(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Return updated user
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user
   * 
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Check if user exists
      await this.findById(id);

      // Delete user
      await runAsync('DELETE FROM users WHERE id = ?', [id]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate user credentials
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object if valid
   */
  static async validateCredentials(email, password) {
    try {
      // Get user with password
      const user = await getAsync('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all users with pagination
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [pageSize=10] - Number of users per page
   * @returns {Promise<Array>} Array of user objects
   */
  static async findAll(page = 1, pageSize = 10) {
    try {
      const offset = (page - 1) * pageSize;
      const users = await allAsync(
        'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [pageSize, offset]
      );
      return users;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
