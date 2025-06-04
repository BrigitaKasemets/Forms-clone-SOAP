/**
 * Response model for Forms-Clone SOAP API
 * Handles database operations for form responses
 */

const { runAsync, getAsync, allAsync } = require('../db/db');

class Response {
  /**
   * Create a new response
   * 
   * @param {Object} responseData - Response data object
   * @param {number} responseData.formId - Form ID
   * @param {number} [responseData.userId] - User ID (optional for anonymous responses)
   * @returns {Promise<Object>} Created response object
   */
  static async create(responseData) {
    try {
      // Insert response
      const { lastID } = await runAsync(
        'INSERT INTO responses (form_id, user_id) VALUES (?, ?)',
        [responseData.formId, responseData.userId || null]
      );

      return await this.findById(lastID);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add answers to a response
   * 
   * @param {number} responseId - Response ID
   * @param {Array} answers - Array of answer objects {questionId, value}
   * @returns {Promise<Array>} Array of created answers
   */
  static async addAnswers(responseId, answers) {
    try {
      const createdAnswers = [];

      // Insert each answer
      for (const answer of answers) {
        const { lastID } = await runAsync(
          'INSERT INTO answers (response_id, question_id, value) VALUES (?, ?, ?)',
          [responseId, answer.questionId, answer.value]
        );

        createdAnswers.push({
          id: lastID,
          responseId,
          questionId: answer.questionId,
          value: answer.value
        });
      }

      return createdAnswers;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a response by ID
   * 
   * @param {number} id - Response ID
   * @returns {Promise<Object>} Response object
   */
  static async findById(id) {
    try {
      const response = await getAsync('SELECT * FROM responses WHERE id = ?', [id]);

      if (!response) {
        throw new Error('Response not found');
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a response by ID and form ID
   * 
   * @param {number} id - Response ID
   * @param {number} formId - Form ID
   * @returns {Promise<Object>} Response object with answers
   */
  static async findByIdAndFormId(id, formId) {
    try {
      const response = await getAsync(
        'SELECT * FROM responses WHERE id = ? AND form_id = ?',
        [id, formId]
      );

      if (!response) {
        throw new Error('Response not found');
      }

      // Get answers for this response
      const answers = await allAsync(
        'SELECT * FROM answers WHERE response_id = ?',
        [id]
      );

      return { ...response, answers };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all responses for a form
   * 
   * @param {number} formId - Form ID
   * @returns {Promise<Array>} Array of responses
   */
  static async findByFormId(formId) {
    try {
      return await allAsync(
        'SELECT * FROM responses WHERE form_id = ? ORDER BY submitted_at DESC',
        [formId]
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all answers for a response
   * 
   * @param {number} responseId - Response ID
   * @returns {Promise<Array>} Array of answers
   */
  static async findAnswers(responseId) {
    try {
      return await allAsync(
        'SELECT * FROM answers WHERE response_id = ?',
        [responseId]
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a response's answers
   * 
   * @param {number} responseId - Response ID
   * @param {Array} answers - Array of answer objects {questionId, value}
   * @returns {Promise<Array>} Array of updated answers
   */
  static async updateAnswers(responseId, answers) {
    try {
      // Delete existing answers
      await runAsync('DELETE FROM answers WHERE response_id = ?', [responseId]);

      // Add new answers
      return await this.addAnswers(responseId, answers);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a response
   * 
   * @param {number} id - Response ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Check if response exists
      await this.findById(id);

      // Delete response (and related answers through CASCADE)
      await runAsync('DELETE FROM responses WHERE id = ?', [id]);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all responses for a form
   * 
   * @param {number} formId - Form ID
   * @returns {Promise<boolean>} True if successful
   */
  static async deleteByFormId(formId) {
    try {
      await runAsync('DELETE FROM responses WHERE form_id = ?', [formId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Response;