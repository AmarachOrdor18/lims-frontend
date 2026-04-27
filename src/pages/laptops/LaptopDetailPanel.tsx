import React, { useState, useEffect } from 'react';
import {
  Clock, MessageSquare, Edit, UserCheck, RotateCcw, Archive, AlertTriangle,
} from 'lucide-react';
import { SlidePanel } from '../../components/UI/SlidePanel';
import { ConfirmModal } from '../../components/UI/ConfirmModal';
import { Badge } from '../../components/UI/Badge';
import { AssetAssignmentModal } from '../../components/Modals/AssetAssignmentModal';
import { api } from '../../api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Laptop, Employee } from '../../types';

interface LaptopDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  laptopId: string | null;
  onDataChange: () => void;
  onOpenEditForm?: (laptopId: string) => void;
}

export const LaptopDetailPanel: React.FC<LaptopDetailPanelProps> = ({
  isOpen, onClose, laptopId, onDataChange, onOpenEditForm,
}) => {
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [currentAssignee, setCurrentAssignee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Confirm modals
  const [confirmReturn, setConfirmReturn]   = useState(false);
  const [confirmRetire, setConfirmRetire]   = useState(false);
  const [confirmFaulty, setConfirmFaulty]   = useState(false);
  const [isActing, setIsActing]             = useState(false);

  useEffect(() => {
    if (isOpen && laptopId) fetchData();
  }, [isOpen, laptopId]);

  const fetchData = async () => {
    if (!laptopId) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/laptops/${laptopId}`);
      setLaptop(data);

      // Current assignee from flat fields
      if (data.assigned_to_id) {
        setCurrentAssignee({
          id: data.assigned_to_id,
          first_name: data.assigned_to_name?.split(' ')[0] ?? '',
          last_name: data.assigned_to_name?.split(' ').slice(1).join(' ') ?? '',
          email: data.assigned_to_email ?? '',
          department: data.assigned_to_department ?? '',
        } as Employee);
      } else {
        setCurrentAssignee(null);
      }

      // History
      try {
        const histRes = await api.get(`/assignments/history/${laptopId}`);
        setHistory(Array.isArray(histRes) ? histRes : histRes.data ?? []);
      } catch {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to fetch laptop details', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!laptopId || !currentAssignee) return;
    try {
      setIsActing(true);
      // Find active assignment id from history
      const active = history.find((h: any) => !h.returned_date);
      if (active) {
        await api.patch(`/assignments/${active.id}/return`, {});
      }
      toast.success('Device returned successfully');
      setConfirmReturn(false);
      fetchData();
      onDataChange();
    } catch (e: any) {
      toast.error(e.message || 'Failed to return device');
    } finally {
      setIsActing(false);
    }
  };

  const handleRetire = async () => {
    if (!laptopId) return;
    try {
      setIsActing(true);
      await api.patch(`/laptops/${laptopId}/status`, { status: 'RETIRED' });
      toast.success('Laptop archived successfully');
      setConfirmRetire(false);
      fetchData();
      onDataChange();
    } catch (e: any) {
      toast.error(e.message || 'Failed to retire laptop');
    } finally {
      setIsActing(false);
    }
  };

  const handleMarkFaulty = async () => {
    if (!laptopId) return;
    try {
      setIsActing(true);
      const newCondition = laptop?.condition === 'FAULTY' ? 'FUNCTIONAL' : 'FAULTY';
      await api.patch(`/laptops/${laptopId}/status`, { condition: newCondition });
      toast.success(`Laptop marked as ${newCondition.toLowerCase()}`);
      setConfirmFaulty(false);
      fetchData();
      onDataChange();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update condition');
    } finally {
      setIsActing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <SlidePanel isOpen={isOpen} onClose={onClose} title="Device Details">
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner mx-auto" />
          </div>
        ) : laptop ? (
          <>
            {/* Device Header */}
            <div className="sp-device-header">
              <div className="sp-status-row">
                <div className="sp-device-tag">{laptop.asset_tag}</div>
                <Badge status={laptop.status} />
                <Badge status={laptop.condition ?? 'FUNCTIONAL'} />
              </div>
              <div className="sp-device-name">{laptop.brand} {laptop.model}</div>
            </div>

            {/* Info Cards */}
            <div className="sp-info-row">
              <div className="sp-info-card">
                <div className="sp-info-card-label">Serial Number</div>
                <div className="sp-info-card-value">{laptop.serial_number}</div>
              </div>
              <div className="sp-info-card">
                <div className="sp-info-card-label">Purchase Date</div>
                <div className="sp-info-card-value">
                  {laptop.purchase_date
                    ? format(new Date(laptop.purchase_date), 'MMM dd, yyyy')
                    : '—'}
                </div>
              </div>
            </div>

            {/* Fault/Notes block */}
            {laptop.condition === 'FAULTY' && (
              <div className="sp-fault-block">
                <div className="sp-fault-label"><MessageSquare size={14} />Fault Description</div>
                <div className="sp-fault-text">
                  {(laptop as any).fault_description || 'No fault description provided.'}
                </div>
              </div>
            )}

            {/* Current Assignment */}
            <div className="sp-section-title">CURRENT ASSIGNMENT</div>

            {currentAssignee ? (
              <div className="sp-assignee-card">
                <div className="sp-assignee-info">
                  <div className="sp-assignee-avatar">
                    {currentAssignee.first_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="sp-assignee-name">
                      {currentAssignee.first_name} {currentAssignee.last_name}
                    </div>
                    <div className="sp-assignee-email">{currentAssignee.email}</div>
                    <div className="sp-assignee-dept">{currentAssignee.department}</div>
                  </div>
                </div>
                <div className="sp-assignee-actions">
                  <button className="btn btn-secondary" onClick={() => setShowAssignModal(true)}>
                    <UserCheck size={14} /> Reassign
                  </button>
                  <button className="btn btn-secondary" onClick={() => setConfirmReturn(true)}>
                    <RotateCcw size={14} /> Return
                  </button>
                </div>
              </div>
            ) : (
              <div className="sp-empty-assignment">
                <p>Not currently assigned</p>
                {laptop.status !== 'RETIRED' && (
                  <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                    <UserCheck size={14} /> Assign Laptop
                  </button>
                )}
              </div>
            )}

            {/* Critical Actions */}
            {laptop.status !== 'RETIRED' && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="sp-action-btn-full"
                  onClick={() => setConfirmFaulty(true)}
                  style={{ color: laptop.condition === 'FAULTY' ? 'var(--accent-green)' : '#f59e0b' }}
                >
                  <AlertTriangle size={14} />
                  {laptop.condition === 'FAULTY' ? 'Mark as Functional' : 'Mark as Faulty'}
                </button>
                <button
                  className="sp-action-btn-full"
                  onClick={() => setConfirmRetire(true)}
                  style={{ color: '#ef4444' }}
                >
                  <Archive size={14} /> Archive (Retire) Device
                </button>
              </div>
            )}

            {/* Assignment History */}
            <div className="sp-section-title" style={{ marginTop: 20 }}>
              <Clock size={13} /> ASSIGNMENT HISTORY
            </div>

            {history.length === 0 ? (
              <div className="sp-empty-assignment"><p>No assignment history</p></div>
            ) : (
              history.map((record: any) => (
                <div className="sp-history-card" key={record.id}>
                  <div className="sp-history-header">
                    <div className="sp-history-name">
                      {record.employee_name ?? `${record.first_name ?? ''} ${record.last_name ?? ''}`.trim() ?? 'Unknown'}
                    </div>
                    {!record.returned_date
                      ? <Badge status="ASSIGNED" />
                      : <span className="badge badge-inactive"><span className="badge-dot" />Returned</span>
                    }
                  </div>
                  <div className="sp-history-dates">
                    {format(new Date(record.assigned_date), 'MMM d, yyyy')}
                    {' → '}
                    {record.returned_date
                      ? format(new Date(record.returned_date), 'MMM d, yyyy')
                      : 'Present'}
                  </div>
                  {record.notes && (
                    <div className="sp-history-notes">{record.notes}</div>
                  )}
                </div>
              ))
            )}

            {/* Edit Button */}
            <button
              className="sp-action-btn-full"
              style={{ marginTop: 16 }}
              onClick={() => { if (onOpenEditForm && laptopId) { onClose(); onOpenEditForm(laptopId); } }}
            >
              <Edit size={14} /> Edit Device
            </button>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Laptop not found
          </div>
        )}
      </SlidePanel>

      {/* Assignment Modal */}
      <AssetAssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        laptop={laptop}
        onSuccess={() => { fetchData(); onDataChange(); }}
      />

      {/* Confirm Return */}
      <ConfirmModal
        isOpen={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        onConfirm={handleReturn}
        title="Return Device"
        message={`Are you sure you want to return this laptop from ${currentAssignee?.first_name} ${currentAssignee?.last_name}? It will be marked as Available.`}
        confirmLabel="Yes, Return"
        variant="warning"
        isLoading={isActing}
      />

      {/* Confirm Retire */}
      <ConfirmModal
        isOpen={confirmRetire}
        onClose={() => setConfirmRetire(false)}
        onConfirm={handleRetire}
        title="Archive Device"
        message={`Are you sure you want to retire ${laptop?.asset_tag}? This cannot be undone and the device will be removed from active inventory.`}
        confirmLabel="Yes, Retire"
        variant="danger"
        isLoading={isActing}
      />

      {/* Confirm Faulty */}
      <ConfirmModal
        isOpen={confirmFaulty}
        onClose={() => setConfirmFaulty(false)}
        onConfirm={handleMarkFaulty}
        title={laptop?.condition === 'FAULTY' ? 'Mark as Functional' : 'Mark as Faulty'}
        message={laptop?.condition === 'FAULTY'
          ? `Mark ${laptop?.asset_tag} as functional and return it to normal inventory?`
          : `Mark ${laptop?.asset_tag} as faulty? It will still show in inventory but flagged for repair.`}
        confirmLabel="Confirm"
        variant="warning"
        isLoading={isActing}
      />
    </>
  );
};
