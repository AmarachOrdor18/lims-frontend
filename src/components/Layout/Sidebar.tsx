import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Users,
  Settings, ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/laptops',     icon: Monitor,         label: 'Laptops' },
  { to: '/employees',   icon: Users,           label: 'People' },
];

const bottomItems = [
  { to: '/settings', icon: Settings,  label: 'Settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {


  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'mobile-show' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Monitor size={18} />
          </div>
          <div>
            <span className="sidebar-logo-text">LIMS</span>
            <span className="sidebar-logo-badge">HR Tool</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <item.icon size={16} className="sidebar-link-icon" />
              <span>{item.label}</span>
              <ChevronRight size={13} className="sidebar-link-arrow" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <item.icon size={16} className="sidebar-link-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};
