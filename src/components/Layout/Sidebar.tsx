import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Users,
  Settings, ChevronRight, PanelLeftClose, PanelLeftOpen
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'mobile-show' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-main">
            <div className="sidebar-logo-icon">
              <Monitor size={18} />
            </div>
            {!isCollapsed && (
              <div className="sidebar-logo-text-wrap">
                <span className="sidebar-logo-text">Asset Desk</span>
                <span className="sidebar-logo-badge">Admin Panel</span>
              </div>
            )}
          </div>
          
          <button 
            className="sidebar-collapse-toggle hide-on-mobile"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="sidebar-section-label">Main Menu</div>}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={16} className="sidebar-link-icon" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && <ChevronRight size={13} className="sidebar-link-arrow" />}
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
              title={isCollapsed ? item.label : ''}
            >
              <item.icon size={16} className="sidebar-link-icon" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};
