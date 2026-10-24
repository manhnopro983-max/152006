const express = require('express');
const path    = require('path');
const helmet  = require('helmet');
const morgan  = require('morgan');
const cors    = require('cors');

const categoriesRouter   = require('./routes/categories');
const transactionsRouter = require('./routes/transactions');
const reportsRouter      = require('./routes/reports');
const pool               = require('./db');
const { register, metricsMiddleware } = require('./middleware/metrics');

const app  = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------

// Security headers (additional layer behind Nginx)
app.use(helmet({
  contentSecurityPolicy: false, // Let Nginx handle CSP
}));

// CORS (useful for development)
app.use(cors());

// Request logging — no sensitive data
app.use(morgan(':method :url :status :response-time ms'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics middleware — track all requests
app.use(metricsMiddleware);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// --------------- Routes ---------------

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// API routes
app.use('/api/categories',   categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/reports',      reportsRouter);

// SPA fallback — serve index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --------------- Error handling ---------------

// 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint không tồn tại' });
});

// Global error handler — never expose stack traces
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
});

// --------------- Start ---------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[expense-tracker] Server running on port ${PORT}`);
  console.log(`[expense-tracker] Environment: ${process.env.NODE_ENV || 'development'}`);
});
