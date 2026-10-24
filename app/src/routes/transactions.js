const { Router } = require('express');
const pool = require('../db');
const { transactionOpsTotal } = require('../middleware/metrics');

const router = Router();

function validId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

// Validate transaction input
function validateTransaction(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Dữ liệu giao dịch không hợp lệ'];
  }
  const { category_id, type, amount, occurred_on, note } = body;

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Loại giao dịch phải là income hoặc expense');
  }
  if (!Number.isSafeInteger(Number(category_id)) || Number(category_id) <= 0) {
    errors.push('Danh mục không hợp lệ');
  }

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || !/^\d+$/.test(String(amount)) || !Number.isSafeInteger(numAmount) || numAmount <= 0) {
    errors.push('Số tiền phải lớn hơn 0');
  }
  if (numAmount > 999999999999) {
    errors.push('Số tiền vượt quá giới hạn');
  }

  if (!occurred_on) {
    errors.push('Ngày giao dịch không được để trống');
  } else {
    const d = new Date(`${occurred_on}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurred_on) || isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== occurred_on) {
      errors.push('Ngày giao dịch không hợp lệ');
    }
  }

  if (note !== undefined && note !== null && (typeof note !== 'string' || note.length > 500)) {
    errors.push('Ghi chú tối đa 500 ký tự');
  }

  return errors;
}

// GET /api/transactions — list with filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, type, categoryId, limit, offset } = req.query;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const validDate = (value) => typeof value === 'string' && datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if ((startDate && !validDate(startDate)) || (endDate && !validDate(endDate)) || (startDate && endDate && startDate > endDate)) {
      return res.status(400).json({ error: 'Khoảng ngày lọc không hợp lệ' });
    }
    if (type && !['income', 'expense'].includes(type)) return res.status(400).json({ error: 'Loại giao dịch không hợp lệ' });
    if (categoryId !== undefined && !validId(categoryId)) return res.status(400).json({ error: 'Danh mục không hợp lệ' });
    if (limit !== undefined && (!/^\d+$/.test(limit) || !Number.isSafeInteger(Number(limit)) || Number(limit) < 1)) return res.status(400).json({ error: 'limit không hợp lệ' });
    if (offset !== undefined && (!/^\d+$/.test(offset) || !Number.isSafeInteger(Number(offset)))) return res.status(400).json({ error: 'offset không hợp lệ' });
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
    if (type) {
      params.push(type);
      conditions.push(`t.type = $${params.length}`);
    }
    if (categoryId) {
      params.push(Number(categoryId));
      conditions.push(`t.category_id = $${params.length}`);
    }
    const fromClause = `FROM transactions t JOIN categories c ON t.category_id = c.id`;
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    let query = `
      SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
      ${fromClause}
      ${whereClause}
    `;
    // Count total using the same filters before applying pagination.
    const countQuery = `SELECT COUNT(*) AS total ${fromClause} ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    query += ' ORDER BY t.occurred_on DESC, t.created_at DESC';

    const pageLimit = Math.min(parseInt(limit) || 50, 100);
    const pageOffset = parseInt(offset) || 0;
    params.push(pageLimit);
    query += ` LIMIT $${params.length}`;
    params.push(pageOffset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows, total, limit: pageLimit, offset: pageOffset });
  } catch (err) {
    console.error('GET /api/transactions error:', err.message);
    res.status(500).json({ error: 'Không thể tải giao dịch' });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Mã giao dịch không hợp lệ' });
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Giao dịch không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/transactions/:id error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/transactions — create
router.post('/', async (req, res) => {
  try {
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const { category_id, type, amount, occurred_on, note } = req.body;

    const result = await pool.query(
      `INSERT INTO transactions (category_id, type, amount, occurred_on, note)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [category_id, type, Math.round(Number(amount)), occurred_on, note ? note.trim() : null]
    );

    // Fetch with category info
    const full = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`, [result.rows[0].id]
    );

    transactionOpsTotal.inc({ operation: 'create' });
    console.log(`[transaction] created id=${full.rows[0].id} type=${type}`);
    res.status(201).json(full.rows[0]);
  } catch (err) {
    if (err.message.includes('Transaction type must match category type')) {
      return res.status(400).json({ error: 'Loại giao dịch phải khớp với loại danh mục' });
    }
    console.error('POST /api/transactions error:', err.message);
    res.status(500).json({ error: 'Không thể tạo giao dịch' });
  }
});

// PUT /api/transactions/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Mã giao dịch không hợp lệ' });
    const errors = validateTransaction(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    const { category_id, type, amount, occurred_on, note } = req.body;

    const result = await pool.query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, occurred_on = $4, note = $5
       WHERE id = $6 RETURNING *`,
      [category_id, type, Math.round(Number(amount)), occurred_on, note ? note.trim() : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Giao dịch không tồn tại' });
    }

    const full = await pool.query(
      `SELECT t.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.id = $1`, [id]
    );

    transactionOpsTotal.inc({ operation: 'update' });
    console.log(`[transaction] updated id=${id} type=${type}`);
    res.json(full.rows[0]);
  } catch (err) {
    if (err.message.includes('Transaction type must match category type')) {
      return res.status(400).json({ error: 'Loại giao dịch phải khớp với loại danh mục' });
    }
    console.error('PUT /api/transactions/:id error:', err.message);
    res.status(500).json({ error: 'Không thể cập nhật giao dịch' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Mã giao dịch không hợp lệ' });
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING *', [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Giao dịch không tồn tại' });
    }
    transactionOpsTotal.inc({ operation: 'delete' });
    console.log(`[transaction] deleted id=${req.params.id}`);
    res.json({ message: 'Đã xóa giao dịch' });
  } catch (err) {
    console.error('DELETE /api/transactions/:id error:', err.message);
    res.status(500).json({ error: 'Không thể xóa giao dịch' });
  }
});

module.exports = router;
