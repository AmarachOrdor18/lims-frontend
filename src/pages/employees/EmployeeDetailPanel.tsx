import React, { useState, useEffect } from 'react';
import {
  Mail, Building2, Clock, Edit, UserX, UserCheck,
} from 'lucide-react';
import { SlidePanel } from '../../components/UI/SlidePanel';
import { ConfirmModal } from '../../components/UI/ConfirmModal';
import { Badge } from '../../components/UI/Badge';
import { api } from '../../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Employee, Laptop } from '../../types';

interface EmployeeDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  onDataChange: () => void;
  onOpenEditForm?: (employeeId: string) => void;
  onOpenLaptopDetail?: (laptopId: string) => void;
}

export const EmployeeDetailPanel: React.FC<EmployeeDetailPanelProps> = ({
  isOpen, onClose, employeeId, onDataChange, onOpenEditForm, onOpenLaptopDetail,
}) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [assignedLaptop, setAssignedLaptop] = useState<Laptop | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmInactive, setConfirmInactive] = useState(false);
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchData();
    }
  }, [isOpen, employeeId]);

  const fetchData = async () => {
    if (!employeeId) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/employees/${employeeId}`);
      setEmployee(data);

      // Fetch active assignment/laptop
      const asn = data.assignments?.find((a: any) => !a.returned_date);
      if (asn) {
        const { data: laptopData } = await api.get(`/laptops/${asn.laptop_id}`);
        setAssignedLaptop(laptopData);
      } else {
        setAssignedLaptop(null);
      }

      // Fetch history
      try {
        const { data: historyData } = await api.get(`/assignments?employee_id=${employeeId}`);
        setHistory(historyData);
      } catch {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to fetch employee details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'ACTIVE' | 'INACTIVE') => {
    if (!employeeId) return;
    if (newStatus === 'INACTIVE') {
      setConfirmInactive(true);
      return;
    }
    
    await performStatusUpdate(newStatus);
  };

  const performStatusUpdate = async (status: 'ACTIVE' | 'INACTIVE') => {
    try {
      setIsActing(true);
      await api.patch(`/employees/${employeeId}/status`, { status });
      toast.success(`Employee marked as ${status.toLowerCase()}`);
      setConfirmInactive(false);
      fetchData();
      onDataChange();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? 'Failed to update employee status');
    } finally {
      setIsActing(false);
    }
  };

  if (!isOpen) return null;

  const fullName = employee ? `${employee.first_name} ${employee.last_name}` : '';
  const initials = employee
    ? `${employee.first_name?.charAt(0) ?? ''}${employee.last_name?.charAt(0) ?? ''}`
    : '';

  return (
    <>
      <SlidePanel isOpen={isOpen} onClose={onClose} title="Employee Details">
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner mx-auto" />
          </div>
        ) : employee ? (
          <>
            {/* Employee Header */}
            <div className="sp-employee-header">
              <div className="sp-employee-avatar">{initials}</div>
              <div>
                <div className="sp-employee-name">{fullName}</div>
                <Badge status={employee.status} />
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: 16 }}>
              <div className="sp-contact-item">
                <Mail size={15} />
                {employee.email}
              </div>
              <div className="sp-contact-item">
                <Building2 size={15} />
                {employee.department}
              </div>
            </div>

            {/* Mark Active/Inactive */}
            {employee.status === 'ACTIVE' ? (
              <button
                className="sp-action-btn-full"
                onClick={() => handleUpdateStatus('INACTIVE')}
              >
                <UserX size={14} /> Mark as Inactive
              </button>
            ) : (
              <button
                className="sp-action-btn-full"
                onClick={() => handleUpdateStatus('ACTIVE')}
              >
                <UserCheck size={14} /> Reactivate
              </button>
            )}

            {/* Current Device */}
            <div className="sp-section-title">CURRENT DEVICE</div>

            {assignedLaptop ? (
              <div
                className="sp-device-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (onOpenLaptopDetail) {
                    onClose();
                    onOpenLaptopDetail(assignedLaptop.id);
                  }
                }}
              >
                <div className="sp-device-card-header">
                  <div className="sp-device-card-tag">{assignedLaptop.asset_tag}</div>
                  <Badge status={assignedLaptop.status} />
                </div>
                <div className="sp-device-card-name">
                  {assignedLaptop.brand} {assignedLaptop.model}
                </div>
              </div>
            ) : (
              <div className="sp-empty-assignment">
                <p>No device currently assigned</p>
              </div>
            )}

            {/* Device History */}
            <div className="sp-section-title" style={{ marginTop: 20 }}>
              <Clock size={13} />
              DEVICE HISTORY
            </div>

            {history.length === 0 ? (
              <div className="sp-empty-assignment">
                <p>No device history</p>
              </div>
            ) : (
              history.map((a: any) => (
                <div className="sp-device-card" key={a.id}>
                  <div className="sp-device-card-header">
                    <div className="sp-device-card-tag">{a.laptop?.asset_tag ?? '—'}</div>
                    {!a.returned_date ? (
                      <Badge status="ASSIGNED" />
                    ) : (
                      <span className="badge badge-inactive">
                        <span className="badge-dot" />Returned
                      </span>
                    )}
                  </div>
                  <div className="sp-device-card-name">
                    {a.laptop?.brand} {a.laptop?.model}
                  </div>
                  <div className="sp-device-card-dates">
                    {format(new Date(a.assigned_date), 'MMM d, yyyy')}
                    {' → '}
                    {a.returned_date
                      ? format(new Date(a.returned_date), 'MMM d, yyyy')
                      : 'Present'}
                  </div>
                </div>
              ))
            )}

            {/* Edit Employee Button */}
            <button
              className="sp-action-btn-full"
              style={{ marginTop: 16 }}
              onClick={() => {
                if (onOpenEditForm && employeeId) {
                  onClose();
                  onOpenEditForm(employeeId);
                }
              }}
            >
              <Edit size={14} /> Edit Employee
            </button>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Employee not found
          </div>
        )}
      </SlidePanel>

      <ConfirmModal
        isOpen={confirmInactive}
        onClose={() => setConfirmInactive(false)}
        onConfirm={() => performStatusUpdate('INACTIVE')}
        title="Mark as Inactive"
        message={
          <>
            Are you sure you want to mark <strong>{employee?.first_name} {employee?.last_name}</strong> as inactive?
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
    </>
  );
};
