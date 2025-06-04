/**
 * Question model for Forms-Clone SOAP API
 * Handles database operations for form questions
 */

const { runAsync, getAsync, allAsync } = require('../db/db');

class Question {
  /**
   * Create a new question
   * 
   * @param {Object} questionData - Question data object
   * @param {number} questionData.formId - Form ID
   * @param {string} questionData.title - Question title/text
   * @param {string} questionData.type - Question type
   * @param {boolean} questionData.required - Whether the question is required
   * @param {string} [questionData.options] - Question options (for multiple choice)
   * @param {number} [questionData.orderNum] - Question order number
   * @returns {Promise<Object>} Created question object
   */
  static async create(questionData) {
    try {
      // Get the current max order number for the form
      let orderNum = questionData.orderNum;
      if (orderNum === undefined) {
        const maxOrder = await getAsync(
          'SELECT MAX(order_num) as max_order FROM questions WHERE form_id = ?',
          [questionData.formId]
        );
        orderNum = (maxOrder && maxOrder.max_order ? maxOrder.max_order : 0) + 1;
      }

      // Insert question
      const { lastID } = await runAsync(
        'INSERT INTO questions (form_id, title, type, required, options, order_num) VALUES (?, ?, ?, ?, ?, ?)',
        [
          questionData.formId,
          questionData.title,
          questionData.type,
          questionData.required ? 1 : 0,
          questionData.options || null,
          orderNum
        ]
      );

      return await this.findById(lastID);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a question by ID
   * 
   * @param {number} id - Question ID
   * @returns {Promise<Object>} Question object
   */
  static async findById(id) {
    try {
      const question = await getAsync('SELECT * FROM questions WHERE id = ?', [id]);

      if (!question) {
        throw new Error('Question not found');
      }

      return question;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a question by ID and form ID
   * 
   * @param {number} id - Question ID
   * @param {number} formId - Form ID
   * @returns {Promise<Object>} Question object
   */
  static async findByIdAndFormId(id, formId) {
    try {
      const question = await getAsync(
        'SELECT * FROM questions WHERE id = ? AND form_id = ?',
        [id, formId]
      );

      if (!question) {
        throw new Error('Question not found');
      }

      return question;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all questions for a form
   * 
   * @param {number} formId - Form ID
   * @returns {Promise<Array>} Array of questions
   */
  static async findByFormId(formId) {
    try {
      return await allAsync(
        'SELECT * FROM questions WHERE form_id = ? ORDER BY order_num ASC',
        [formId]
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a question
   * 
   * @param {number} id - Question ID
   * @param {Object} questionData - Question data to update
   * @returns {Promise<Object>} Updated question object
   */
  static async update(id, questionData) {
    try {
      // Check if question exists
      await this.findById(id);

      const updates = [];
      const values = [];

      // Add fields to update
      if (questionData.title !== undefined) {
        updates.push('title = ?');
        values.push(questionData.title);
      }

      if (questionData.type !== undefined) {
        updates.push('type = ?');
        values.push(questionData.type);
      }

      if (questionData.required !== undefined) {
        updates.push('required = ?');
        values.push(questionData.required ? 1 : 0);
      }

      if (questionData.options !== undefined) {
        updates.push('options = ?');
        values.push(questionData.options);
      }

      if (questionData.orderNum !== undefined) {
        updates.push('order_num = ?');
        values.push(questionData.orderNum);
      }

      // If no updates, return the question
      if (updates.length === 0) {
        return await this.findById(id);
      }

      // Add question ID to values array
      values.push(id);

      // Update question
      await runAsync(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Return updated question
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a question
   * 
   * @param {number} id - Question ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Check if question exists
      await this.findById(id);

      // Delete question
      await runAsync('DELETE FROM questions WHERE id = ?', [id]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all questions for a form
   * 
   * @param {number} formId - Form ID
   * @returns {Promise<boolean>} True if successful
   */
  static async deleteByFormId(formId) {
    try {
      await runAsync('DELETE FROM questions WHERE form_id = ?', [formId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Question;