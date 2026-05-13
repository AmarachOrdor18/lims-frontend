import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../api';
import { toast } from 'sonner';

export const LaptopForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';
  
  const [form, setForm] = useState({
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    condition: 'FUNCTIONAL' as 'FUNCTIONAL' | 'FAULTY',
    status: 'AVAILABLE' as 'AVAILABLE' | 'ASSIGNED' | 'RETIRED'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit) {
      fetchLaptop();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchLaptop = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/laptops/${id}`);
      setForm({
        brand: data.brand,
        model: data.model,
        serial_number: data.serial_number,
        purchase_date: data.purchase_date ? data.purchase_date.split('T')[0] : '',
        condition: data.condition || 'FUNCTIONAL',
        status: data.status || 'AVAILABLE'
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
      const payload = { ...form, purchase_date: form.purchase_date || null };
      let savedId: string | null | undefined = id as string;

      if (isEdit) {
        await api.patch(`/laptops/${id}`, payload);
      } else {
        const res = await api.post('/laptops', payload);
        savedId = res?.data?.id ?? res?.id ?? null;
      }

      if (savedId) {
        await api.patch(`/laptops/${savedId}/status`, {
          condition: form.condition,
          fault_description: (form as any).fault_description || null,
        });
      }

      navigate('/laptops');
    } catch (e: any) {
      let msg = 'Failed to save laptop';
      try { msg = JSON.parse(e.message)?.error ?? e.message; } catch { msg = e.message || msg; }
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}><div className="spinner mx-auto" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1>{isEdit ? 'Edit Laptop' : 'Add New Laptop'}</h1>
            <p className="subtitle">{isEdit ? `Editing device info` : 'Register a new device in the inventory'}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form id="laptop-form" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="brand" className="form-label">Brand *</label>
              <select id="brand" className="form-select"
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
              <label htmlFor="purchase-date" className="form-label">Purchase Date</label>
              <input 
                id="purchase-date" 
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
            <label htmlFor="model" className="form-label">Model *</label>
            <input id="model" className="form-input"
              placeholder="e.g. Latitude 5540"
              value={form.model}
              onChange={e => setForm(p => ({ ...p, model: e.target.value }))} />
            {errors.model && <span className="form-error">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="serial-number" className="form-label">Serial Number *</label>
            <input id="serial-number" className={`form-input ${errors.serial_number ? 'error' : ''}`}
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
              <label htmlFor="status" className="form-label">Availability Status</label>
              <select id="status" className="form-select"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            <button id="save-laptop-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
              {saving ? 'Saving…' : isEdit ? 'Update Laptop' : 'Add Laptop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
