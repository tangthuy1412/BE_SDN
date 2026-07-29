require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = Number(process.env.PORT) || 3000;

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }
  if (!process.env.SECRET_KEY || process.env.SECRET_KEY.length < 32) {
    throw new Error('SECRET_KEY must contain at least 32 characters');
  }

  await mongoose.connect(process.env.MONGO_URI);
  const server = app.listen(port, () => {
    console.log(`Quiz API ready at http://localhost:${port}`);
    console.log(`API documentation: http://localhost:${port}/docs`);
  });

  const shutdown = signal => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch(error => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
