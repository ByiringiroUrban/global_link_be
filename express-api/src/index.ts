import { createApp } from './app';
import { config } from './config';
import { disconnectDb } from './lib/prisma';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Global Link Express API running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

async function shutdown() {
  console.log('Shutting down...');
  server.close();
  await disconnectDb();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
