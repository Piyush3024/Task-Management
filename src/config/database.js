import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from './logger.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  await mongoose.connect(config.mongodb.uri);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
