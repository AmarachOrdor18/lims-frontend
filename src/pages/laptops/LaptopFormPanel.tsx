import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { SlidePanel } from '../../components/UI/SlidePanel';
import { api } from '../../api';
import { toast } from 'sonner';

interface LaptopFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  laptopId?: string | null; // null = create, string = edit
  onSuccess: () => void;
}

export const LaptopFormPanel: React.FC<LaptopFormPanelProps> = ({
  isOpen, onClose, laptopId, onSuccess,
}) => {
  const isEdit = !!laptopId;
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    condition: 'FUNCTIONAL' as 'FUNCTIONAL' | 'FAULTY',
    status: 'AVAILABLE' as 'AVAILABLE' | 'ASSIGNED' | 'RETIRED',
    notes: '',
    fault_description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        fetchLaptop();
      } else {
        setForm({
          brand: '', model: '', serial_number: '', purchase_date: '',
          condition: 'FUNCTIONAL', status: 'AVAILABLE', notes: '', fault_description: '',
        });
        setErrors({});
        setLoading(false);
      }
    }
  }, [isOpen, laptopId]);

  const fetchLaptop = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/laptops/${laptopId}`);
      setForm({
        brand: data.brand,
        model: data.model,
        serial_number: data.serial_number,
        purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
        condition: data.condition || 'FUNCTIONAL',
        status: data.status || 'AVAILABLE',
        notes: data.notes || '',
        fault_description: data.fault_description || '',
      });
    } catch (e) {
      console.error('Failed to fetch laptop', e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.brand.trim()) e.brand = 'Brand is required';
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.serial_number.trim()) e.serial_number = 'Serial number is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/laptops/${laptopId}`, form);
      } else {
        await api.post('/laptops', form);
      }
      toast.success(isEdit ? 'Laptop updated' : 'Laptop added');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save laptop');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Laptop' : 'Add New Laptop'}
      width={500}
    >
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner mx-auto" />
        </div>
      ) : (
        <form id="laptop-form-panel" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="lp-brand" className="form-label">Brand *</label>
              <select id="lp-brand" className="form-select"
                value={form.brand}
                onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}>
                <option value="">Select brand…</option>
                {['Dell', 'Apple', 'HP', 'Lenovo', 'Microsoft', 'ASUS', 'Acer', 'Samsung'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.brand && <span className="form-error">{errors.brand}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lp-purchase-date" className="form-label">Purchase Date</label>
              <input
                id="lp-purchase-date"
                ref={dateInputRef}
                type="date"
                className="form-input"
                value={form.purchase_date}
                onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))}
                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                onFocus={(e) => (e.currentTarget as any).showPicker?.()}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="lp-model" className="form-label">Model *</label>
            <input id="lp-model" className="form-input"
              placeholder="e.g. Latitude 5540"
              value={form.model}
              onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
            {errors.model && <span className="form-error">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lp-serial" className="form-label">Serial Number *</label>
            <input id="lp-serial" className={`form-input ${errors.serial_number ? 'error' : ''}`}
              placeholder="e.g. SN-DL011-2024"
              value={form.serial_number}
              onChange={e => setForm(p => ({ ...p, serial_number: e.target.value }))} />
            {errors.serial_number && <span className="form-error">{errors.serial_number}</span>}
          </div>

          <div className="form-grid-2" style={{ marginTop: 8 }}>
            <div className="form-group">
              <label className="form-label">Device Condition</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${form.condition === 'FUNCTIONAL' ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() => setForm(p => ({ ...p, condition: 'FUNCTIONAL' }))}
                  style={{ flex: 1 }}
                >
                  <CheckCircle size={14} /> Functional
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${form.condition === 'FAULTY' ? 'btn-warning' : 'btn-ghost'}`}
                  onClick={() => setForm(p => ({ ...p, condition: 'FAULTY' }))}
                  style={{ flex: 1 }}
                >
                  <AlertTriangle size={14} /> Faulty
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="lp-status" className="form-label">Availability Status</label>
              <select id="lp-status" className="form-select"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="lp-notes" className="form-label">Notes</label>
            <textarea
              id="lp-notes"
              className="form-textarea"
              placeholder="Optional notes about this device..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Fault Description (shown when faulty) */}
          {form.condition === 'FAULTY' && (
            <div className="form-group">
              <label htmlFor="lp-fault" className="form-label">Fault Description</label>
              <textarea
                id="lp-fault"
                className="form-textarea"
                placeholder="Describe the fault..."
                value={form.fault_description}
                onChange={e => setForm(p => ({ ...p, fault_description: e.target.value }))}
                rows={3}
                style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-laptop-panel-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
              {saving ? 'Saving…' : isEdit ? 'Update Laptop' : 'Add Laptop'}
            </button>
          </div>
        </form>
      )}
    </SlidePanel>
  );
};
