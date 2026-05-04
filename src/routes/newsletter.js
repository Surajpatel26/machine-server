const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { body, validationResult } = require('express-validator');

router.post('/subscribe', [
  body('email').isEmail().withMessage('Valid email required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, name } = req.body;
    await pool.query(`
      INSERT INTO newsletter_subscribers (email, name)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET is_active=true
    `, [email, name || null]);
    res.json({ message: 'Successfully subscribed to our newsletter!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

module.exports = router;
