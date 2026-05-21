const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
    maxlength: [100, 'Source cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, { timestamps: true });

IncomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', IncomeSchema);
