import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, User, Eye,
  Monitor, Activity,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  ChevronsUpDown, ChevronUp, ChevronDown,
  RefreshCw, SlidersHorizontal, Download,
} from 'lucide-react';
import { Badge }      from '../../components/UI/Badge';
import { EmptyState } from '../../components/UI/EmptyState';
import { CSVImporter } from '../../components/UI/CSVImporter';
import { EmployeeDetailPanel } from './EmployeeDetailPanel';
import { EmployeeFormPanel }   from './EmployeeFormPanel';
import { api }        from '../../api';
import { toast }      from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Employee } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmployeeFilters {
  name:          string;
  email:         string;
  asset_tag:     string;
  departments:   string[];
  statuses:      string[];
}

const EMPTY_FILTERS: EmployeeFilters = {
  name: '', email: '', asset_tag: '', departments: [], statuses: [],
};

const DEFAULT_DEPARTMENTS = [
  'Engineering','HR','Finance','Operations','ICT',
  'Marketing','Sales','Legal','Product','Admin',
];
const STATUS_OPTIONS = ['ACTIVE','INACTIVE'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccordionSection({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid var(--border-default)` }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
        {title}
        <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--text-muted)' }} />
      </button>
      {open && <div style={{ padding: '4px 20px 16px' }}>{children}</div>}
    </div>
  );
}

function FilterSelectSingle({ label, options, value, allLabel, onChange }: {
  label: string; options: string[]; value: string; allLabel: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
      <select
        className="form-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
      >
        <option value="">{allLabel}</option>
        {options.map(o => (
          <option key={o} value={o}>
            {o.charAt(0) + o.slice(1).toLowerCase().replace('_', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterSelect({ label, options, selected, onChange }: {
  label: string; options: { label: string; value: string }[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
      <select
        className="form-select"
        value={selected[0] ?? ''}
        onChange={e => onChange(e.target.value ? [e.target.value] : [])}
        style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
      >
        <option value="">All Departments</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1e3a5f', color: '#93c5fd', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
      {label}
      <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );
}

function SortChevron({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: 'asc' | 'desc' } }) {
  if (sortConfig.key !== col) return <ChevronsUpDown size={11} style={{ opacity: .3 }} />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp   size={11} style={{ color: 'var(--accent-green)' }} />
    : <ChevronDown size={11} style={{ color: 'var(--accent-green)' }} />;
}

// ─── Main component ────────────────────────────────────────────────────────────
export const EmployeeList: React.FC = () => {
  const queryClient = useQueryClient();

  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const [filters,        setFilters]        = useState<EmployeeFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<EmployeeFilters>(EMPTY_FILTERS);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'first_name', direction: 'asc' });
  const [page, setPage]             = useState(1);
  const [deptOptions, setDeptOptions] = useState<{ label: string; value: string }[]>(
    DEFAULT_DEPARTMENTS.map(d => ({ label: d, value: d }))
  );

  // Slide panel states
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailEmployeeId, setDetailEmployeeId] = useState<string | null>(null);
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [formEmployeeId, setFormEmployeeId] = useState<string | null>(null);

  useEffect(() => { setPage(1); }, [filters, sortConfig]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['employees', page, filters, sortConfig],
    queryFn: async ({ signal }) => {
      let q = `?page=${page}&limit=20`;
      if (filters.statuses.length)       q += `&status=${filters.statuses.join(',')}`;
      if (filters.departments.length)    q += `&department=${filters.departments.join(',')}`;
      if (filters.name)                  q += `&name=${encodeURIComponent(filters.name)}`;
      if (filters.email)                 q += `&email=${encodeURIComponent(filters.email)}`;
      if (filters.asset_tag)             q += `&asset_tag=${encodeURIComponent(filters.asset_tag)}`;
      q += `&sort_by=${sortConfig.key}&sort_dir=${sortConfig.direction}`;
      return api.get(`/employees${q}`, signal);
    },
    placeholderData: prev => prev,
  });

  const employees: Employee[] = response?.data  ?? [];
  const total:     number     = response?.total ?? 0;

  // Build dept options from live data
  useEffect(() => {
    if (employees.length > 0) {
      const live = Array.from(new Set(employees.map((e: Employee) => e.department).filter(Boolean))) as string[];
      const merged = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...live])).sort();
      setDeptOptions(merged.map(d => ({ label: d, value: d })));
    }
  }, [employees]);

  // ── Export ────────────────────────────────────────────────────────────────
  function downloadCSV(filename: string, rows: Employee[]) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]) as (keyof Employee)[];
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: filename });
    a.click(); URL.revokeObjectURL(a.href);
  }

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = async (data: Record<string, string>[]) => {
    try {
      await api.post('/employees/bulk', {
        employees: data.map(i => ({
          first_name: i['First Name'], last_name: i['Last Name'],
          email: i['Email'], department: i['Department'] || 'General',
          entity: i['Entity'] || 'Qucoon', location: i['Location'] || 'Lagos, Nigeria',
          job_title: i['Job Title'] || 'Associate',
          staff_type: i['Staff Type'] || 'Staff', seniority: i['Seniority'] || 'Associate',
        })),
      });
      toast.success('Employees imported successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch {
      toast.error('Import failed');
    }
  };

  const handleSort = (key: string) =>
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const applyFilters = () => { setFilters({ ...pendingFilters }); setFilterOpen(false); };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setPendingFilters(EMPTY_FILTERS); };

  const hasFilters =
    !!(filters.name || filters.email || filters.asset_tag ||
       filters.departments.length || filters.statuses.length);

  const totalPages = Math.ceil(total / 20) || 1;
  const pageFrom   = total === 0 ? 0 : (page - 1) * 20 + 1;
  const pageTo     = Math.min(total, page * 20);

  // ── Get assigned asset tag — backend now returns this directly ─────────────
  const getAssignedAssetTag = (emp: any): string => {
    return emp.assigned_asset_tag ?? '—';
  };

  // ── Inline style helpers ──────────────────────────────────────────────────
  const S = {
    iconBtn: (active = false): React.CSSProperties => ({
      width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? 'var(--accent-green-surface)' : 'var(--bg-surface)',
      border: `1px solid ${active ? 'var(--accent-green)' : 'var(--border-default)'}`,
      borderRadius: 6, color: active ? 'var(--accent-green)' : 'var(--text-secondary)',
      cursor: 'pointer', transition: 'all .15s',
    }),
    th: (sortable = true): React.CSSProperties => ({
      padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600,
      color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '.6px',
      borderBottom: `1px solid var(--border-default)`, background: 'var(--table-header-bg)',
      cursor: sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap',
    }),
    td: (muted = false): React.CSSProperties => ({
      padding: '11px 10px', fontSize: 13,
      color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
      borderBottom: `1px solid var(--border-default)`,
    }),
    actBtn: (): React.CSSProperties => ({
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'none',
      border: `1px solid var(--border-default)`,
      borderRadius: 5,
      color: 'var(--text-muted)',
      cursor: 'pointer', transition: 'all .15s',
    }),
    pagBtn: (disabled: boolean): React.CSSProperties => ({
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 5,
      color: 'var(--text-secondary)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .35 : 1,
    }),
    expItem: (): React.CSSProperties => ({
      display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left',
      background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
    }),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', padding: '12px 10px' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>People</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{total} staff members listed</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button type="button" style={S.iconBtn()} title="Refresh" onClick={() => refetch()}><RefreshCw size={14} /></button>

          <button type="button" style={S.iconBtn(filterOpen)} title="Filters"
            onClick={() => { setPendingFilters(filters); setFilterOpen(o => !o); }}>
            <SlidersHorizontal size={14} />
          </button>

          {/* Export dropdown */}
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button type="button" style={S.iconBtn()} title="Export" onClick={() => setExportOpen(o => !o)}>
              <Download size={14} />
            </button>
            {exportOpen && (
              <div style={{ position: 'absolute', right: 0, top: 38, background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 8, minWidth: 160, zIndex: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <button style={S.expItem()} onClick={() => { downloadCSV('employees.csv', employees); setExportOpen(false); }}>Export Current Page</button>
              </div>
            )}
          </div>

          <CSVImporter
            onImport={handleImport}
            sampleHeaders={['First Name','Last Name','Email','Department','Job Title','Location','Entity','Staff Type','Seniority']}
            title="Employees"
          />

          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setFormEmployeeId(null); setFormPanelOpen(true); }}
          >
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {filterOpen && (
        <div style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
          <AccordionSection title="Status" defaultOpen>
            <FilterSelectSingle label="Status" options={STATUS_OPTIONS} value={pendingFilters.statuses[0] ?? ''} allLabel="All Statuses" onChange={v => setPendingFilters(f => ({ ...f, statuses: v ? [v] : [] }))} />
          </AccordionSection>
          <AccordionSection title="Department" defaultOpen>
            <FilterSelect label="Department" options={deptOptions} selected={pendingFilters.departments} onChange={v => setPendingFilters(f => ({ ...f, departments: v }))} />
          </AccordionSection>
          <AccordionSection title="Search">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Name</span>
                <input
                  value={pendingFilters.name}
                  onChange={e => setPendingFilters(f => ({ ...f, name: e.target.value }))}
                  placeholder="Search by name…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Email</span>
                <input
                  value={pendingFilters.email}
                  onChange={e => setPendingFilters(f => ({ ...f, email: e.target.value }))}
                  placeholder="Search by email…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Asset Tag</span>
                <input
                  value={pendingFilters.asset_tag}
                  onChange={e => setPendingFilters(f => ({ ...f, asset_tag: e.target.value }))}
                  placeholder="Search by asset tag…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
                />
              </div>
            </div>
          </AccordionSection>
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', justifyContent: 'flex-end' }}>
            <button type="button" style={{ padding: '7px 14px', background: 'none', border: `1px solid var(--border-default)`, borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }} onClick={() => setFilterOpen(false)}>Cancel</button>
            <button type="button" style={{ padding: '7px 14px', background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={applyFilters}>Apply</button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, overflow: 'hidden' }}>
        {hasFilters && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid var(--border-default)` }}>
            <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--accent-green)', cursor: 'pointer', textDecoration: 'underline' }} onClick={resetFilters}>Clear filters</button>
          </div>
        )}

        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 16px', borderBottom: `1px solid var(--border-default)`, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active:</span>
            {filters.name      && <Tag label={`Name: ${filters.name}`}       onRemove={() => setFilters(f => ({ ...f, name: '' }))} />}
            {filters.email     && <Tag label={`Email: ${filters.email}`}     onRemove={() => setFilters(f => ({ ...f, email: '' }))} />}
            {filters.asset_tag && <Tag label={`Asset: ${filters.asset_tag}`} onRemove={() => setFilters(f => ({ ...f, asset_tag: '' }))} />}
            {filters.departments.map(d    => <Tag key={d} label={d} onRemove={() => setFilters(f => ({ ...f, departments:    f.departments.filter(x => x !== d) }))} />)}
            {filters.statuses.map(s       => <Tag key={s} label={s} onRemove={() => setFilters(f => ({ ...f, statuses:       f.statuses.filter(x => x !== s) }))} />)}
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner mx-auto" /></div>
        ) : employees.length === 0 ? (
          <EmptyState icon={<User size={24} />} title="No employees found" description="Add an employee or import a CSV to get started." />
        ) : (
          <>
            <div className="desktop-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th()} onClick={() => handleSort('first_name')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={11} />Employee<SortChevron col="first_name" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('email')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Email<SortChevron col="email" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('department')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Department<SortChevron col="department" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('status')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Activity size={11} />Status<SortChevron col="status" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={11} />Asset Tag</div>
                  </th>
                  <th style={{ ...S.th(false), textAlign: 'center', width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} id={`employee-row-${emp.id}`}
                    style={{ cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setDetailEmployeeId(emp.id); setDetailPanelOpen(true); }}>
                    <td style={{ ...S.td(), fontWeight: 500 }}>{emp.first_name} {emp.last_name}</td>
                    <td style={{ ...S.td(true), fontSize: 12 }}>{emp.email}</td>
                    <td style={S.td(true)}>{emp.department}</td>
                    <td style={S.td()}><Badge status={emp.status} /></td>
                    <td style={{ ...S.td(true), fontFamily: 'monospace', fontSize: 12 }}>{getAssignedAssetTag(emp)}</td>
                    <td style={{ ...S.td(false), textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button type="button" style={S.actBtn()} title="View Details"
                          onClick={() => { setDetailEmployeeId(emp.id); setDetailPanelOpen(true); }}>
                          <Eye size={13} />
                        </button>
                        <button type="button" style={S.actBtn()} title="Edit"
                          onClick={() => { setFormEmployeeId(emp.id); setFormPanelOpen(true); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-card-list">
            {employees.map((emp) => (
              <div key={`mobile-${emp.id}`} className="mobile-data-card" onClick={() => { setDetailEmployeeId(emp.id); setDetailPanelOpen(true); }}>
                <div className="mobile-data-card-title">{emp.first_name} {emp.last_name}</div>
                <div className="mobile-data-card-row"><span>{emp.email}</span><Badge status={emp.status} /></div>
                <div className="mobile-data-card-row"><span>{emp.department}</span><span style={{ fontFamily: 'monospace' }}>{getAssignedAssetTag(emp)}</span></div>
                <div className="mobile-data-card-row">
                  <span>Actions</span>
                  <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button type="button" style={S.actBtn()} title="View Details" onClick={() => { setDetailEmployeeId(emp.id); setDetailPanelOpen(true); }}>
                      <Eye size={13} />
                    </button>
                    <button type="button" style={S.actBtn()} title="Edit" onClick={() => { setFormEmployeeId(emp.id); setFormPanelOpen(true); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid var(--border-default)` }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {pageFrom}–{pageTo} of {total}</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button type="button" disabled={page <= 1}          style={S.pagBtn(page <= 1)}          onClick={() => setPage(1)}><ChevronsLeft  size={12} /></button>
            <button type="button" disabled={page <= 1}          style={S.pagBtn(page <= 1)}          onClick={() => setPage(p => p - 1)}><ChevronLeft   size={12} /></button>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 4px' }}>Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages} style={S.pagBtn(page >= totalPages)} onClick={() => setPage(p => p + 1)}><ChevronRight  size={12} /></button>
            <button type="button" disabled={page >= totalPages} style={S.pagBtn(page >= totalPages)} onClick={() => setPage(totalPages)}><ChevronsRight size={12} /></button>
            <select style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 5, color: 'var(--text-primary)', fontSize: 12, padding: '4px 6px', cursor: 'pointer' }} defaultValue={20}>
              <option value={20}>20</option><option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SLIDE PANELS ─────────────────────────────────────────────────── */}
      <EmployeeDetailPanel
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        employeeId={detailEmployeeId}
        onDataChange={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
        onOpenEditForm={(id) => { setFormEmployeeId(id); setFormPanelOpen(true); }}
      />

      <EmployeeFormPanel
        isOpen={formPanelOpen}
        onClose={() => setFormPanelOpen(false)}
        employeeId={formEmployeeId}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
      />
    </div>
  );
};
