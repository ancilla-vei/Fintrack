const Expense = require('../models/Expense');

// @desc    Get all expenses for user
// @route   GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (search) query.description = { $regex: search, $options: 'i' };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, expenses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount: parseFloat(amount),
      category,
      description,
      date: date || new Date()
    });

    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });

    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
