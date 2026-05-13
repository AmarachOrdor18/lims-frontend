import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { api } from '../../api';
import { toast } from 'sonner';
import type { Employee, Laptop } from '../../types';

interface EmployeeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export const EmployeeAssignmentModal: React.FC<EmployeeAssignmentModalProps> = ({
  isOpen, onClose, employee, onSuccess,
}) => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [laptopId, setLaptopId] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLaptopId('');
      setNotes('');
      setSearch('');
      setError('');
      setDropdownOpen(false);
      fetchAvailableLaptops();
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [dropdownOpen]);

  const fetchAvailableLaptops = async () => {
    try {
      const res = await api.get('/laptops?status=AVAILABLE&limit=200');
      setLaptops(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load available laptops. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!employee || !laptopId) {
      setError('Please select a laptop to assign.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await api.post('/assignments', {
        laptop_id: laptopId,
        employee_id: employee.id,
        notes,
        assigned_date: new Date().toISOString(),
      });
      toast.success('Laptop assigned successfully');
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

  const filteredLaptops = laptops.filter(lp => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      lp.asset_tag.toLowerCase().includes(q) ||
      lp.brand.toLowerCase().includes(q) ||
      lp.model.toLowerCase().includes(q) ||
      lp.serial_number.toLowerCase().includes(q)
    );
  });

  const selectedLaptop = laptops.find(lp => lp.id === laptopId);

  if (!isOpen || !employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Laptop" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>

        {/* Employee info */}
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 10,
          padding: '14px 16px',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
            {employee.first_name} {employee.last_name}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {employee.department} · {employee.email}
          </p>
        </div>

        {/* Select available laptop */}
        <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="form-label">Select Available Laptop *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search by asset tag, brand or model…"
            value={search}
            onChange={e => { setSearch(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            style={{ width: '100%', marginTop: 6 }}
          />

          {/* Selected laptop pill */}
          {laptopId && selectedLaptop && !dropdownOpen && (
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
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedLaptop.asset_tag}</span>
              <span>· {selectedLaptop.brand} {selectedLaptop.model}</span>
            </div>
          )}

          {/* Dropdown */}
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
              {filteredLaptops.length === 0 ? (
                <div style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No available laptops found
                </div>
              ) : (
                filteredLaptops.map(lp => (
                  <div
                    key={lp.id}
                    onClick={() => { setLaptopId(lp.id); setDropdownOpen(false); setError(''); }}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: lp.id === laptopId ? 'var(--accent-green)' : 'var(--text-primary)',
                      background: lp.id === laptopId ? 'var(--accent-green-surface)' : 'transparent',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={ev => { if (lp.id !== laptopId) ev.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={ev => { ev.currentTarget.style.background = lp.id === laptopId ? 'var(--accent-green-surface)' : 'transparent'; }}
                  >
                    {lp.id === laptopId && <CheckCircle size={14} style={{ flexShrink: 0 }} />}
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{lp.asset_tag}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>· {lp.brand} {lp.model} · {lp.serial_number}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
            disabled={isSubmitting || !laptopId}
          >
            {isSubmitting
              ? <span className="spinner" style={{ width: 16, height: 16 }} />
              : <><CheckCircle size={14} /> Assign</>
            }
          </button>
        </div>
      </div>
    </Modal>
  );
};
