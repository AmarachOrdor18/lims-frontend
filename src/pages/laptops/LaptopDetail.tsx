import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, Monitor, Calendar, Tag, Hash,
  User, Clock, RotateCcw, AlertTriangle, CheckCircle,
  Archive, UserCheck, ChevronRight, Activity
} from 'lucide-react';
import { Badge } from '../../components/UI/Badge';
import { api } from '../../api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AssetAssignmentModal } from '../../components/Modals/AssetAssignmentModal';
import type { Laptop, Employee } from '../../types';
import '../detail.css';

export const LaptopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [currentAssignee, setCurrentAssignee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchLaptopData();
  }, [id]);

  const fetchLaptopData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/laptops/${id}`);
      setLaptop(data);

      // Current assignee
      const activeAsn = data.assignments?.find((a: any) => !a.returned_date);
      if (activeAsn) {
        const { data: empData } = await api.get(`/employees/${activeAsn.employee_id}`);
        setCurrentAssignee(empData);
      } else {
        setCurrentAssignee(null);
      }

      // History
      const { data: historyData } = await api.get(`/assignments/history/${id}`);
      setHistory(historyData);
    } catch (e) {
      console.error('Failed to fetch laptop details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      if (status === 'RETIRED' && !window.confirm('Are you sure you want to archive this system? It will be removed from active inventory.')) return;
      
      await api.patch(`/laptops/${id}/status`, { 
        status,
        ...(status === 'RETIRED' ? { condition: 'RETIRED' } : {})
      });
      
      toast.success(status === 'RETIRED' ? 'System archived successfully' : 'Status updated');
      fetchLaptopData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateCondition = async (condition: string) => {
    try {
      await api.patch(`/laptops/${id}/status`, { condition });
      toast.success('Condition updated');
      fetchLaptopData();
    } catch (e) {
      toast.error('Failed to update condition');
    }
  };


  if (isLoading) return <div style={{ padding: 80, textAlign: 'center' }}><div className="spinner mx-auto" /></div>;

  if (!laptop) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <h3>Laptop not found</h3>
      <button className="btn btn-secondary" onClick={() => navigate('/laptops')}>
        <ArrowLeft size={14} /> Back to Laptops
      </button>
    </div>
  );

  return (
    <div className="laptop-detail">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/laptops')}>
            <ArrowLeft size={16} />
          </button>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'rgba(96,165,250,0.1)', color: '#60a5fa',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Monitor size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: 20, marginBottom: 4 }}>{laptop.asset_tag}</h1>
            <p className="subtitle" style={{ marginBottom: 8 }}>{laptop.brand} {laptop.model}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge status={laptop.status} />
              <Badge status={laptop.condition} />
            </div>
          </div>
        </div>

        <div className="detail-buttons-group">
          {/* Row 1: Primary Actions */}
          {laptop.status === 'AVAILABLE' && (
            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
              <UserCheck size={14} /> Assign Staff
            </button>
          )}
          {laptop.status === 'ASSIGNED' && (
            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
              <UserCheck size={14} /> Reassign
            </button>
          )}
          
          {laptop.condition === 'FUNCTIONAL' ? (
            <button className="btn btn-warning" onClick={() => handleUpdateCondition('FAULTY')}>
              <AlertTriangle size={14} /> Mark Faulty
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => handleUpdateCondition('FUNCTIONAL')}>
              <CheckCircle size={14} /> Mark Functional
            </button>
          )}

          {/* Row 2: Secondary Actions */}
          {laptop.status === 'ASSIGNED' && (
            <button className="btn btn-secondary" onClick={() => handleUpdateStatus('AVAILABLE')} title="Unassign from staff">
              <RotateCcw size={14} /> Unassign
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(`/laptops/${id}/edit`)}>
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      <div className="detail-cols-grid">
        {/* Device Info Card */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="detail-hero">
            <div className="detail-hero-icon" style={{ borderRadius: 'var(--radius-md)' }}>
              <Monitor size={32} />
            </div>
            <div>
              <div className="detail-hero-title">{laptop.brand} {laptop.model}</div>
              <div className="detail-hero-subtitle">Serial: <span style={{ color: 'var(--text-primary)' }}>{laptop.serial_number}</span></div>
            </div>
          </div>

          <div className="spec-list">
            <div className="spec-item">
              <div className="spec-item-label"><Tag size={15} /> Asset Tag</div>
              <div className="spec-item-value">{laptop.asset_tag}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Hash size={15} /> Serial Number</div>
              <div className="spec-item-value">{laptop.serial_number}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Calendar size={15} /> Purchase Date</div>
              <div className="spec-item-value">{laptop.purchase_date ? format(new Date(laptop.purchase_date), 'd MMMM yyyy') : 'Not specified'}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Activity size={15} /> Added to System</div>
              <div className="spec-item-value">{format(new Date(laptop.created_at), 'd MMMM yyyy')}</div>
            </div>
          </div>

          {laptop.status !== 'RETIRED' && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleUpdateStatus('RETIRED')}
              >
                <Archive size={14} style={{ marginRight: 6 }} /> Archive System
              </button>
            </div>
          )}
        </div>

        {/* Current Assignee Card */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Current Assignee</h3>
          {currentAssignee ? (
            <div className="assignee-card" onClick={() => navigate(`/employees/${currentAssignee.id}`)}>
              <div className="assignee-avatar">{(currentAssignee.first_name + " " + currentAssignee.last_name).charAt(0)}</div>
              <div className="assignee-info">
                <div className="assignee-name">{currentAssignee.first_name} {currentAssignee.last_name}</div>
                <div className="assignee-email">{currentAssignee.email}</div>
                <div className="assignee-department">{currentAssignee.department}</div>
              </div>
              <Badge status={currentAssignee.status} />
              <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-icon"><User size={20} /></div>
              <h3 style={{ fontSize: 13 }}>In Inventory</h3>
              <p style={{ fontSize: 12 }}>Device is currently unassigned.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ownership History (Table Version) */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
          Ownership History ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <div className="empty-icon"><Clock size={24} /></div>
            <h3 style={{ fontSize: 13 }}>Initial Inventory</h3>
            <p style={{ fontSize: 12 }}>This device has no past assignments recorded.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Assigned Date</th>
                <th>Returned Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record.id} onClick={() => record.employee && navigate(`/employees/${record.employee.id}`)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="ra-user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {record.employee ? (record.employee.first_name + " " + record.employee.last_name).charAt(0) : '?'}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="text-secondary text-sm">
                    {record.employee?.department ?? '—'}
                  </td>
                  <td className="text-secondary text-sm">
                    {format(new Date(record.assigned_date), 'd MMM yyyy')}
                  </td>
                  <td className="text-secondary text-sm">
                    {record.returned_date ? format(new Date(record.returned_date), 'd MMM yyyy') : '—'}
                  </td>
                  <td>
                    {!record.returned_date
                      ? <span className="badge badge-assigned"><span className="badge-dot" />Current</span>
                      : <span className="badge badge-inactive"><span className="badge-dot" />Returned</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AssetAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        laptop={laptop}
        onSuccess={fetchLaptopData}
      />
    </div>
  );
};