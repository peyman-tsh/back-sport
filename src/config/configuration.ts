export interface AppConfig {
  port: number;
  environment: string;
  mongodb: {
    uri: string;
    dbName: string;
    maxPoolSize: number;
    minPoolSize: number;
  };
  cors: {
    origin: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '4000', 10),
  environment: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/headlight_db',
    dbName: process.env.MONGODB_DB_NAME || 'headlight_db',
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '100', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '20', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
});
