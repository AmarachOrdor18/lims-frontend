import React, { useState, useEffect } from 'react';
import {
  Clock, MessageSquare, Edit, UserCheck, RotateCcw,
} from 'lucide-react';
import { SlidePanel } from '../../components/UI/SlidePanel';
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

  useEffect(() => {
    if (isOpen && laptopId) {
      fetchData();
    }
  }, [isOpen, laptopId]);

  const fetchData = async () => {
    if (!laptopId) return;
    try {
      setIsLoading(true);
      const { data } = await api.get(`/laptops/${laptopId}`);
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
      try {
        const { data: historyData } = await api.get(`/assignments/history/${laptopId}`);
        setHistory(historyData);
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
    if (!laptopId) return;
    if (!window.confirm("Return this laptop?\n\nThis will mark the laptop as Available and close the current assignment record.")) {
      return;
    }
    
    try {
      await api.post(`/assignments/return`, { laptop_id: laptopId });
      toast.success('Device returned successfully');
      fetchData();
      onDataChange();
    } catch {
      toast.error('Failed to return device');
    }
  };


  if (!isOpen) return null;

  return (
    <>
      <SlidePanel isOpen={isOpen} onClose={onClose}>
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
                <Badge status={laptop.condition ?? 'FUNCTIONAL'} />
              </div>
              <div className="sp-device-name">{laptop.brand} {laptop.model}</div>
            </div>

            {/* Serial Number + Purchase Date */}
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

            {/* Fault Description (if faulty) */}
            {laptop.condition === 'FAULTY' && (
              <div className="sp-fault-block">
                <div className="sp-fault-label">
                  <MessageSquare size={14} />
                  Fault Description
                </div>
                <div className="sp-fault-text">
                  {(laptop as any).fault_description ||
                    'Currently faulty. No description provided.'}
                </div>
              </div>
            )}

            {/* Notes (if functional/available) */}
            {laptop.condition !== 'FAULTY' && (
              <div className="sp-notes-block">
                <div className="sp-notes-label">
                  <MessageSquare size={14} />
                  Notes
                </div>
                <div className="sp-notes-text">
                  {(laptop as any).notes || 'No notes added.'}
                </div>
              </div>
            )}

            {/* Current Assignment Section */}
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
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAssignModal(true)}
                  >
                    <UserCheck size={14} /> Reassign
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleReturn}
                  >
                    <RotateCcw size={14} /> Return
                  </button>
                </div>
              </div>
            ) : (
              <div className="sp-empty-assignment">
                <p>Not currently assigned</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAssignModal(true)}
                >
                  <UserCheck size={14} /> Assign Laptop
                </button>
              </div>
            )}

            {/* Assignment History */}
            <div className="sp-section-title" style={{ marginTop: 20 }}>
              <Clock size={13} />
              ASSIGNMENT HISTORY
            </div>

            {history.length === 0 ? (
              <div className="sp-empty-assignment">
                <p>No assignment history</p>
              </div>
            ) : (
              history.map((record: any) => (
                <div className="sp-history-card" key={record.id}>
                  <div className="sp-history-header">
                    <div className="sp-history-name">
                      {record.employee
                        ? `${record.employee.first_name} ${record.employee.last_name}`
                        : 'Unknown'}
                    </div>
                    {!record.returned_date ? (
                      <Badge status="ACTIVE" />
                    ) : (
                      <span className="badge badge-inactive">
                        <span className="badge-dot" />Returned
                      </span>
                    )}
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

            {/* Edit Device Button */}
            <button
              className="sp-action-btn-full"
              style={{ marginTop: 16 }}
              onClick={() => {
                if (onOpenEditForm && laptopId) {
                  onClose();
                  onOpenEditForm(laptopId);
                }
              }}
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
        onSuccess={() => {
          fetchData();
          onDataChange();
        }}
      />
    </>
  );
};
