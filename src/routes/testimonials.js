const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM testimonials WHERE is_active=true ORDER BY sort_order ASC, created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});
// GET all testimonials (including inactive) for admin
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// POST new testimonial
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { client_name, company, designation, message, rating, avatar_url, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO testimonials (client_name, company, designation, message, rating, avatar_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [client_name, company, designation, message, rating || 5, avatar_url, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// PUT update testimonial
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, company, designation, message, rating, avatar_url, is_active } = req.body;
    const result = await pool.query(
      `UPDATE testimonials 
       SET client_name=$1, company=$2, designation=$3, message=$4, rating=$5, avatar_url=$6, is_active=$7 
       WHERE id=$8 RETURNING *`,
      [client_name, company, designation, message, rating, avatar_url, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE testimonial
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM testimonials WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
