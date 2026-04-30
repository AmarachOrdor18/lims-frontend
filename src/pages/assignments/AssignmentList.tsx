import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Clock, Monitor, User, Calendar, Activity, RotateCcw,
  UserCheck, Eye,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  ChevronsUpDown, ChevronUp, ChevronDown,
  RefreshCw, SlidersHorizontal, Download,
} from 'lucide-react';
import { api }      from '../../api';
import { toast }    from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format }   from 'date-fns';
import { AssetAssignmentModal } from '../../components/Modals/AssetAssignmentModal';
import { ConfirmModal } from '../../components/UI/ConfirmModal';
import type { Assignment, Laptop } from '../../types';

// ─── Design tokens ────────────────────────────────────────────────────────────
// Theme tokens are provided by CSS variables in `index.css`.
// Use variables: --bg-base, --bg-surface, --bg-elevated, --bg-hover, --border-default, --text-primary, --text-secondary, --text-muted, --accent-green, --danger

// ─── Types ────────────────────────────────────────────────────────────────────
interface AssignmentFilters {
  employee:    string;
  laptop:      string;
  statuses:    string[];
  date_filter: string;
  date_start:  string;
  date_end:    string;
}

const EMPTY_FILTERS: AssignmentFilters = {
  employee: '', laptop: '', statuses: [], date_filter: 'all', date_start: '', date_end: '',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Assigned' },
  { value: 'RETURNED', label: 'Returned' },
];
const DATE_PRESET_OPTIONS = [
  { value: 'all',     label: 'All Dates'    },
  { value: '7days',   label: 'Past 7 Days'  },
  { value: '30days',  label: 'Past 30 Days' },
  { value: 'custom',  label: 'Custom Range' },
];

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
  label: string;
  options: { label: string; value: string }[];
  value: string;
  allLabel: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }}
      >
        <option value="">{allLabel}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--accent-green-surface)', color: 'var(--accent-green)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
      {label}
      <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
    </span>
  );
}

function SortChevron({ col, sortConfig }: { col: string; sortConfig: { key: string; direction: 'asc' | 'desc' } }) {
  if (sortConfig.key !== col) return <ChevronsUpDown size={11} style={{ opacity: .3 }} />;
  return sortConfig.direction === 'asc'
    ? <ChevronUp   size={11} style={{ color: 'var(--accent-green)' }} />
    : <ChevronDown size={11} style={{ color: 'var(--accent-green)' }} />;
}

// ─── Status badge (inline, no external dependency needed) ────────────────────
function AssignBadge({ returned }: { returned: boolean }) {
  return returned
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }} />Returned
      </span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'var(--accent-green-surface)', color: 'var(--accent-green)' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />Assigned
      </span>;
}

