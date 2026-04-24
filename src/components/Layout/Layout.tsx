import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Layout: React.FC = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid #eee', padding: '20px' }}>
        <h2>LIMS</h2>
        <nav>
          <div><a href="/dashboard">Dashboard</a></div>
          <div><a href="/laptops">Laptops</a></div>
          <div><a href="/employees">Employees</a></div>
          <div><a href="/assignments">Assignments</a></div>
          <div><a href="/settings">Settings</a></div>
        </nav>
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '12px', color: '#666' }}>Logged in as: {user?.email}</p>
          <button onClick={handleLogout} style={{ padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};
