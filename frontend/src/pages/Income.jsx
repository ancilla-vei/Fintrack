import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, TrendingUp } from 'lucide-react';
import { incomeAPI } from '../services/api';
import TopBar from '../components/TopBar';
import toast from 'react-hot-toast';
import './Expenses.css';

const emptyForm = { amount: '', source: '', description: '', date: new Date().toISOString().split('T')[0] };

const Income = () => {
  const [income, setIncome] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (search) params.search = search;
      const { data } = await incomeAPI.getAll(params);
      setIncome(data.income);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchIncome(); }, [fetchIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.source) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        await incomeAPI.update(editId, form);
        toast.success('Income updated!');
      } else {
        await incomeAPI.create(form);
        toast.success('Income added!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchIncome();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (inc) => {
    setForm({
      amount: inc.amount,
      source: inc.source,
      description: inc.description || '',
      date: new Date(inc.date).toISOString().split('T')[0]
    });
    setEditId(inc._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await incomeAPI.delete(id);
      toast.success('Income deleted');
      fetchIncome();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const totalAmount = income.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <TopBar title="Income" subtitle={`${total} total records`} />
      <div className="page-wrapper">

        {!showForm && (
          <button className="btn btn-primary add-btn" style={{ background: '#059669', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}
            onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Income
          </button>
        )}

        {showForm && (
          <div className="card form-card fade-in">
            <div className="form-card-header">
              <h3>{editId ? 'Edit Income' : 'Add New Income'}</h3>
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
                  <label className="form-label">Source *</label>
                  <input type="text" className="form-input" placeholder="e.g. Salary, Freelance..."
                    value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input type="text" className="form-input" placeholder="Add a note..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: '#059669', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }} disabled={submitting}>
                  {submitting ? <span className="spinner" /> : (editId ? <><Check size={15}/> Update</> : <><Plus size={15}/> Add</>)}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="card filters-card">
          <div className="search-wrap" style={{ maxWidth: 340 }}>
            <Search size={15} className="search-icon" />
            <input type="text" className="form-input search-input" placeholder="Search by source..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-summary">
            <span className="summary-count">{total} income records</span>
            <span className="summary-total" style={{ color: 'var(--text)' }}>
              Total: <strong style={{ color: '#059669' }}>₹{totalAmount.toFixed(2)}</strong>
            </span>
          </div>

          {loading ? (
            <div className="loading-state"><div className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderColor: 'rgba(5,150,105,0.2)', borderTopColor: '#059669' }} /></div>
          ) : income.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={36} /><h3>No income records yet</h3><p>Add your first income to get started</p>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.map(inc => (
                      <tr key={inc._id}>
                        <td>
                          <span className="source-badge">
                            <TrendingUp size={12} />
                            {inc.source}
                          </span>
                        </td>
                        <td className="muted-text">{inc.description || '—'}</td>
                        <td className="muted-text">{new Date(inc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td style={{ textAlign: 'right' }}><span className="amount-pos">+₹{inc.amount.toFixed(2)}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn edit-btn" onClick={() => handleEdit(inc)} title="Edit"><Edit2 size={14} /></button>
                            <button className="action-btn del-btn" onClick={() => handleDelete(inc._id)} title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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

export default Income;
