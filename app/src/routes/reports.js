const { Router } = require('express');
const pool = require('../db');

const router = Router();

// GET /api/reports/summary — total income, expense, balance
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const conditions = [];
    const params = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`occurred_on >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`occurred_on <= $${params.length}`);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS balance,
        COUNT(*) AS transaction_count
      FROM transactions
      ${where}
    `, params);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/reports/summary error:', err.message);
    res.status(500).json({ error: 'Không thể tải báo cáo tổng hợp' });
  }
});

// GET /api/reports/by-category — totals grouped by category
router.get('/by-category', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const conditions = [];
    const params = [];

    if (startDate) {
      params.push(startDate);
      conditions.push(`t.occurred_on >= $${params.length}`);
    }
    if (endDate) {
      params.push(endDate);
      conditions.push(`t.occurred_on <= $${params.length}`);
    }
    if (type && ['income', 'expense'].includes(type)) {
      params.push(type);
      conditions.push(`t.type = $${params.length}`);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const result = await pool.query(`
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.color AS category_color,
        c.icon AS category_icon,
        t.type,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${where}
      GROUP BY c.id, c.name, c.color, c.icon, t.type
      ORDER BY total DESC
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/reports/by-category error:', err.message);
    res.status(500).json({ error: 'Không thể tải báo cáo theo danh mục' });
  }
});

// GET /api/reports/monthly — income/expense by month
router.get('/monthly', async (req, res) => {
  try {
    const { months } = req.query;
    const limit = Math.min(parseInt(months) || 6, 24);

    const result = await pool.query(`
      SELECT
        TO_CHAR(occurred_on, 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense,
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS balance,
        COUNT(*) AS transaction_count
      FROM transactions
      GROUP BY TO_CHAR(occurred_on, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows.reverse());
  } catch (err) {
    console.error('GET /api/reports/monthly error:', err.message);
    res.status(500).json({ error: 'Không thể tải báo cáo theo tháng' });
  }
});

module.exports = router;
