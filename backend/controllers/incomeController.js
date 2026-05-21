const Income = require('../models/Income');

// @desc    Get all income for user
// @route   GET /api/income
const getIncome = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (search) query.source = { $regex: search, $options: 'i' };

    const total = await Income.countDocuments(query);
    const income = await Income.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, income, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create income
// @route   POST /api/income
const createIncome = async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ message: 'Please provide amount and source' });
    }

    const income = await Income.create({
      user: req.user._id,
      amount: parseFloat(amount),
      source,
      description: description || '',
      date: date || new Date()
    });

    res.status(201).json({ success: true, income });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
const updateIncome = async (req, res) => {
  try {
    let income = await Income.findById(req.params.id);

    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    income = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    res.json({ success: true, income });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await income.deleteOne();
    res.json({ success: true, message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getIncome, createIncome, updateIncome, deleteIncome };
