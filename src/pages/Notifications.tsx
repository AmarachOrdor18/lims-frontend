import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Monitor, UserCheck, CheckCircle, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const [notifRes, alertsRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/dashboard/alerts')
      ]);
      
      const realTimeNotifs = Array.isArray(notifRes.data) ? notifRes.data : [];
      
      let dashAlerts: any[] = [];
      if (alertsRes.data && Array.isArray(alertsRes.data.data)) {
        dashAlerts = alertsRes.data.data;
      } else if (Array.isArray(alertsRes.data)) {
        dashAlerts = alertsRes.data;
      }
      
      const mappedAlerts = dashAlerts.map(alert => ({
        id: `sys-alert-${alert.laptop.id}`,
        type: 'ALERT',
        title: 'Device Retrieval Required',
        message: `${alert.employee.first_name} ${alert.employee.last_name} (${alert.employee.status}) still holds ${alert.laptop.brand} ${alert.laptop.model}.`,
        created_at: alert.assignment_date || new Date().toISOString(),
        read: false,
        metadata: { laptop_id: alert.laptop.id }
      }));
      
      setNotifications([...mappedAlerts, ...realTimeNotifs]);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`, {})));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const runScan = async () => {
    try {
      setIsScanning(true);
      const res = await api.post('/notifications/scan', {});
      toast.info(`Scan complete: Detected ${res.data.detected} issues, created ${res.data.created} new alerts.`);
      fetchNotifications();
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setIsScanning(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <div style={{ color: 'var(--warning)', background: 'var(--warning-surface)', padding: 8, borderRadius: '50%' }}><AlertTriangle size={18} /></div>;
      case 'ASSIGNMENT': return <div style={{ color: 'var(--info)', background: 'rgba(96,165,250,0.1)', padding: 8, borderRadius: '50%' }}><UserCheck size={18} /></div>;
      case 'RETURN': return <div style={{ color: 'var(--success)', background: 'var(--success-surface, rgba(34,197,94,0.1))', padding: 8, borderRadius: '50%' }}><CheckCircle size={18} /></div>;
      default: return <div style={{ color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: 8, borderRadius: '50%' }}><Monitor size={18} /></div>;
    }
  };

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="subtitle">System alerts and inventory events</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary" 
            onClick={runScan}
            disabled={isScanning}
          >
            <RefreshCw size={14} className={isScanning ? 'spin' : ''} /> 
            {isScanning ? 'Scanning...' : 'Scan for Discrepancies'}
          </button>
          <button className="btn btn-primary" onClick={markAllRead}>
            <CheckCircle size={14} /> Mark all read
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <Bell size={24} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3>All caught up</h3>
            <p>No system alerts at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div 
                key={n.id} 
                className="notification-item"
                onClick={() => !n.read && markRead(n.id)}
                style={{ 
                  display: 'flex', gap: 16, padding: '20px 24px', 
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.read ? 'transparent' : 'rgba(225,29,72,0.05)',
                  transition: 'background var(--transition-fast)',
                  cursor: 'pointer'
                }}
              >
                <div>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: n.read ? 600 : 700, color: 'var(--text-primary)', fontSize: 15 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {format(new Date(n.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  {n.metadata?.laptop_id && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/laptops/${n.metadata.laptop_id}`);
                      }}
                    >
                      View Laptop Details <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', alignSelf: 'center', flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
