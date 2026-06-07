import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { requestLogger } from './shared/middleware/requestLogger';
import { errorHandler } from './shared/middleware/errorHandler';
import authRouter     from './features/auth/auth.router';
import productRouter  from './features/products/product.router';
import categoryRouter from './features/products/category.router';
import cartRouter     from './features/cart/cart.router';
import orderRouter    from './features/orders/order.router';
import userRouter     from './features/users/user.router';

const app = express();

app.use(helmet());
app.use(cors({
  origin:         config.cors.origin,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    false,
}));
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers
app.use('/api/auth',       authRouter);
app.use('/api/products',   productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart',       cartRouter);
app.use('/api/orders',     orderRouter);
app.use('/api/users',      userRouter);

// Global error handler — must be last
app.use(errorHandler);

export default app;
