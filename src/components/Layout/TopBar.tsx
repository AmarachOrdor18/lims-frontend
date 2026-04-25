import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './TopBar.css';


interface TopBarProps {
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = React.useState(() => localStorage.getItem('lims-theme') || 'dark');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lims-theme', theme);
  }, [theme]);



  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
           <Menu size={20} />
        </button>
      </div>

      <div className="topbar-right">
        {/* Theme toggle */}
        <button
          className="topbar-icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification bell */}
        <button className="topbar-icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
          <Bell size={17} />
          <span className="topbar-notif-dot" />
        </button>

        <div className="topbar-user" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="topbar-user-avatar">
              {user?.name?.charAt(0) ?? 'H'}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name ?? 'HR Admin'}</span>
              <span className="topbar-user-email">{user?.email ?? ''}</span>
            </div>
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border-subtle)' }} />
          <button 
            className="topbar-icon-btn text-danger" 
            title="Logout" 
            onClick={handleLogout}
            style={{ color: 'var(--accent-green)', opacity: 0.8 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
