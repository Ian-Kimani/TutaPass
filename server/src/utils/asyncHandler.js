/**
 * Wraps asynchronous route controllers and catches unhandled rejections,
 * routing them cleanly to Express error handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
