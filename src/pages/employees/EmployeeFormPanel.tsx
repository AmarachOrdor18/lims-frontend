import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SlidePanel } from '../../components/UI/SlidePanel';
import { api } from '../../api';
import { toast } from 'sonner';

const DEPARTMENTS = [
  'Engineering', 'Business Development', 'Internship', 'Project Management',
  'Operations', 'Executive', 'Marketing', 'Facilities', 'Qoospayce',
  'Partnerships & Strategy', 'Product & Design', 'People & Culture',
  'HR', 'Finance', 'ICT', 'Sales', 'Legal', 'Admin',
];

const ENTITIES = ['Qucoon', 'Rubies', 'Qucoon Kenya', 'TeSA'];
const LOCATIONS = ['Lagos, Nigeria', 'Nairobi, Kenya'];
const STAFF_TYPES = ['Staff', 'Corp Member', 'Intern', 'Contract Staff'];
const SENIORITY_LEVELS = ['C-Suite', 'Lead', 'Manager', 'Associate', 'Corp Member', 'Intern', 'Support Staff'];

interface EmployeeFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string | null;
  onSuccess: () => void;
}

export const EmployeeFormPanel: React.FC<EmployeeFormPanelProps> = ({
  isOpen, onClose, employeeId, onSuccess,
}) => {
  const isEdit = !!employeeId;

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    job_title: '',
    entity: 'Qucoon',
    location: 'Lagos, Nigeria',
    staff_type: 'Staff',
    seniority: 'Associate',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        fetchEmployee();
      } else {
        setForm({
          first_name: '', last_name: '', email: '', department: '',
          job_title: '', entity: 'Qucoon', location: 'Lagos, Nigeria',
          staff_type: 'Staff', seniority: 'Associate',
        });
        setErrors({});
        setLoading(false);
      }
    }
  }, [isOpen, employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/employees/${employeeId}`);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        department: data.department,
        job_title: data.job_title,
        entity: data.entity,
        location: data.location,
        staff_type: data.staff_type,
        seniority: data.seniority,
      });
    } catch (e) {
      console.error('Failed to fetch employee', e);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.department) e.department = 'Department is required';
    if (!form.job_title.trim()) e.job_title = 'Job title is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/employees/${employeeId}`, form);
      } else {
        await api.post('/employees', form);
      }
      toast.success(isEdit ? 'Employee updated' : 'Employee added');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Employee' : 'Add New Employee'}
      width={500}
    >
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner mx-auto" />
        </div>
      ) : (
        <form id="employee-form-panel" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="ep-first-name" className="form-label">First Name *</label>
              <input id="ep-first-name" className="form-input"
                placeholder="e.g. James"
                value={form.first_name}
                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
              {errors.first_name && <span className="form-error">{errors.first_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ep-last-name" className="form-label">Last Name *</label>
              <input id="ep-last-name" className="form-input"
                placeholder="e.g. Okafor"
                value={form.last_name}
                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
              {errors.last_name && <span className="form-error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="ep-email" className="form-label">Company Email *</label>
            <input id="ep-email" type="email" className="form-input"
              placeholder="employee@qucoon.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="ep-dept" className="form-label">Department *</label>
              <select id="ep-dept" className="form-select"
                value={form.department}
                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="form-error">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ep-job-title" className="form-label">Job Title *</label>
              <input id="ep-job-title" className="form-input"
                placeholder="e.g. Senior Cloud Engineer"
                value={form.job_title}
                onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))} />
              {errors.job_title && <span className="form-error">{errors.job_title}</span>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="ep-entity" className="form-label">Entity</label>
              <select id="ep-entity" className="form-select"
                value={form.entity}
                onChange={e => setForm(p => ({ ...p, entity: e.target.value }))}>
                {ENTITIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ep-location" className="form-label">Location</label>
              <select id="ep-location" className="form-select"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>
                {LOCATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="ep-staff-type" className="form-label">Staff Type</label>
              <select id="ep-staff-type" className="form-select"
                value={form.staff_type}
                onChange={e => setForm(p => ({ ...p, staff_type: e.target.value }))}>
                {STAFF_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ep-seniority" className="form-label">Seniority</label>
              <select id="ep-seniority" className="form-select"
                value={form.seniority}
                onChange={e => setForm(p => ({ ...p, seniority: e.target.value }))}>
                {SENIORITY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-employee-panel-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
              {saving ? 'Saving…' : isEdit ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      )}
    </SlidePanel>
  );
};
