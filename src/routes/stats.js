const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET stats + certifications
router.get('/', async (req, res) => {
  try {
    const statsResult = await pool.query(
      'SELECT * FROM stats WHERE is_active=true ORDER BY sort_order ASC'
    );
    const certsResult = await pool.query(
      'SELECT * FROM certifications WHERE is_active=true ORDER BY sort_order ASC'
    );
    res.json({
      stats: statsResult.rows,
      certifications: certsResult.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
