import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/callback', { email, password });
      login(res.user, res.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background grid */}
      <div className="login-bg-grid" aria-hidden="true" />
      
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Monitor size={24} />
          </div>
          <div>
            <div className="login-brand-name">LIMS</div>
            <div className="login-brand-sub">Laptop Inventory System</div>
          </div>
        </div>

        <div className="login-hero">
            <h1 className="login-heading">
            Manage your company<br />
            <span className="login-heading-accent">assets</span><br />
            in one place.
          </h1>
          <p className="login-description">
            A secure, centralized platform for HR teams to track devices, assignments, and the complete audit trail.
          </p>
        </div>

        <div className="login-features">
          {[
            { icon: Shield, text: 'Active Directory authentication' },
            { icon: Lock,   text: 'HR-only access control' },
          ].map((f, i) => (
            <div key={i} className="login-feature">
              <f.icon size={14} />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-mobile-brand" aria-hidden="false">
          <div className="login-brand-icon">
            <Monitor size={20} />
          </div>
          <div className="login-mobile-brand-text">
            <div className="login-brand-name">LIMS</div>
            <div className="login-brand-sub">Laptop Inventory System</div>
          </div>
        </div>
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign in</h2>
            <p>Use your company AD credentials</p>
          </div>

          <form id="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@qucoon.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ width: '100%', paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <Shield size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>


        </div>

        <p className="login-footer">
          © 2026 LIMS — Internal HR Tool. All rights reserved.
        </p>
      </div>
    </div>
  );
};
