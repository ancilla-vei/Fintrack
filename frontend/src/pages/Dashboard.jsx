import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

import { Bar, Doughnut } from 'react-chartjs-2';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';

import { useAuth } from '../context/AuthContext';
import { expenseAPI, incomeAPI } from '../services/api';
import TopBar from '../components/TopBar';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

defaults.font.family = 'DM Sans, sans-serif';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Education: '#06b6d4',
  Other: '#64748b'
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  change,
  changeLabel
}) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-label">{label}</span>

      <div
        className="stat-icon"
        style={{
          background: color + '20',
          color
        }}
      >
        <Icon size={18} />
      </div>
    </div>

    <div className="stat-value">
      ₹
      {value.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </div>

    {change !== undefined && (
      <div
        className={`stat-change ${
          change >= 0 ? 'positive' : 'negative'
        }`}
      >
        {change >= 0 ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}

        <span>
          {Math.abs(change).toFixed(1)}% {changeLabel}
        </span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        expenseAPI.getAll({ limit: 500 }),
        incomeAPI.getAll({ limit: 500 })
      ]);

      setExpenses(expRes.data.expenses || []);
      setIncome(incRes.data.income || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalIncome = income.reduce(
    (s, i) => s + i.amount,
    0
  );

  const totalExpenses = expenses.reduce(
    (s, e) => s + e.amount,
    0
  );

  const balance = totalIncome - totalExpenses;

  // Monthly data
  const currentYear = new Date().getFullYear();

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpenses = Array(12).fill(0);

  income.forEach(i => {
    const d = new Date(i.date);

    if (d.getFullYear() === currentYear) {
      monthlyIncome[d.getMonth()] += i.amount;
    }
  });

  expenses.forEach(e => {
    const d = new Date(e.date);

    if (d.getFullYear() === currentYear) {
      monthlyExpenses[d.getMonth()] += e.amount;
    }
  });

  // Category Data
  const categoryTotals = {};

  expenses.forEach(e => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const catLabels = Object.keys(categoryTotals);
  const catValues = Object.values(categoryTotals);

  const catColors = catLabels.map(
    l => CATEGORY_COLORS[l] || '#64748b'
  );

  // Bar Chart
  const barData = {
    labels: MONTHS,

    datasets: [
      {
        label: 'Income',
        data: monthlyIncome,
        backgroundColor: '#7c3aed',
        borderRadius: 6,
        barThickness: 14
      },

      {
        label: 'Expenses',
        data: monthlyExpenses,
        backgroundColor: '#f87171',
        borderRadius: 6,
        barThickness: 14
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top',

        labels: {
          color: 'var(--text-muted)',
          font: { size: 12 },
          boxWidth: 12,
          padding: 16
        }
      },

      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 8,

        callbacks: {
          label: ctx => ` ₹${ctx.raw.toFixed(2)}`
        }
      }
    },

    scales: {
      x: {
        grid: { display: false },

        ticks: {
          color: 'var(--text-muted)',
          font: { size: 11 }
        }
      },

      y: {
        grid: {
          color: 'var(--border)',
          drawBorder: false
        },

        ticks: {
          color: 'var(--text-muted)',
          font: { size: 11 },

          callback: v => '₹' + v
        }
      }
    }
  };

  // Donut Chart
  const donutData = {
    labels: catLabels.length ? catLabels : ['No data'],

    datasets: [
      {
        data: catValues.length ? catValues : [1],

        backgroundColor: catColors.length
          ? catColors
          : ['#e2e8f0'],

        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',

    plugins: {
      legend: {
        position: 'right',

        labels: {
          color: 'var(--text-muted)',
          font: { size: 12 },
          boxWidth: 10,
          padding: 12
        }
      },

      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 8,

        callbacks: {
          label: ctx => ` ₹${ctx.raw.toFixed(2)}`
        }
      }
    }
  };

  const recentExpenses = [...expenses].slice(0, 5);

  if (loading) {
    return (
      <div className="loading-state">
        <div
          className="spinner"
          style={{
            width: 32,
            height: 32,
            borderWidth: 3,
            borderColor: 'rgba(124,58,237,0.2)',
            borderTopColor: '#7c3aed'
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <TopBar
        title={`Good ${
          new Date().getHours() < 12
            ? 'morning'
            : new Date().getHours() < 18
            ? 'afternoon'
            : 'evening'
        }, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your financial overview"
      />

      <div className="page-wrapper">

        {/* Stats */}
        <div className="stats-grid">

          <StatCard
            label="Total Income"
            value={totalIncome}
            icon={TrendingUp}
            color="#059669"
          />

          <StatCard
            label="Total Expenses"
            value={totalExpenses}
            icon={TrendingDown}
            color="#dc2626"
          />

          <StatCard
            label="Net Balance"
            value={balance}
            icon={IndianRupee}
            color={balance >= 0 ? '#7c3aed' : '#dc2626'}
          />
        </div>

        {/* Charts */}
        <div className="charts-grid">

          <div className="card chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">
                  Income vs Expenses
                </h3>

                <p className="chart-subtitle">
                  {currentYear} overview
                </p>
              </div>
            </div>

            <div
              className="chart-wrap"
              style={{ height: 280 }}
            >
              <Bar
                data={barData}
                options={barOptions}
              />
            </div>
          </div>

          <div className="card chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">
                  Expenses by Category
                </h3>

                <p className="chart-subtitle">
                  All time breakdown
                </p>
              </div>
            </div>

            <div
              className="chart-wrap"
              style={{ height: 280 }}
            >
              <Doughnut
                data={donutData}
                options={donutOptions}
              />
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="section-header">
            <h3 className="chart-title">
              Recent Expenses
            </h3>

            <a
              href="/expenses"
              className="see-all"
            >
              See all →
            </a>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-state">
              <TrendingDown size={36} />

              <h3>No expenses yet</h3>

              <p>
                Add your first expense to get started
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">

                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>

                    <th style={{ textAlign: 'right' }}>
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentExpenses.map(exp => (
                    <tr key={exp._id}>

                      <td>
                        <span className="desc-text">
                          {exp.description}
                        </span>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              (
                                CATEGORY_COLORS[
                                  exp.category
                                ] || '#64748b'
                              ) + '20',

                            color:
                              CATEGORY_COLORS[
                                exp.category
                              ] || '#64748b'
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="muted-text">
                        {new Date(
                          exp.date
                        ).toLocaleDateString(
                          'en-IN',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }
                        )}
                      </td>

                      <td
                        style={{
                          textAlign: 'right'
                        }}
                      >
                        <span className="amount-neg">
                          -₹{exp.amount.toFixed(2)}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;