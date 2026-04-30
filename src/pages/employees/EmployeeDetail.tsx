import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Mail, Building2, Calendar,
  Monitor, UserX, UserCheck, User, Briefcase, MapPin, Globe
} from 'lucide-react';
import { Badge } from '../../components/UI/Badge';
import { ConfirmModal } from '../../components/UI/ConfirmModal';
import { api } from '../../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Employee, Laptop } from '../../types';
import '../detail.css';

export const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignedLaptop, setAssignedLaptop] = useState<Laptop | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmInactive, setConfirmInactive] = useState(false);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/employees/${id}`);
      setEmployee(data);

      // Fetch active assignment/laptop if any
      // In the backend, we joined assignments, so let's check if they exist
      const asn = data.assignments?.find((a: any) => !a.returned_date);
      if (asn) {
        // Fetch laptop details for the assignment
        const { data: laptopData } = await api.get(`/laptops/${asn.laptop_id}`);
        setAssignedLaptop(laptopData);
      } else {
        setAssignedLaptop(null);
      }

      // Fetch history
      const { data: historyData } = await api.get(`/assignments?employee_id=${id}`);
      setHistory(historyData);
    } catch (e) {
      console.error('Failed to fetch employee details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    if (newStatus === 'INACTIVE') {
      setConfirmInactive(true);
      return;
    }
    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (status: 'ACTIVE' | 'INACTIVE') => {
    try {
      setIsActing(true);
      await api.patch(`/employees/${id}/status`, { status });
      toast.success(`Employee marked as ${status.toLowerCase()}`);
      setConfirmInactive(false);
      fetchEmployeeData();
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) return <div style={{ padding: 80, textAlign: 'center' }}>Loading details...</div>;

  if (!employee) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <h3>Employee not found</h3>
      <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
        <ArrowLeft size={14} /> Back to Employees
      </button>
    </div>
  );

  const fullName = `${employee.first_name} ${employee.last_name}`;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/employees')}>
            <ArrowLeft size={16} />
          </button>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: employee.status === 'ACTIVE' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(156,163,175,0.1)',
            color: employee.status === 'ACTIVE' ? 'var(--accent-green)' : 'var(--text-muted)',
            fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {fullName.charAt(0)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: 20, marginBottom: 4 }}>{fullName}</h1>
            <p className="subtitle" style={{ marginBottom: 8 }}>{employee.job_title} • {employee.department}</p>
            <div>
              <Badge status={employee.status} />
            </div>
          </div>
        </div>

        <div className="detail-buttons-group">
          {employee.status === 'ACTIVE' ? (
            <button id="mark-inactive-btn" className="btn btn-danger" onClick={() => handleUpdateStatus('INACTIVE')}>
              <UserX size={14} /> Mark Inactive
            </button>
          ) : (
            <button id="mark-active-btn" className="btn btn-success" onClick={() => handleUpdateStatus('ACTIVE')}>
              <UserCheck size={14} /> Reactivate
            </button>
          )}
          <button
            id="edit-employee-btn"
            className="btn btn-secondary"
            onClick={() => navigate(`/employees/${id}/edit`)}
          >
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      <div className="detail-cols-grid">
        <div className="card" style={{ padding: '32px' }}>
          <div className="detail-hero">
            <div className="detail-hero-icon" style={{ borderRadius: '50%' }}>
              <User size={32} />
            </div>
            <div>
              <div className="detail-hero-title">{fullName}</div>
              <div className="detail-hero-subtitle">{employee.job_title} at {employee.entity}</div>
            </div>
          </div>

          <div className="spec-list">
            <div className="spec-item">
              <div className="spec-item-label"><Mail size={15} /> Email</div>
              <div className="spec-item-value">{employee.email}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Building2 size={15} /> Department</div>
              <div className="spec-item-value">{employee.department}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Briefcase size={15} /> Staff Type</div>
              <div className="spec-item-value">{employee.staff_type} ({employee.seniority})</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><MapPin size={15} /> Location</div>
              <div className="spec-item-value">{employee.location}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Globe size={15} /> Entity</div>
              <div className="spec-item-value">{employee.entity}</div>
            </div>
            <div className="spec-item">
              <div className="spec-item-label"><Calendar size={15} /> Joined</div>
              <div className="spec-item-value">{format(new Date(employee.created_at), 'd MMMM yyyy')}</div>
            </div>
          </div>
        </div>

        {/* Current Laptop */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Assigned Laptop</h3>
          {assignedLaptop ? (
            <div
              className="assignee-card"
              onClick={() => navigate(`/laptops/${assignedLaptop.id}`)}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: 'rgba(96,165,250,0.1)', color: '#60a5fa',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Monitor size={18} />
              </div>
              <div className="assignee-info">
                <div className="assignee-name">{assignedLaptop.asset_tag}</div>
                <div className="assignee-email">{assignedLaptop.brand} {assignedLaptop.model}</div>
                <div className="assignee-department" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                  {assignedLaptop.serial_number}
                </div>
              </div>
              <Badge status={assignedLaptop.status} />
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '28px 12px' }}>
              <div className="empty-icon"><Monitor size={18} /></div>
              <h3 style={{ fontSize: 13 }}>No laptop assigned</h3>
              <p style={{ fontSize: 12 }}>This employee currently has no device.</p>
            </div>
          )}
        </div>
      </div>

      {/* Assignment History */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
          Assignment History ({history.length})
        </h3>
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-icon"><Monitor size={18} /></div>
            <h3 style={{ fontSize: 13 }}>No assignments yet</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Device</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(a => (
                <tr key={a.id} onClick={() => a.laptop && navigate(`/laptops/${a.laptop.id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                    {a.laptop?.asset_tag ?? '—'}
                  </td>
                  <td className="text-secondary text-sm">
                    {a.laptop?.brand} {a.laptop?.model}
                  </td>
                  <td className="text-secondary text-sm">
                    {format(new Date(a.assigned_date), 'd MMM yyyy')}
                  </td>
                  <td className="text-secondary text-sm">
                    {a.returned_date ? format(new Date(a.returned_date), 'd MMM yyyy') : '—'}
                  </td>
                  <td>
                    {!a.returned_date
                      ? <span className="badge badge-assigned"><span className="badge-dot"/>Current</span>
                      : <span className="badge badge-inactive"><span className="badge-dot"/>Returned</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmInactive}
        onClose={() => setConfirmInactive(false)}
        onConfirm={() => performStatusUpdate('INACTIVE')}
        title="Mark as Inactive"
        message={
          <>
            Are you sure you want to mark <strong>{fullName}</strong> as inactive?
            {assignedLaptop && (
              <div style={{ marginTop: 12, padding: 10, background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', borderRadius: 4, color: '#f59e0b', fontSize: 13 }}>
                <strong>Note:</strong> This employee still has <strong>{assignedLaptop.asset_tag}</strong> assigned.
              </div>
            )}
          </>
        }
        confirmLabel="Yes, Mark Inactive"
        variant="warning"
        isLoading={isActing}
      />
    </div>
  );
};
