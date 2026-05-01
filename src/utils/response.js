'use strict';

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 */
function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {*} [details]
 */
function sendError(res, message, statusCode = 500, details = undefined) {
  const body = { success: false, error: message };
  if (details !== undefined) body.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
