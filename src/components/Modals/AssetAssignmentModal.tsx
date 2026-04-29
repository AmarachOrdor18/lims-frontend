import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { ConfirmModal } from '../UI/ConfirmModal';
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
  isOpen, onClose, laptop, onSuccess,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Warning state — when selected employee already has a laptop
  const [showDoubleAssignWarning, setShowDoubleAssignWarning] = useState(false);
  const [selectedEmpHasLaptop, setSelectedEmpHasLaptop] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setNotes('');
      setSearch('');
      setError('');
      setSelectedEmpHasLaptop(null);
      setDropdownOpen(false);
      fetchEmployees();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?status=ACTIVE&limit=100');
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load employees. Please try again.');
    }
  };

  // When employee is selected, check if they already have a laptop
  const handleSelectEmployee = (id: string) => {
    setEmployeeId(id);
    setError('');
    if (!id) { setSelectedEmpHasLaptop(null); return; }
    const emp = employees.find(e => e.id === id) as any;
    if (emp?.assigned_asset_tag) {
      setSelectedEmpHasLaptop(emp.assigned_asset_tag);
    } else {
      setSelectedEmpHasLaptop(null);
    }
  };

  const handleSubmit = () => {
    if (!laptop || !employeeId) {
      setError('Please select an employee to assign this laptop to.');
      return;
    }
    if (laptop.status === 'RETIRED') {
      setError('Retired laptops cannot be assigned.');
      return;
    }
    // If employee already has a laptop, show warning first
    if (selectedEmpHasLaptop) {
      setShowDoubleAssignWarning(true);
      return;
    }
    processAssignment();
  };

  const processAssignment = async () => {
    if (!laptop || !employeeId) return;
    try {
      setIsSubmitting(true);
      setError('');

      const payload = { notes, assigned_date: new Date().toISOString() };

      if (laptop.status === 'ASSIGNED') {
        await api.post('/assignments/reassign', {
          ...payload,
          laptop_id: laptop.id,
          new_employee_id: employeeId,
        });
        toast.success('Laptop reassigned successfully');
      } else {
        await api.post('/assignments', {
          ...payload,
          laptop_id: laptop.id,
          employee_id: employeeId,
        });
        toast.success('Laptop assigned successfully');
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      const msg = (() => {
        try {
          const parsed = typeof e.message === 'string' ? JSON.parse(e.message) : e.message;
          return parsed?.error ?? e.message;
        } catch {
          return e.message ?? 'Failed to process assignment. Please try again.';
        }
      })();
      setError(msg);
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
  const selectedEmp = employees.find(e => e.id === employeeId);

  if (!isOpen || !laptop) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isReassign ? 'Reassign Laptop' : 'Assign Laptop'}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>

          {/* Laptop Info */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', marginBottom: 2 }}>
              {laptop.asset_tag}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {laptop.brand} {laptop.model} · {laptop.serial_number}
            </p>
          </div>

          {/* Retired warning */}
          {laptop.status === 'RETIRED' && (
            <div className="error-alert error">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="error-alert-title">Cannot Assign</div>
                <div className="error-alert-body">This laptop is retired and cannot be assigned or reassigned.</div>
              </div>
            </div>
          )}

          {/* Reassign warning */}
          {isReassign && (
            <div className="error-alert warning">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="error-alert-title">Currently Assigned</div>
                <div className="error-alert-body">
                  This laptop is assigned to <strong>{(laptop as any).assigned_to_name ?? 'someone'}</strong>.
                  Reassigning will automatically close the current assignment.
                </div>
              </div>
            </div>
          )}

          {/* Select Employee */}
          <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <label className="form-label">Select Employee *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email or department…"
              value={search}
              onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              style={{ width: '100%', marginTop: 6 }}
              disabled={laptop.status === 'RETIRED'}
            />

            {/* Selected employee display */}
            {employeeId && selectedEmp && !dropdownOpen && (
              <div style={{
                marginTop: 8,
                padding: '10px 14px',
                background: 'var(--accent-green-surface)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <CheckCircle size={14} />
                {selectedEmp.first_name} {selectedEmp.last_name} · {selectedEmp.department || 'No dept'}
                {(selectedEmp as any).assigned_asset_tag ? ` · has ${(selectedEmp as any).assigned_asset_tag}` : ''}
              </div>
            )}

            {/* Custom dropdown list */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                maxHeight: 200,
                overflowY: 'auto',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                zIndex: 10,
                marginTop: 4,
              }}>
                {filteredEmps.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    No employees found
                  </div>
                ) : (
                  filteredEmps.map(e => (
                    <div
                      key={e.id}
                      onClick={() => { handleSelectEmployee(e.id); setDropdownOpen(false); }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: e.id === employeeId ? 'var(--accent-green)' : 'var(--text-primary)',
                        background: e.id === employeeId ? 'var(--accent-green-surface)' : 'transparent',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={(ev) => { if (e.id !== employeeId) ev.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.background = e.id === employeeId ? 'var(--accent-green-surface)' : 'transparent'; }}
                    >
                      {e.id === employeeId && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
                      <span>
                        {e.first_name} {e.last_name} · {e.department || 'No dept'}
                        {(e as any).assigned_asset_tag ? ` · has ${(e as any).assigned_asset_tag}` : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Warning: selected employee already has a laptop */}
          {selectedEmpHasLaptop && (
            <div className="error-alert warning">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="error-alert-title">Employee Already Has a Laptop</div>
                <div className="error-alert-body">
                  <strong>{selectedEmp?.first_name} {selectedEmp?.last_name}</strong> currently has{' '}
                  <strong>{selectedEmpHasLaptop}</strong> assigned.
                  Proceeding will not return their current laptop automatically — please handle that separately.
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-input"
              placeholder="Add any notes about this assignment…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', height: 80, resize: 'vertical', marginTop: 6 }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-alert error">
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="error-alert-title">Assignment Failed</div>
                <div className="error-alert-body">{error}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleSubmit}
              disabled={isSubmitting || !employeeId || laptop.status === 'RETIRED'}
            >
              {isSubmitting
                ? <span className="spinner" style={{ width: 16, height: 16 }} />
                : <><CheckCircle size={14} /> {isReassign ? 'Reassign' : 'Assign'}</>
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* Double-assign confirmation */}
      <ConfirmModal
        isOpen={showDoubleAssignWarning}
        onClose={() => setShowDoubleAssignWarning(false)}
        onConfirm={() => { setShowDoubleAssignWarning(false); processAssignment(); }}
        title="Employee Already Has a Laptop"
        message={`${selectedEmp?.first_name} ${selectedEmp?.last_name} already has ${selectedEmpHasLaptop} assigned. Are you sure you want to assign another laptop to them?`}
        confirmLabel="Yes, Assign Anyway"
        cancelLabel="Cancel"
        variant="warning"
        isLoading={isSubmitting}
      />
    </>
  );
};
