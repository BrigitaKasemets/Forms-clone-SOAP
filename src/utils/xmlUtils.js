/**
 * XML utilities for SOAP services
 * Helper functions for XML conversion and validation
 */

const xml2js = require('xml2js');

/**
 * Convert a JavaScript object to XML
 * 
 * @param {Object} obj - The object to convert
 * @param {Object} options - XML conversion options
 * @returns {Promise<string>} - XML string
 */
const objectToXml = async (obj, options = {}) => {
  try {
    const builder = new xml2js.Builder({
      rootName: options.rootName || 'root',
      headless: options.headless || false,
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
      ...options
    });
    
    return builder.buildObject(obj);
  } catch (error) {
    throw new Error(`Error converting object to XML: ${error.message}`);
  }
};

/**
 * Parse XML to a JavaScript object
 * 
 * @param {string} xml - The XML string to parse
 * @param {Object} options - XML parsing options
 * @returns {Promise<Object>} - Parsed object
 */
const xmlToObject = async (xml, options = {}) => {
  try {
    const parser = new xml2js.Parser({
      explicitArray: options.explicitArray || false,
      ignoreAttrs: options.ignoreAttrs || true,
      ...options
    });
    
    return await parser.parseStringPromise(xml);
  } catch (error) {
    throw new Error(`Error parsing XML: ${error.message}`);
  }
};

/**
 * Create a SOAP fault response
 * 
 * @param {string} faultCode - The fault code
 * @param {string} faultString - The fault message
 * @param {string} detail - Additional fault details
 * @returns {Object} - SOAP fault object
 */
const createSoapFault = (faultCode, faultString, detail = '') => {
  return {
    Fault: {
      faultcode: faultCode,
      faultstring: faultString,
      detail: detail
    }
  };
};

module.exports = {
  objectToXml,
  xmlToObject,
  createSoapFault
};
