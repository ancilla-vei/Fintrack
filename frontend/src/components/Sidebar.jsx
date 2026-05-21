import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, TrendingDown, BarChart3, LogOut, Menu, X, IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/income', icon: TrendingUp, label: 'Income' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <IndianRupee size={20} />
          </div>
          <span className="logo-text">FinTrack</span>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="nav-section-title">Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;