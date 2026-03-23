require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_crm',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  aiEndpoint: process.env.AI_MODEL_ENDPOINT || 'http://localhost:5001/api/ai'
};
