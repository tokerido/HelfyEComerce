import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`[server] Running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('[server] Gracefully shut down');
    process.exit(0);
  });
});
