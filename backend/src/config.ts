export const config = {
  port: Number(process.env.PORT ?? 3001),
  db: {
    host:     process.env.DB_HOST!,
    port:     Number(process.env.DB_PORT ?? 3306),
    name:     process.env.DB_NAME!,
    user:     process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },
  jwt: {
    secret:    process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
