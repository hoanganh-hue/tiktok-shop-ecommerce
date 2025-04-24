import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import session from 'express-session';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

// Import routes (sẽ tạo sau)
// import productRoutes from './routes/productRoutes';
// import authRoutes from './routes/authRoutes';
// import orderRoutes from './routes/orderRoutes';
// import sellerRoutes from './routes/sellerRoutes';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Express app setup
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'tiktok-shop-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Static files - cho build production
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Static files - cho uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// API Routes
// app.use('/api/products', productRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/seller', sellerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, db };
