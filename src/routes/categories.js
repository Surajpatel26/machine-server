const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE slug=$1 AND is_active=true', [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

module.exports = router;
