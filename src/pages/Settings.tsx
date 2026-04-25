import React, { useState } from 'react';
import { User, Bell, Shield, Key, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={15} style={{ marginRight: 6 }} /> Profile
        </button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <Shield size={15} style={{ marginRight: 6 }} /> Security
        </button>
        <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
          <Bell size={15} style={{ marginRight: 6 }} /> Notifications
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile Information</h3>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" defaultValue={user?.name ?? ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" defaultValue={user?.email ?? ''} disabled style={{ opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Email cannot be changed directly. Contact IT.</span>
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-input" defaultValue="Administrator" disabled style={{ opacity: 0.7 }} />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 10 }}>Update Profile</button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" placeholder="Enter current password" />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Create new password" />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" placeholder="Confirm new password" />
          </div>
          <button className="btn btn-primary" style={{ marginTop: 10 }}><Key size={14} /> Update Password</button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Email Alerts</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Receive email when devices become faulty</div>
              </div>
              <button className="btn btn-primary btn-sm"><Check size={14} /> Enabled</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>New Assignments</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Alert when laptops are assigned or returned</div>
              </div>
              <button className="btn btn-primary btn-sm"><Check size={14} /> Enabled</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Weekly Digest</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Receive a weekly summary of HR laptop inventory</div>
              </div>
              <button className="btn btn-secondary btn-sm">Disabled</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
