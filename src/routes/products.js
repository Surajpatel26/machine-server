const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

// GET all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, limit = 20, offset = 0 } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND c.slug = $${paramCount++}`;
      params.push(category);
    }
    if (featured === 'true') {
      query += ` AND p.is_featured = true`;
    }
    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.short_description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    query += ` ORDER BY p.sort_order ASC, p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Count query
    let countQuery = `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true`;
    const countParams = [];
    let cp = 1;
    if (category) { countQuery += ` AND c.slug = $${cp++}`; countParams.push(category); }
    if (search) { countQuery += ` AND (p.name ILIKE $${cp} OR p.short_description ILIKE $${cp})`; countParams.push(`%${search}%`); }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product (admin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, slug, short_description, description, specifications, features, main_image, images, is_featured } = req.body;
    const result = await pool.query(`
      INSERT INTO products (category_id, name, slug, short_description, description, specifications, features, main_image, images, is_featured)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `, [category_id, name, slug, short_description, description, JSON.stringify(specifications || {}), features || [], main_image, images || [], is_featured || false]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, short_description, description, specifications, features, is_featured, is_active, main_image, images } = req.body;
    const result = await pool.query(`
      UPDATE products 
      SET name=$1, short_description=$2, description=$3, specifications=$4, features=$5, is_featured=$6, is_active=$7, main_image=$8, images=$9, updated_at=NOW()
      WHERE id=$10 RETURNING *
    `, [name, short_description, description, JSON.stringify(specifications || {}), features || [], is_featured, is_active, main_image, images || [], id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});


// DELETE product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
