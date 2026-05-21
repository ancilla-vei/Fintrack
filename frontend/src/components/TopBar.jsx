import React from 'react';
import { Sun, Moon, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { exportPDF } from '../services/api';
import toast from 'react-hot-toast';
import './TopBar.css';

const TopBar = ({ title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => {
        exportPDF();
        setTimeout(resolve, 1500);
      }),
      { loading: 'Generating PDF...', success: 'PDF downloaded!', error: 'Export failed' }
    );
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <button className="topbar-btn" onClick={handleExport} title="Export PDF">
          <Download size={16} />
          <span>Export PDF</span>
        </button>
        <button className="topbar-btn topbar-theme" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
