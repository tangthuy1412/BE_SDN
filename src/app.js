require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');

const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const openapi = require('./openapi');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : true,
  credentials: true
}));
app.use(pinoHttp({
  enabled: process.env.NODE_ENV !== 'test',
  redact: ['req.headers.authorization', 'req.body.password']
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use('/users/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'quiz-api',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: 'Quiz API Docs'
}));
app.get('/openapi.json', (req, res) => res.json(openapi));

app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/users', userRoutes);

// Backward-compatible aliases.
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
