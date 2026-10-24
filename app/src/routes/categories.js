const { Router } = require('express');
const pool = require('../db');

const router = Router();

function validId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

function validColor(value) {
  return value === undefined || value === null || (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value));
}

function validIcon(value) {
  return value === undefined || value === null || (typeof value === 'string' && Array.from(value).length <= 10);
}

// GET /api/categories — list all categories (optionally filter by type)
router.get('/', async (req, res) => {
  try {
    const { type, active } = req.query;
    if (type !== undefined && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Loại danh mục không hợp lệ' });
    }
    if (active !== undefined && !['true', 'false'].includes(active)) {
      return res.status(400).json({ error: 'Trạng thái danh mục không hợp lệ' });
    }
    let query = 'SELECT * FROM categories';
    const conditions = [];
    const params = [];

    if (type && ['income', 'expense'].includes(type)) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (active !== undefined) {
      params.push(active === 'true');
      conditions.push(`is_active = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY type, name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/categories error:', err.message);
    res.status(500).json({ error: 'Không thể tải danh mục' });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Mã danh mục không hợp lệ' });
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Danh mục không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/categories/:id error:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/categories — create
router.post('/', async (req, res) => {
  try {
    const { name, type, color, icon } = req.body || {};

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tên danh mục không được để trống' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Tên danh mục tối đa 100 ký tự' });
    }
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Loại phải là income hoặc expense' });
    }
    if (!validColor(color) || !validIcon(icon)) {
      return res.status(400).json({ error: 'Màu sắc hoặc biểu tượng danh mục không hợp lệ' });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, type, color, icon)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), type, color || '#6366f1', icon || '📁']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/categories error:', err.message);
    res.status(500).json({ error: 'Không thể tạo danh mục' });
  }
});

// PUT /api/categories/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon, is_active } = req.body || {};

    if (!validId(id)) return res.status(400).json({ error: 'Mã danh mục không hợp lệ' });

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Tên danh mục không hợp lệ' });
    }
    if (name && name.trim().length > 100) {
      return res.status(400).json({ error: 'Tên danh mục tối đa 100 ký tự' });
    }
    if (!validColor(color) || !validIcon(icon) ||
        (is_active !== undefined && typeof is_active !== 'boolean')) {
      return res.status(400).json({ error: 'Thuộc tính danh mục không hợp lệ' });
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           color = COALESCE($2, color),
           icon = COALESCE($3, icon),
           is_active = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [name ? name.trim() : null, color || null, icon || null, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Danh mục không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/categories/:id error:', err.message);
    res.status(500).json({ error: 'Không thể cập nhật danh mục' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ error: 'Mã danh mục không hợp lệ' });

    // Check if category has transactions
    const txCheck = await pool.query(
      'SELECT COUNT(*) AS cnt FROM transactions WHERE category_id = $1', [id]
    );
    if (parseInt(txCheck.rows[0].cnt) > 0) {
      // Soft-delete: set is_active = false instead of deleting
      const result = await pool.query(
        'UPDATE categories SET is_active = FALSE WHERE id = $1 RETURNING *', [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Danh mục không tồn tại' });
      }
      return res.json({ message: 'Danh mục đã được ẩn (có giao dịch liên quan)', category: result.rows[0] });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Danh mục không tồn tại' });
    }
    res.json({ message: 'Đã xóa danh mục', category: result.rows[0] });
  } catch (err) {
    console.error('DELETE /api/categories/:id error:', err.message);
    res.status(500).json({ error: 'Không thể xóa danh mục' });
  }
});

module.exports = router;
