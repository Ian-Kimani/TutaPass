const { sendError } = require('../utils/apiResponse');

/**
 * Higher-order middleware factory that wraps a validator function.
 * @param {Function} validatorFn - Validator function returning { valid: boolean, error?: string }
 */
const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    const result = validatorFn(req.body);
    if (!result.valid) {
      return sendError(res, result.error, 400);
    }
    next();
  };
};

module.exports = validateRequest;
