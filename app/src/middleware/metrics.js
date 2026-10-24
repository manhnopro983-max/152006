const client = require('prom-client');

// ---------- Registry ----------
const register = new client.Registry();
register.setDefaultLabels({ app: 'expense-tracker' });

// Collect Node.js default metrics (CPU, memory, event loop, GC)
client.collectDefaultMetrics({ register });

// ---------- Custom Metrics ----------

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// Transaction operations counter
const transactionOpsTotal = new client.Counter({
  name: 'transaction_operations_total',
  help: 'Total transaction CRUD operations',
  labelNames: ['operation'],
  registers: [register],
});

// ---------- Middleware ----------

function normalizeRoute(path) {
  // Replace numeric IDs to avoid high-cardinality labels
  return path
    .replace(/\/\d+/g, '/:id')
    .replace(/\?.*$/, '');
}

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next(); // skip self

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route: normalizeRoute(req.path),
      status_code: res.statusCode,
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, durationSec);
  });

  next();
}

module.exports = {
  register,
  metricsMiddleware,
  transactionOpsTotal,
};
