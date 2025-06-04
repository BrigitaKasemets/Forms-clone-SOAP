/**
 * Form model for Forms-Clone SOAP API
 * Handles database operations for forms
 */

const { runAsync, getAsync, allAsync } = require('../db/db');

class Form {
  /**
   * Create a new form
   * 
   * @param {Object} formData - Form data object
   * @param {string} formData.title - Form title
   * @param {string} formData.description - Form description
   * @param {number} formData.userId - User ID of the creator
   * @param {boolean} formData.isPublished - Whether the form is published
   * @returns {Promise<Object>} Created form object
   */
  static async create(formData) {
    try {
      const { lastID } = await runAsync(
        'INSERT INTO forms (title, description, user_id, is_published) VALUES (?, ?, ?, ?)',
        [formData.title, formData.description, formData.userId, formData.isPublished ? 1 : 0]
      );

      return await this.findById(lastID);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a form by ID
   * 
   * @param {number} id - Form ID
   * @returns {Promise<Object>} Form object
   */
  static async findById(id) {
    try {
      const form = await getAsync('SELECT * FROM forms WHERE id = ?', [id]);

      if (!form) {
        throw new Error('Form not found');
      }

      return form;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all forms
   * 
   * @returns {Promise<Array>} Array of all forms
   */
  static async findAll() {
    try {
      return await allAsync('SELECT * FROM forms ORDER BY created_at DESC');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all forms by user ID
   * 
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of forms
   */
  static async findByUserId(userId) {
    try {
      return await allAsync('SELECT * FROM forms WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all published forms
   * 
   * @returns {Promise<Array>} Array of published forms
   */
  static async findPublished() {
    try {
      return await allAsync('SELECT * FROM forms WHERE is_published = 1 ORDER BY created_at DESC');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a form
   * 
   * @param {number} id - Form ID
   * @param {Object} formData - Form data to update
   * @returns {Promise<Object>} Updated form object
   */
  static async update(id, formData) {
    try {
      // Check if form exists
      await this.findById(id);

      const updates = [];
      const values = [];

      // Add fields to update
      if (formData.title !== undefined) {
        updates.push('title = ?');
        values.push(formData.title);
      }

      if (formData.description !== undefined) {
        updates.push('description = ?');
        values.push(formData.description);
      }

      if (formData.is_published !== undefined) {
        updates.push('is_published = ?');
        values.push(formData.is_published ? 1 : 0);
      }

      // Always update the updated_at timestamp
      updates.push('updated_at = CURRENT_TIMESTAMP');

      // If no updates, return the form
      if (updates.length === 1) { // Only the timestamp
        return await this.findById(id);
      }

      // Add form ID to values array
      values.push(id);

      // Update form
      await runAsync(
        `UPDATE forms SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Return updated form
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a form
   * 
   * @param {number} id - Form ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Check if form exists
      await this.findById(id);

      // Delete form
      await runAsync('DELETE FROM forms WHERE id = ?', [id]);

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Form;