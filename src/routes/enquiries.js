const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');

const enquiryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
];

// POST submit enquiry
router.post('/', enquiryValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, company, subject, message, product_id } = req.body;
    const result = await pool.query(`
      INSERT INTO enquiries (name, email, phone, company, subject, message, product_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [name, email, phone || null, company || null, subject || null, message, product_id || null]);

    res.status(201).json({
      message: 'Enquiry submitted successfully! We will get back to you soon.',
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

// GET all enquiries (admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, p.name AS product_name
      FROM enquiries e
      LEFT JOIN products p ON e.product_id = p.id
      ORDER BY e.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// PATCH mark enquiry as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE enquiries SET is_read=true WHERE id=$1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
});

// DELETE enquiry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM enquiries WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

module.exports = router;
