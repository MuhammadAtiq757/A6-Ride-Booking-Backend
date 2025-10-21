import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
  username: envVars.REDIS_USERNAME || "default",
  password: envVars.REDIS_PASSWORD,
  socket: {
    host: envVars.REDIS_HOST,
    port: Number(envVars.REDIS_PORT),
    tls: true, // Add TLS for Upstash
    reconnectStrategy: (retries) => {
      // Exponential backoff for reconnection
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('🔌 Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis Client Ready');
});

redisClient.on('end', () => {
  console.log('❌ Redis Client Disconnected');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      console.log('✅ Redis Connected Successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }
};