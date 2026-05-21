import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { expenseAPI } from '../services/api';
import TopBar from '../components/TopBar';
import toast from 'react-hot-toast';
import './Expenses.css';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Bills: '#ef4444', Entertainment: '#8b5cf6', Health: '#10b981',
  Education: '#06b6d4', Other: '#64748b'
};

const emptyForm = { amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      if (filterCat !== 'All') params.category = filterCat;
      const { data } = await expenseAPI.getAll(params);
      setExpenses(data.expenses);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCat]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await expenseAPI.update(editId, form);
        toast.success('Expense updated!');
      } else {
        await expenseAPI.create(form);
        toast.success('Expense added!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (exp) => {
    setForm({
      amount: exp.amount,
      category: exp.category,
      description: exp.description,
      date: new Date(exp.date).toISOString().split('T')[0]
    });
    setEditId(exp._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Expense deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <TopBar title="Expenses" subtitle={`${total} total records`} />
      <div className="page-wrapper">

        {/* Add Expense Toggle */}
        {!showForm && (
          <button className="btn btn-primary add-btn" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Expense
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="card form-card fade-in">
            <div className="form-card-header">
              <h3>{editId ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button className="icon-btn" onClick={handleCancel}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" className="form-input" placeholder="0.00" step="0.01" min="0.01"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-input" placeholder="What did you spend on?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner" /> : (editId ? <><Check size={15}/> Update</> : <><Plus size={15}/> Add</>)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="card filters-card">
          <div className="filters-row">
            <div className="search-wrap">
              <Search size={15} className="search-icon" />
              <input type="text" className="form-input search-input" placeholder="Search expenses..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="cat-filters">
              {['All', ...CATEGORIES].map(c => (
                <button key={c} className={`cat-chip ${filterCat === c ? 'cat-chip-active' : ''}`}
                  onClick={() => { setFilterCat(c); setPage(1); }}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-summary">
            <span className="summary-count">{total} expenses</span>
            <span className="summary-total">Total: <strong>₹{totalAmount.toFixed(2)}</strong></span>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} /></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <Search size={36} /><h3>No expenses found</h3><p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp._id}>
                        <td><span className="desc-text">{exp.description}</span></td>
                        <td>
                          <span className="badge" style={{
                            background: (CATEGORY_COLORS[exp.category] || '#64748b') + '20',
                            color: CATEGORY_COLORS[exp.category] || '#64748b'
                          }}>{exp.category}</span>
                        </td>
                        <td className="muted-text">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td style={{ textAlign: 'right' }}><span className="amount-neg">-₹{exp.amount.toFixed(2)}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn edit-btn" onClick={() => handleEdit(exp)} title="Edit"><Edit2 size={14} /></button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(exp._id)} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                  <span className="page-info">Page {page} of {pages}</span>
                  <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
