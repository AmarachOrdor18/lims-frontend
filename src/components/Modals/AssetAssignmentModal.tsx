import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { api } from '../../api';
import { toast } from 'sonner';
import type { Laptop, Employee } from '../../types';

interface AssetAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  laptop: Laptop | null;
  onSuccess: () => void;
}

export const AssetAssignmentModal: React.FC<AssetAssignmentModalProps> = ({
  isOpen,
  onClose,
  laptop,
  onSuccess
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setNotes('');
      setSearch('');
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?status=ACTIVE');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Failed to fetch employees', e);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!laptop || !employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (laptop.status === 'RETIRED') {
      toast.error('Retired laptops cannot be assigned');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const payload = {
        laptop_id: laptop.id,
        notes,
        assigned_date: new Date().toISOString()
      };

      if (laptop.status === 'ASSIGNED') {
        // Reassign
        await api.post('/assignments/reassign', {
          ...payload,
          new_employee_id: employeeId
        });
      } else {
        // New Assignment
        await api.post('/assignments', {
          ...payload,
          employee_id: employeeId
        });
        await api.patch(`/laptops/${laptop.id}/status`, { status: 'ASSIGNED' });
      }
      toast.success(isReassign ? 'Laptop reassigned successfully' : 'Laptop assigned successfully');
      onSuccess();
      onClose();
    } catch (e) {
      toast.error('Failed to process assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEmps = employees.filter(e => {
    const name = `${e.first_name} ${e.last_name}`.toLowerCase();
    const q = search.toLowerCase();
    return !q || name.includes(q) || (e.email || '').toLowerCase().includes(q) || (e.department || '').toLowerCase().includes(q);
  });

  const isReassign = laptop?.status === 'ASSIGNED';
  
  // Find current assignee name for reassign warning
  const currentAssigneeName = (() => {
    if (!isReassign || !laptop) return null;
    const activeAsn = (laptop as any).assignments?.find((a: any) => !a.returned_date);
    if (!activeAsn) return 'a user';
    // This requires the employee to be populated in the assignment, or we use a fallback
    return activeAsn.employee ? `${activeAsn.employee.first_name} ${activeAsn.employee.last_name}` : 'the current user';
  })();

  if (!isOpen || !laptop) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReassign ? 'Reassign Laptop' : 'Assign Laptop'}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '8px' }}>
        
        <div style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '4px', color: 'var(--text-primary)' }}>{laptop.asset_tag}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{laptop.brand} {laptop.model}</p>
        </div>

        {laptop.status === 'RETIRED' && (
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '14px 16px', color: 'var(--danger)', fontSize: '13px', lineHeight: '1.5' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>This laptop is retired and cannot be assigned or reassigned.</span>
          </div>
        )}

        {isReassign && (
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px 16px', color: '#f59e0b', fontSize: '13px', lineHeight: '1.5' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Currently assigned to <strong style={{ fontWeight: 600 }}>{currentAssigneeName}</strong>. Reassigning will automatically return this device.</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '8px' }}>Search Employee</label>
          <input
            type="text"
            className="form-input"
            placeholder="Name, email, or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '8px' }}>Select Employee *</label>
          <select 
            className="form-input" 
            value={employeeId} 
            onChange={e => setEmployeeId(e.target.value)}
            style={{ width: '100%', appearance: 'auto', paddingRight: '12px' }}
          >
            <option value="" disabled>Choose an employee…</option>
            {filteredEmps.map(e => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name} · {e.department || 'No dept'}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '8px' }}>Notes</label>
          <textarea
            className="form-input"
            placeholder="Optional notes…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ width: '100%', height: '80px', padding: '12px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button
            className="btn btn-secondary flex-1"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ justifyContent: 'center' }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleConfirmAssignment}
            disabled={isSubmitting || !employeeId || laptop.status === 'RETIRED'}
            style={{ justifyContent: 'center' }}
          >
            {isSubmitting ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : (
              isReassign ? 'Reassign' : 'Assign'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
