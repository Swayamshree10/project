// config/env.js — validates and exports required environment variables
module.exports = {
  PORT: process.env.PORT || 3001,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
}
