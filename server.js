import './src/config/index.js';
import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { redis } from './src/config/redis.js';
import { logger } from './src/config/logger.js';
import { config } from './src/config/index.js';

async function start() {
  try {
    await connectDatabase();
    logger.info('Database connection established');

    await redis.ping();
    logger.info('Redis connection confirmed');

    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.nodeEnv }, 'Server started');
    });

    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received');

      server.close(async () => {
        try {
          await disconnectDatabase();
          await redis.quit();
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during shutdown');
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error({ reason }, 'Unhandled promise rejection — shutting down');
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
