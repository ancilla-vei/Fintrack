const express = require('express');
const router = express.Router();
const { getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getIncome).post(createIncome);
router.route('/:id').put(updateIncome).delete(deleteIncome);

module.exports = router;
