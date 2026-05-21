const express = require('express');
const router = express.Router();
const { exportPDF } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.get('/pdf', protect, exportPDF);

module.exports = router;
