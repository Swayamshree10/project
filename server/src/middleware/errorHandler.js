// middleware/errorHandler.js — global Express error handler
module.exports = function errorHandler(err, _req, res, _next) {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' })
}
