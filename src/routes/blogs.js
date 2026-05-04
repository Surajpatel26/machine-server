const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET published blogs
router.get('/published', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE is_published = true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single blog by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM blogs WHERE slug = $1', [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single blog by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new blog
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, slug, excerpt, content, image_url, author, is_published } = req.body;
    const result = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, image_url, author, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, slug, excerpt, content, image_url, author, is_published || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update blog
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, image_url, author, is_published } = req.body;
    const result = await pool.query(
      `UPDATE blogs 
       SET title=$1, slug=$2, excerpt=$3, content=$4, image_url=$5, author=$6, is_published=$7, updated_at=NOW() 
       WHERE id=$8 RETURNING *`,
      [title, slug, excerpt, content, image_url, author, is_published, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE blog
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM blogs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
