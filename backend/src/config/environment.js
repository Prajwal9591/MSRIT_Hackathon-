import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
  aiProvider: process.env.AI_MODEL_PROVIDER || 'Antigravity AI Engine (Gemini 3.6 Flash)',
  aiApiKey: process.env.AI_API_KEY || '',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 50
};
