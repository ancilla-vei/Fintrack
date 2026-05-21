import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading FinTrack...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/expenses" element={
        <ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>
      } />
      <Route path="/income" element={
        <ProtectedRoute><AppLayout><Income /></AppLayout></ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
              },
              success: { iconTheme: { primary: '#059669', secondary: 'white' } },
              error: { iconTheme: { primary: '#dc2626', secondary: 'white' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
