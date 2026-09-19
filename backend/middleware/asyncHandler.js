// Wraps an async controller function so any thrown error or rejected
// promise is automatically passed to next(err) -> errorHandler.js.
// Saves us from writing try/catch in every single controller.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