// ─── Main component ────────────────────────────────────────────────────────────
export const AssignmentList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const queryClient    = useQueryClient();
  const laptopId       = searchParams.get('laptop_id');

  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const [filters,        setFilters]        = useState<AssignmentFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<AssignmentFilters>(EMPTY_FILTERS);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'assigned_date', direction: 'desc' });
  const [page, setPage] = useState(1);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLaptop,  setSelectedLaptop]  = useState<Laptop | null>(null);
  const [confirmReturn,   setConfirmReturn]    = useState<{ id: string } | null>(null);
  const [isActing,        setIsActing]        = useState(false);

  useEffect(() => { setPage(1); }, [laptopId, filters, sortConfig]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['assignments', page, laptopId, filters, sortConfig],
    queryFn: async ({ signal }) => {
      let q = `?page=${page}&limit=20`;
      if (laptopId)                  q += `&laptop_id=${laptopId}`;
      if (filters.statuses.length)   q += `&status=${filters.statuses.join(',')}`;
      if (filters.employee)          q += `&employee_search=${encodeURIComponent(filters.employee)}`;
      if (filters.laptop)            q += `&laptop_search=${encodeURIComponent(filters.laptop)}`;
      if (filters.date_filter !== 'all') {
        q += `&date_filter=${filters.date_filter}`;
        if (filters.date_filter === 'custom' && filters.date_start && filters.date_end) {
          q += `&date_start=${filters.date_start}&date_end=${filters.date_end}`;
        }
      }
      q += `&sort_by=${sortConfig.key}&sort_dir=${sortConfig.direction}`;
      return api.get(`/assignments${q}`, signal);
    },
    placeholderData: prev => prev,
  });

  const assignments: Assignment[] = response?.data  ?? [];
  const total:       number       = response?.total ?? 0;


  // ── Export ────────────────────────────────────────────────────────────────
  function downloadCSV(filename: string, rows: Assignment[]) {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]) as (keyof Assignment)[];
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: filename });
    a.click(); URL.revokeObjectURL(a.href);
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleReturn = (id: string) => {
    setConfirmReturn({ id });
  };

  const performReturn = async () => {
    if (!confirmReturn) return;
    try {
      setIsActing(true);
      await api.patch(`/assignments/${confirmReturn.id}/return`, {});
      toast.success('Device returned to inventory');
      setConfirmReturn(null);
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['laptops'] });
    } catch { 
      toast.error('Failed to process return'); 
    } finally {
      setIsActing(false);
    }
  };

  const handleReassign = (laptop: Laptop | undefined) => {
    if (!laptop) return;
    setSelectedLaptop(laptop);
    setShowAssignModal(true);
  };

  const handleSort = (key: string) =>
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const applyFilters = () => { setFilters({ ...pendingFilters }); setFilterOpen(false); };
  const resetFilters = () => { setFilters(EMPTY_FILTERS); setPendingFilters(EMPTY_FILTERS); };

  const hasFilters =
    !!(filters.employee || filters.laptop ||
       filters.statuses.length || filters.date_filter !== 'all');

  const totalPages = Math.ceil(total / 20) || 1;
  const pageFrom   = total === 0 ? 0 : (page - 1) * 20 + 1;
  const pageTo     = Math.min(total, page * 20);

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
      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px',
      borderBottom: `1px solid var(--border-default)`, background: 'var(--bg-elevated)',
      cursor: sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap',
    }),
    td: (muted = false): React.CSSProperties => ({
      padding: '11px 14px', fontSize: 13,
      color: muted ? 'var(--text-secondary)' : 'var(--text-primary)',
      borderBottom: `1px solid var(--border-default)`,
    }),
    actBtn: (variant?: 'danger'): React.CSSProperties => ({
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'none',
      border: `1px solid ${variant === 'danger' ? 'rgba(127,29,29,0.3)' : 'var(--border-default)'}`,
      borderRadius: 5,
      color: variant === 'danger' ? 'var(--danger)' : 'var(--text-muted)',
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
    finput: (): React.CSSProperties => ({
      width: '100%', background: 'var(--bg-surface)', border: `1px solid var(--border-default)`,
      borderRadius: 5, padding: '7px 10px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
    }),
    flabel: (): React.CSSProperties => ({
      fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px',
    }),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', padding: '12px 10px' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Asset Assignment</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>Lifecycle of laptop handover and returns</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" style={S.iconBtn()} title="Refresh" onClick={() => refetch()}><RefreshCw size={14} /></button>

          <button type="button" style={S.iconBtn(filterOpen)} title="Filters"
            onClick={() => { setFilterOpen(o => !o); setPendingFilters({ ...filters }); }}>
            <SlidersHorizontal size={14} />
          </button>

          {/* Export */}
          <div style={{ position: 'relative' }} ref={exportRef}>
            <button type="button" style={S.iconBtn(exportOpen)} title="Export" onClick={() => setExportOpen(o => !o)}>
              <Download size={14} />
            </button>
            {exportOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, minWidth: 220, zIndex: 50, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Current Page</div>
                {(['CSV','Excel','PDF'] as const).map(fmt => (
                  <button key={fmt} type="button" style={S.expItem()}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    onClick={() => { downloadCSV(`assignments-page.${fmt.toLowerCase()}`, assignments); setExportOpen(false); }}>
                    Export as {fmt}
                  </button>
                ))}
                <div style={{ height: 1, background: 'var(--border-default)', margin: '2px 0' }} />
                <div style={{ padding: '8px 14px 4px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>All Records</div>
                <button type="button" style={S.expItem()}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  onClick={() => { downloadCSV('assignments-all.csv', assignments); setExportOpen(false); }}>
                  Export All — CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {filterOpen && (
          <div style={{ background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
          <AccordionSection title="Text" defaultOpen>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={S.flabel()}>Employee</label>
                <input style={S.finput()} placeholder="Filter..." value={pendingFilters.employee}
                  onChange={e => setPendingFilters(f => ({ ...f, employee: e.target.value }))} />
              </div>
              <div>
                <label style={S.flabel()}>Laptop</label>
                <input style={S.finput()} placeholder="Filter..." value={pendingFilters.laptop}
                  onChange={e => setPendingFilters(f => ({ ...f, laptop: e.target.value }))} />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Select">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FilterSelectSingle
                label="Assignment Status"
                options={STATUS_OPTIONS}
                allLabel="All Statuses"
                value={pendingFilters.statuses[0] ?? ''}
                onChange={(v) => setPendingFilters(f => ({ ...f, statuses: v ? [v] : [] }))}
              />
              <FilterSelectSingle
                label="Assigned Date"
                options={DATE_PRESET_OPTIONS}
                allLabel="All Dates"
                value={pendingFilters.date_filter === 'all' ? '' : pendingFilters.date_filter}
                onChange={(v) => setPendingFilters(f => ({ ...f, date_filter: v || 'all' }))}
              />
            </div>
          </AccordionSection>

          <AccordionSection title="Date">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={S.flabel()}>From Date</label>
                <input type="date" style={S.finput()} value={pendingFilters.date_start}
                  onChange={e => setPendingFilters(f => ({ ...f, date_filter: 'custom', date_start: e.target.value }))} />
              </div>
              <div>
                <label style={S.flabel()}>To Date</label>
                <input type="date" style={S.finput()} value={pendingFilters.date_end}
                  onChange={e => setPendingFilters(f => ({ ...f, date_filter: 'custom', date_end: e.target.value }))} />
              </div>
            </div>
          </AccordionSection>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: `1px solid var(--border-default)` }}>
            <button type="button" style={{ background: 'none', border: `1px solid var(--danger)`, color: 'var(--danger)', padding: '6px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 500 }} onClick={resetFilters}>Reset</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" style={{ background: 'none', border: `1px solid var(--border-default)`, color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: 5, fontSize: 12, cursor: 'pointer' }} onClick={() => { setPendingFilters({ ...filters }); setFilterOpen(false); }}>Cancel</button>
              <button type="button" style={{ background: 'var(--accent-green)', border: 'none', color: '#fff', padding: '6px 16px', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 600 }} onClick={applyFilters}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid var(--border-default)` }}>
          {hasFilters && (
            <button type="button" style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--accent-green)', cursor: 'pointer', textDecoration: 'underline' }} onClick={resetFilters}>Clear filters</button>
          )}
        </div>

        {hasFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 16px', borderBottom: `1px solid var(--border-default)`, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active:</span>
            {filters.employee && <Tag label={`Employee: ${filters.employee}`} onRemove={() => setFilters(f => ({ ...f, employee: '' }))} />}
            {filters.laptop   && <Tag label={`Laptop: ${filters.laptop}`}    onRemove={() => setFilters(f => ({ ...f, laptop: '' }))} />}
            {filters.statuses.map(s => <Tag key={s} label={s} onRemove={() => setFilters(f => ({ ...f, statuses: f.statuses.filter(x => x !== s) }))} />)}
            {filters.date_filter !== 'all' && <Tag label={`Date: ${filters.date_filter}`} onRemove={() => setFilters(f => ({ ...f, date_filter: 'all', date_start: '', date_end: '' }))} />}
          </div>
        )}

        {isLoading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner mx-auto" /></div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>No assignments found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No recorded assignments yet.</p>
          </div>
        ) : (
          <>
            <div className="desktop-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...S.th(false), width: 44 }}><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>#</div></th>
                  <th style={S.th()} onClick={() => handleSort('employee_id')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={11} />Assigned To<SortChevron col="employee_id" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('laptop_id')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={11} />Laptop<SortChevron col="laptop_id" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('assigned_date')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={11} />Assigned Date<SortChevron col="assigned_date" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('returned_date')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Activity size={11} />Status<SortChevron col="returned_date" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={{ ...S.th(false), textAlign: 'center', width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, idx) => (
                  <tr key={a.id}
                    style={{ transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ ...S.td(true), fontWeight: 500 }}>{pageFrom + idx - 1 || idx + 1}</td>
                    <td style={{ ...S.td(), fontWeight: 500 }}>
                      <span style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => navigate(`/employees/${a.employee_id}`)}>
                        {(a as unknown as { employee?: { first_name?: string; last_name?: string } }).employee
                          ? `${(a as unknown as { employee: { first_name: string; last_name: string } }).employee.first_name} ${(a as unknown as { employee: { first_name: string; last_name: string } }).employee.last_name}`
                          : a.employee_id}
                      </span>
                    </td>
                    <td style={S.td()}>
                      <span style={{ color: 'var(--text-primary)', cursor: 'pointer' }}
                        onClick={() => navigate(`/laptops/${a.laptop_id}`)}>
                        {(a as unknown as { laptop?: { brand?: string; model?: string } }).laptop
                          ? `${(a as unknown as { laptop: { brand: string; model: string } }).laptop.brand} ${(a as unknown as { laptop: { brand: string; model: string } }).laptop.model}`
                          : a.laptop_id}
                      </span>
                    </td>
                    <td style={S.td(true)}>{format(new Date(a.assigned_date), 'MMM d, yyyy')}</td>
                    <td style={S.td()}><AssignBadge returned={!!a.returned_date} /></td>
                    <td style={{ ...S.td(false), textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
                        <button type="button" style={S.actBtn()} title="View Laptop" onClick={() => navigate(`/laptops/${a.laptop_id}`)}>
                          <Eye size={13} />
                        </button>
                        <button type="button" style={S.actBtn()} title={a.returned_date ? 'Assign Laptop' : 'Re-assign Laptop'}
                          onClick={() => handleReassign((a as unknown as { laptop?: Laptop }).laptop)}>
                          <UserCheck size={13} />
                        </button>
                        {!a.returned_date && (
                          <button type="button" style={S.actBtn('danger')} title="Mark Returned"
                            onClick={() => handleReturn(a.id)}>
                            <RotateCcw size={13} />
                          </button>
                        )}
                        {/* overflow menu removed - primary action icons are shown inline */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-card-list">
            {assignments.map((a) => (
              <div key={`mobile-${a.id}`} className="mobile-data-card">
                <div className="mobile-data-card-title">
                  {(a as unknown as { laptop?: { brand?: string; model?: string } }).laptop
                    ? `${(a as unknown as { laptop: { brand: string; model: string } }).laptop.brand} ${(a as unknown as { laptop: { brand: string; model: string } }).laptop.model}`
                    : a.laptop_id}
                </div>
                <div className="mobile-data-card-row">
                  <span>
                    {(a as unknown as { employee?: { first_name?: string; last_name?: string } }).employee
                      ? `${(a as unknown as { employee: { first_name: string; last_name: string } }).employee.first_name} ${(a as unknown as { employee: { first_name: string; last_name: string } }).employee.last_name}`
                      : a.employee_id}
                  </span>
                  <AssignBadge returned={!!a.returned_date} />
                </div>
                <div className="mobile-data-card-row"><span>{format(new Date(a.assigned_date), 'MMM d, yyyy')}</span></div>
                <div className="mobile-data-card-row">
                  <span>Actions</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" style={S.actBtn()} title="View Laptop" onClick={() => navigate(`/laptops/${a.laptop_id}`)}>
                      <Eye size={13} />
                    </button>
                    <button type="button" style={S.actBtn()} title={a.returned_date ? 'Assign Laptop' : 'Re-assign Laptop'} onClick={() => handleReassign((a as unknown as { laptop?: Laptop }).laptop)}>
                      <UserCheck size={13} />
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
            <select style={{ background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 5, color: 'var(--text-primary)', fontSize: 12, padding: '4px 6px', cursor: 'pointer' }} defaultValue={20}>
              <option value={20}>20</option><option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {showAssignModal && selectedLaptop && (
        <AssetAssignmentModal
          isOpen={showAssignModal}
          onClose={() => { setShowAssignModal(false); setSelectedLaptop(null); }}
          laptop={selectedLaptop}
          onSuccess={() => {
            toast.success('Assignment updated');
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['laptops'] });
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmReturn}
        onClose={() => setConfirmReturn(null)}
        onConfirm={performReturn}
        title="Return Device"
        message="Mark this device as returned to inventory? It will become available for assignment again."
        confirmLabel="Yes, Return"
        variant="warning"
        isLoading={isActing}
      />
    </div>
  );
};