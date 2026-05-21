import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler, defaults
} from 'chart.js';
import { expenseAPI, incomeAPI } from '../services/api';
import TopBar from '../components/TopBar';
import './Analytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);
defaults.font.family = 'DM Sans, sans-serif';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORY_COLORS = {
  Food: '#f59e0b', Transport: '#3b82f6', Shopping: '#ec4899',
  Bills: '#ef4444', Entertainment: '#8b5cf6', Health: '#10b981',
  Education: '#06b6d4', Other: '#64748b'
};

const tooltipConfig = {
  backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
  padding: 12, cornerRadius: 8,
  callbacks: { label: ctx => ` ₹${ctx.raw.toFixed(2)}` }
};

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        expenseAPI.getAll({ limit: 1000 }),
        incomeAPI.getAll({ limit: 1000 })
      ]);
      setExpenses(expRes.data.expenses || []);
      setIncome(incRes.data.income || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const currentYear = new Date().getFullYear();

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);
  income.forEach(i => {
    const d = new Date(i.date);
    if (d.getFullYear() === currentYear) monthlyIncome[d.getMonth()] += i.amount;
  });
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === currentYear) monthlyExpenses[d.getMonth()] += e.amount;
  });

  const monthlySavings = monthlyIncome.map((inc, i) => inc - monthlyExpenses[i]);

  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const catLabels = Object.keys(categoryTotals).sort((a,b) => categoryTotals[b] - categoryTotals[a]);
  const catColors = catLabels.map(l => CATEGORY_COLORS[l] || '#64748b');

  const chartOpts = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: 'var(--text-muted)', font: { size: 12 }, boxWidth: 12, padding: 16 } },
      title: { display: false },
      tooltip: tooltipConfig
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 11 } } },
      y: {
        grid: { color: 'var(--border)' },
        ticks: { color: 'var(--text-muted)', font: { size: 11 }, callback: v => '₹' + v }
      }
    }
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: 'Income', data: monthlyIncome, backgroundColor: '#7c3aed', borderRadius: 6, barThickness: 12 },
      { label: 'Expenses', data: monthlyExpenses, backgroundColor: '#f87171', borderRadius: 6, barThickness: 12 }
    ]
  };

  const lineData = {
    labels: MONTHS,
    datasets: [{
      label: 'Net Savings',
      data: monthlySavings,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#7c3aed',
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  };

  const donutData = {
    labels: catLabels.length ? catLabels : ['No data'],
    datasets: [{
      data: catLabels.length ? catLabels.map(l => categoryTotals[l]) : [1],
      backgroundColor: catColors.length ? catColors : ['#e2e8f0'],
      borderWidth: 0, hoverOffset: 6
    }]
  };

  const barCatData = {
    labels: catLabels,
    datasets: [{
      label: 'Amount',
      data: catLabels.map(l => categoryTotals[l]),
      backgroundColor: catColors,
      borderRadius: 8
    }]
  };

  const totalIncome = income.reduce((s,i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s,e) => s + e.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
    </div>
  );

  return (
    <div>
      <TopBar title="Analytics" subtitle="Detailed financial insights" />
      <div className="page-wrapper">

        {/* KPI Row */}
        <div className="kpi-row">
          {[
            { label: 'Savings Rate', value: `${savingsRate}%`, color: '#7c3aed', sub: 'of income saved' },
            { label: 'Avg Monthly Expense', value: `₹${(totalExpenses / 12).toFixed(0)}`, color: '#dc2626', sub: 'per month' },
            { label: 'Avg Monthly Income', value: `₹${(totalIncome / 12).toFixed(0)}`, color: '#059669', sub: 'per month' },
            { label: 'Transactions', value: expenses.length + income.length, color: '#d97706', sub: 'total records' },
          ].map(kpi => (
            <div key={kpi.label} className="kpi-card card">
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="kpi-sub">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly Comparison */}
        <div className="chart-row">
          <div className="card chart-block">
            <h3 className="chart-title">Monthly Income vs Expenses</h3>
            <p className="chart-subtitle">{currentYear} breakdown</p>
            <div style={{ height: 300, marginTop: 20 }}>
              <Bar data={barData} options={chartOpts()} />
            </div>
          </div>

          <div className="card chart-block">
            <h3 className="chart-title">Net Savings Trend</h3>
            <p className="chart-subtitle">Monthly savings over {currentYear}</p>
            <div style={{ height: 300, marginTop: 20 }}>
              <Line data={lineData} options={chartOpts()} />
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="chart-row">
          <div className="card chart-block">
            <h3 className="chart-title">Category Distribution</h3>
            <p className="chart-subtitle">Expenses breakdown by category</p>
            <div style={{ height: 300, marginTop: 20 }}>
              <Doughnut data={donutData} options={{ ...chartOpts(), cutout: '70%', plugins: { ...chartOpts().plugins, legend: { position: 'right', labels: { color: 'var(--text-muted)', font: { size: 12 }, boxWidth: 10, padding: 12 } } } }} />
            </div>
          </div>

          <div className="card chart-block">
            <h3 className="chart-title">Expenses by Category</h3>
            <p className="chart-subtitle">Total spent per category</p>
            <div style={{ height: 300, marginTop: 20 }}>
              <Bar data={barCatData} options={{ ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Category Details */}
        {catLabels.length > 0 && (
          <div className="card">
            <h3 className="chart-title" style={{ marginBottom: 16 }}>Category Breakdown</h3>
            <div className="cat-breakdown">
              {catLabels.map(cat => {
                const pct = totalExpenses > 0 ? (categoryTotals[cat] / totalExpenses * 100).toFixed(1) : 0;
                return (
                  <div key={cat} className="cat-row">
                    <div className="cat-row-left">
                      <span className="cat-dot" style={{ background: CATEGORY_COLORS[cat] || '#64748b' }} />
                      <span className="cat-name">{cat}</span>
                    </div>
                    <div className="cat-bar-wrap">
                      <div className="cat-bar" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] || '#64748b' }} />
                    </div>
                    <span className="cat-pct">{pct}%</span>
                    <span className="cat-amount">₹{categoryTotals[cat].toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
