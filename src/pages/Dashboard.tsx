import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Users,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  History,
  Plus,
  ClipboardList,
  Bell
} from 'lucide-react';
import { api } from '../api';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import type { DashboardSummary } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, recentRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/recent'),
      ]);
      if (summaryRes.data) setSummary(summaryRes.data.data || summaryRes.data);
      if (recentRes.data && Array.isArray(recentRes.data.data)) {
        setRecent(recentRes.data.data);
      } else if (Array.isArray(recentRes.data)) {
        setRecent(recentRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getPercentage = (value: number) => {
    if (!summary || summary.total === 0) return 0;
    return Math.round((value / summary.total) * 100);
  };



  if (isLoading) return <div style={{ padding: 80, textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-welcome">
        <div>
          <h1 className="dashboard-welcome-title">
            Welcome back, <span>{user?.name?.split(' ')[0] || 'Admin'}</span>
          </h1>
          <p className="dashboard-welcome-sub">System status and inventory overview for today.</p>
        </div>
        <div className="dashboard-header-right">
          <button className="dash-action-btn" onClick={() => navigate('/laptops/new')}>
            <Plus size={14} /> Register Device
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => navigate('/laptops?status=AVAILABLE&condition=FUNCTIONAL')}
          >
            <ClipboardList size={16} /> Assign Device
          </button>
        </div>
      </header>

      <div className="stat-cards-grid dashboard-stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card dashboard-stat-card">
          <div className="icon-wrap" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            <Monitor size={20} />
          </div>
          <div className="stat-value">{summary?.total || 0}</div>
          <div className="stat-label">Total Laptops</div>
          <div className="dashboard-stat-meta">All devices in inventory</div>
        </div>
        <div className="stat-card dashboard-stat-card">
          <div className="icon-wrap" style={{ background: 'var(--status-assigned-bg)', color: 'var(--status-assigned-text)' }}>
            <UserCheck size={20} />
          </div>
          <div className="stat-value">{summary?.assigned || 0}</div>
          <div className="stat-label">Assigned</div>
          <div className="dashboard-stat-meta">Currently with employees</div>
        </div>
        <div className="stat-card dashboard-stat-card">
          <div className="icon-wrap" style={{ background: 'var(--status-available-bg)', color: 'var(--status-available-text)' }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-value">{summary?.available || 0}</div>
          <div className="stat-label">Available</div>
          <div className="dashboard-stat-meta">Ready for assignment</div>
        </div>
        <div className="stat-card dashboard-stat-card">
          <div className="icon-wrap" style={{ background: 'var(--status-faulty-bg)', color: 'var(--status-faulty-text)' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="stat-value">{(summary?.faulty || 0) + (summary?.retired || 0)}</div>
          <div className="stat-label">Issues</div>
          <div className="dashboard-stat-meta">Faulty or retired</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Column 1: Recent Assignments */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <History size={16} className="text-info" />
              <h2>Recent Assignments</h2>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => navigate('/laptops?status=ASSIGNED')}
            >
              View All
            </button>
          </div>

          <div className="card" style={{ padding: '8px 16px' }}>
            <div className="recent-assignments">
              {recent.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No recent assignments found.
                </div>
              ) : (
                recent.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="recent-assignment-row"
                    onClick={() => navigate(`/laptops/${item.laptop_id}`)}
                  >
                    <div className="ra-icon">
                      <Monitor size={16} />
                    </div>
                    <div className="recent-assignment-asset">
                      <div>
                        <div className="ra-tag">{item.asset_tag || `${item.brand || ''} ${item.model || ''}`}</div>
                        <div className="ra-device">{item.brand} {item.model}</div>
                      </div>
                    </div>
                    <div className="ra-employee">
                      <div className="ra-user-avatar">
                        {item.employee_name?.charAt(0) ?? '?'}
                      </div>
                      <div className="ra-employee-name">{item.employee_name}</div>
                    </div>
                    <div className="ra-date">
                      {item.assigned_date ? format(new Date(item.assigned_date), 'MMM d') : '—'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Breakdown */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="dashboard-section-title">
              <Monitor size={16} style={{ color: 'var(--accent-green)' }} />
              <h2>Inventory Breakdown</h2>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => navigate('/notifications')}
            >
              <Bell size={12} /> Alerts
            </button>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div className="breakdown-list">
              {[
                { label: 'Assigned',  value: summary?.assigned  || 0, color: '#3b82f6' },
                { label: 'Available', value: summary?.available || 0, color: '#22c55e' },
                { label: 'Faulty',    value: summary?.faulty    || 0, color: '#f59e0b' },
                { label: 'Retired',   value: summary?.retired   || 0, color: 'var(--text-muted)' },
              ].map((item) => {
                const percent = getPercentage(item.value);
                return (
                  <div key={item.label} className="breakdown-row">
                    <div className="breakdown-label">
                      <span>{item.label}</span>
                      <span>{item.value} ({percent}%)</span>
                    </div>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="breakdown-employee-stats">
              <div className="breakdown-emp-stat">
                <Users size={14} />
                <span>{summary?.active_employees} Active Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
