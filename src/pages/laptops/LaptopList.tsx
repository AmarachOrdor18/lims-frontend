import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Hash, Eye,
  Monitor, Activity, UserCheck, UserPlus, ArrowLeftRight,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  ChevronsUpDown, ChevronUp, ChevronDown,
  RefreshCw, SlidersHorizontal, Download,
} from 'lucide-react';
import { Badge }                from '../../components/UI/Badge';
import { EmptyState }           from '../../components/UI/EmptyState';
import { CSVImporter }          from '../../components/UI/CSVImporter';
import { AssetAssignmentModal } from '../../components/Modals/AssetAssignmentModal';
import { LaptopDetailPanel }    from './LaptopDetailPanel';
import { LaptopFormPanel }      from './LaptopFormPanel';
import { api }                  from '../../api';
import { toast }                from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import type { Laptop } from '../../types';

// ─── Filter state type ────────────────────────────────────────────────────────
interface LaptopFilters {
  search:       string;
  asset_tag:    string;
  model:        string;
  serial_number: string;
  brands:       string[];
  statuses:     string[];
  conditions:   string[];
}

const EMPTY_FILTERS: LaptopFilters = {
  search: '', asset_tag: '', model: '', serial_number: '', brands: [], statuses: [], conditions: [],
};

const BRAND_OPTIONS   = ['Dell','Apple','HP','Lenovo','Microsoft','ASUS','Acer','Samsung'];
const STATUS_OPTIONS  = ['AVAILABLE','ASSIGNED','RETIRED'];
const CONDITION_OPTIONS = ['FUNCTIONAL','FAULTY'];

// ─── Tiny shared sub-components ───────────────────────────────────────────────

function AccordionSection({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: `1px solid var(--border-default)` }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '12px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
        }}
      >
        {title}
        <ChevronDown
          size={15}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--text-muted)' }}
        />
      </button>
      {open && <div style={{ padding: '4px 20px 16px' }}>{children}</div>}
    </div>
  );
}

function FilterSelect({
  label, value, options, onChange, allLabel,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void; allLabel: string }) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.5px' }}>
        {label}
      </span>
      <select
        className="form-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid var(--border-default)`,
          borderRadius: 5,
          padding: '8px 10px',
          color: 'var(--text-primary)',
          fontSize: 13,
        }}
      >
        <option value="">{allLabel}</option>
        {options.map(o => (
          <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
        ))}
      </select>
    </div>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--accent-green-surface)', color: 'var(--accent-green)', fontSize: 11,
      padding: '2px 8px', borderRadius: 4, fontWeight: 500,
    }}>
      {label}
      <button
        type="button" onClick={onRemove}
        style={{ background: 'none', border: 'none', color: 'var(--accent-green)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}
      >×</button>
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
export const LaptopList: React.FC = () => {
  const queryClient  = useQueryClient();
  const [searchParams] = useSearchParams();

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [filters,        setFilters]        = useState<LaptopFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<LaptopFilters>(EMPTY_FILTERS);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'asset_tag', direction: 'asc' });
  const [page, setPage] = useState(1);

  // Slide panel states
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailLaptopId, setDetailLaptopId]   = useState<string | null>(null);
  const [formPanelOpen, setFormPanelOpen]     = useState(false);
  const [formLaptopId, setFormLaptopId]       = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop]   = useState<Laptop | null>(null);

  // Sync URL params → filters on first load
  useEffect(() => {
    const s = searchParams.get('status');
    const c = searchParams.get('condition');
    const a = searchParams.get('add');

    if (s || c) {
      const patch = { statuses: s ? s.split(',') : [], conditions: c ? c.split(',') : [] };
      setFilters(f => ({ ...f, ...patch }));
      setPendingFilters(f => ({ ...f, ...patch }));
    }

    if (a === 'true') {
      setFormLaptopId(null);
      setFormPanelOpen(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      window.history.replaceState(null, '', `${window.location.pathname}${newParams.toString() ? `?${newParams.toString()}` : ''}`);
    }
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [filters, sortConfig]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['laptops', page, filters, sortConfig],
    queryFn: async ({ signal }) => {
      let q = `?page=${page}&limit=20`;
      if (filters.statuses.length)      q += `&status=${filters.statuses.join(',')}`;
      if (filters.conditions.length)    q += `&condition=${filters.conditions.join(',')}`;
      if (filters.brands.length)        q += `&brand=${filters.brands.join(',')}`;
      if (filters.search)               q += `&q=${encodeURIComponent(filters.search)}`;
      if (filters.asset_tag)            q += `&asset_tag=${encodeURIComponent(filters.asset_tag)}`;
      if (filters.model)                q += `&model=${encodeURIComponent(filters.model)}`;
      if (filters.serial_number)        q += `&serial_number=${encodeURIComponent(filters.serial_number)}`;
      q += `&sort_by=${sortConfig.key}&sort_dir=${sortConfig.direction}`;
      return api.get(`/laptops${q}`, signal);
    },
    placeholderData: prev => prev,
  });

  const rawLaptops: Laptop[] = response?.data  ?? [];
  const total:      number   = response?.total ?? 0;
  
  // ── Client-side filtering fallback ─────────────────────────────────────────
  const laptops = rawLaptops.filter(lp => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match = lp.asset_tag.toLowerCase().includes(s) || 
                    lp.brand.toLowerCase().includes(s) || 
                    lp.model.toLowerCase().includes(s) ||
                    lp.serial_number.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (filters.asset_tag && !lp.asset_tag.toLowerCase().includes(filters.asset_tag.toLowerCase())) return false;
    if (filters.model && !lp.model.toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (filters.serial_number && !lp.serial_number.toLowerCase().includes(filters.serial_number.toLowerCase())) return false;
    
    return true;
  });

  // ── Excel export helper ────────────────────────────────────────────────────
  function downloadExcel(filename: string, rows: Laptop[]) {
    if (!rows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laptops');
    XLSX.writeFile(workbook, filename.replace('.csv', '.xlsx'));
  }

  // ── CSV import helper ──────────────────────────────────────────────────────
  const normalizeKey = (row: Record<string, string>, possible: string[]) => {
    const key = Object.keys(row).find(k => possible.includes(k.trim().toLowerCase()));
    return key ? row[key] : null;
  };

  // ── CSV import handler ─────────────────────────────────────────────────────
  const handleImport = async (data: Record<string, string>[]) => {
    try {
      const res = await api.post('/laptops/bulk', {
        laptops: data.map(i => ({
          brand:         normalizeKey(i, ['brand']),
          model:         normalizeKey(i, ['model']),
          serial_number: normalizeKey(i, ['serial number', 'serial_number', 'sn', 'serial']),
          purchase_date: normalizeKey(i, ['purchase date', 'purchase_date']) || null,
          condition:     (normalizeKey(i, ['condition']) ?? 'FUNCTIONAL').toUpperCase(),
          status:        (normalizeKey(i, ['status'])    ?? 'AVAILABLE').toUpperCase(),
        })),
      });
      
      if (res.errors && res.errors.length > 0) {
        const msg = `Imported ${res.count} items. Errors: ${res.errors.map((e: any) => e.error).join(', ')}`;
        throw new Error(msg);
      }
      
      toast.success(`Successfully imported ${res.count} laptops`);
      queryClient.invalidateQueries({ queryKey: ['laptops'] });
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
      throw err; // Re-throw so CSVImporter shows the error
    }
  };

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleSort = (key: string) =>
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));

  const applyFilters = () => { setFilters({ ...pendingFilters }); setFilterOpen(false); };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPendingFilters(EMPTY_FILTERS);
  };

  const hasFilters =
    !!(filters.search || filters.asset_tag || filters.model || filters.serial_number ||
       filters.brands.length || filters.statuses.length || filters.conditions.length);

  const openAssignModal = (laptop: Laptop) => {
    if (laptop.status === 'RETIRED') {
      toast.error('Retired laptops cannot be assigned');
      return;
    }
    setSelectedLaptop(laptop);
    setDetailPanelOpen(false);
    setAssignModalOpen(true);
  };

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / 20) || 1;
  const pageFrom   = total === 0 ? 0 : (page - 1) * 20 + 1;
  const pageTo     = Math.min(total, page * 20);

  // ── Get assigned employee name — backend returns this flat ─────────────────
  const getAssigneeName = (lp: any): string => {
    return lp.assigned_to_name ?? '—';
  };

  // ── Inline style objects ───────────────────────────────────────────────────
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
      color: 'var(--text-secondary)', cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.35 : 1,
    }),
    expItem: (): React.CSSProperties => ({
      display: 'block', width: '100%', padding: '9px 14px', textAlign: 'left',
      background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
    }),
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)', padding: '12px 10px' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Inventory</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{total} devices registered</p>
        </div>
        <div className="list-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="search-input-wrap hide-on-mobile" style={{ position: 'relative' }}>
            <Monitor size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Quick search laptops..." 
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ padding: '8px 12px 8px 32px', borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, width: 220 }}
            />
          </div>
          <button type="button" style={S.iconBtn()} title="Refresh" onClick={() => refetch()}><RefreshCw size={14} /></button>
          <button type="button" style={S.iconBtn(filterOpen)} title="Filters"
            onClick={() => { setPendingFilters(filters); setFilterOpen(o => !o); }}>
            <SlidersHorizontal size={14} />
          </button>

          {/* Export dropdown */}
          <div ref={exportRef} style={{ position: 'relative' }} className="hide-on-mobile">
            <button type="button" style={S.iconBtn()} title="Export" onClick={() => setExportOpen(o => !o)}>
              <Download size={14} />
            </button>
            {exportOpen && (
              <div style={{ position: 'absolute', right: 0, top: 38, background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 8, minWidth: 160, zIndex: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <button style={S.expItem()} onClick={() => { downloadExcel('laptops.xlsx', laptops); setExportOpen(false); }}>Export to Excel</button>
              </div>
            )}
          </div>

          <div className="hide-on-mobile">
            <CSVImporter
              onImport={handleImport}
              sampleHeaders={['Brand','Model','Serial Number','Purchase Date','Condition','Status']}
              sampleRows={[
                ['Dell', 'XPS 15', 'SN12345', '2023-01-15', 'FUNCTIONAL', 'AVAILABLE'],
                ['Apple', 'MacBook Pro', 'SN67890', '2023-05-20', 'FUNCTIONAL', 'ASSIGNED'],
                ['HP', 'EliteBook', 'SN11223', '2022-11-10', 'FAULTY', 'RETIRED']
              ]}
              title="Laptops"
              tips={[
                'Headers must match sample CSV.',
                'Serial numbers must be unique.',
                'Condition: FUNCTIONAL or FAULTY.',
                'Status: AVAILABLE, ASSIGNED, or RETIRED.',
                'Date format: YYYY-MM-DD.'
              ]}
            />
          </div>

          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-green)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setFormLaptopId(null); setFormPanelOpen(true); }}
          >
            <Plus size={14} /> Add Laptop
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {filterOpen && (
        <div style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
          <AccordionSection title="Status" defaultOpen>
            <FilterSelect label="Status" value={pendingFilters.statuses[0] ?? ''} options={STATUS_OPTIONS} allLabel="All Statuses"
              onChange={v => setPendingFilters(f => ({ ...f, statuses: v ? [v] : [] }))} />
          </AccordionSection>
          <AccordionSection title="Condition" defaultOpen>
            <FilterSelect label="Condition" value={pendingFilters.conditions[0] ?? ''} options={CONDITION_OPTIONS} allLabel="All Conditions"
              onChange={v => setPendingFilters(f => ({ ...f, conditions: v ? [v] : [] }))} />
          </AccordionSection>
          <AccordionSection title="Brand">
            <FilterSelect label="Brand" value={pendingFilters.brands[0] ?? ''} options={BRAND_OPTIONS} allLabel="All Brands"
              onChange={v => setPendingFilters(f => ({ ...f, brands: v ? [v] : [] }))} />
          </AccordionSection>
          <AccordionSection title="Search">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Asset Tag</span>
                <input value={pendingFilters.asset_tag} onChange={e => setPendingFilters(f => ({ ...f, asset_tag: e.target.value }))}
                  placeholder="Search asset tag…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Model</span>
                <input value={pendingFilters.model} onChange={e => setPendingFilters(f => ({ ...f, model: e.target.value }))}
                  placeholder="Search model…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase' }}>Serial Number</span>
                <input value={pendingFilters.serial_number} onChange={e => setPendingFilters(f => ({ ...f, serial_number: e.target.value }))}
                  placeholder="Search serial…"
                  style={{ width: '100%', background: 'var(--bg-base)', border: `1px solid var(--border-default)`, borderRadius: 5, padding: '8px 10px', color: 'var(--text-primary)', fontSize: 13 }} />
              </div>
            </div>
          </AccordionSection>
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', justifyContent: 'flex-end' }}>
            <button type="button" style={{ padding: '7px 14px', background: 'none', border: `1px solid var(--border-default)`, borderRadius: 6, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }} onClick={() => setFilterOpen(false)}>Cancel</button>
            <button type="button" style={{ padding: '7px 14px', background: 'var(--accent-green)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={applyFilters}>Apply</button>
          </div>
        </div>
      )}

      {/* Active filter tags */}
      {hasFilters && (
        <div style={{ marginBottom: 12 }}>
          <button type="button"
            style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--accent-green)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={resetFilters}>Clear filters</button>
        </div>
      )}

      {hasFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 16px', borderBottom: `1px solid var(--border-default)`, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active:</span>
          {filters.search        && <Tag label={`Search: ${filters.search}`}         onRemove={() => setFilters(f => ({ ...f, search: '' }))} />}
          {filters.asset_tag     && <Tag label={`Asset Tag: ${filters.asset_tag}`} onRemove={() => setFilters(f => ({ ...f, asset_tag: '' }))} />}
          {filters.model         && <Tag label={`Model: ${filters.model}`}           onRemove={() => setFilters(f => ({ ...f, model: '' }))} />}
          {filters.serial_number && <Tag label={`S/N: ${filters.serial_number}`}     onRemove={() => setFilters(f => ({ ...f, serial_number: '' }))} />}
          {filters.brands.map(b     => <Tag key={b} label={b}  onRemove={() => setFilters(f => ({ ...f, brands:     f.brands.filter(x => x !== b) }))} />)}
          {filters.statuses.map(s   => <Tag key={s} label={s}  onRemove={() => setFilters(f => ({ ...f, statuses:   f.statuses.filter(x => x !== s) }))} />)}
          {filters.conditions.map(c => <Tag key={c} label={c}  onRemove={() => setFilters(f => ({ ...f, conditions: f.conditions.filter(x => x !== c) }))} />)}
        </div>
      )}

      {/* Body */}
      <div style={{ background: 'var(--bg-surface)', border: `1px solid var(--border-default)`, borderRadius: 8, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner mx-auto" /></div>
        ) : laptops.length === 0 ? (
          <EmptyState icon={<Hash size={24} />} title="No laptops found" description="Add a laptop or import a CSV to get started." />
        ) : (
          <>
            <div className="desktop-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th()} onClick={() => handleSort('asset_tag')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Asset Tag<SortChevron col="asset_tag" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('model')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Monitor size={11} />Device<SortChevron col="model" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('serial_number')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Serial<SortChevron col="serial_number" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('status')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Activity size={11} />Status<SortChevron col="status" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th()} onClick={() => handleSort('condition')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Condition<SortChevron col="condition" sortConfig={sortConfig} /></div>
                  </th>
                  <th style={S.th(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>Assigned To</div>
                  </th>
                  <th style={{ ...S.th(false), textAlign: 'center', width: 132 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {laptops.map((lp) => (
                  <tr
                    key={lp.id}
                    id={`laptop-row-${lp.id}`}
                    style={{ cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setDetailLaptopId(lp.id); setDetailPanelOpen(true); }}
                  >
                    <td style={{ ...S.td(), fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }}>{lp.asset_tag}</td>
                    <td style={{ ...S.td(), fontWeight: 500 }}>{lp.brand} {lp.model}</td>
                    <td style={{ ...S.td(true), fontFamily: 'monospace', fontSize: 12 }}>{lp.serial_number}</td>
                    <td style={S.td()}><Badge status={lp.status} /></td>
                    <td style={S.td()}><Badge status={lp.condition} /></td>
                    <td style={S.td(true)}>{getAssigneeName(lp)}</td>
                    <td style={{ ...S.td(false), textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                        <button type="button" style={S.actBtn()} title="View Details"
                          onClick={() => { setDetailLaptopId(lp.id); setDetailPanelOpen(true); }}>
                          <Eye size={13} />
                        </button>
                                {lp.status === 'AVAILABLE' && (
                          <button
                            type="button"
                            style={{ ...S.actBtn(), color: 'var(--status-available-text)', borderColor: 'var(--status-available-text)', background: 'rgba(34, 197, 94, 0.08)' }}
                            title="Assign Laptop"
                            onClick={() => openAssignModal(lp)}
                          >
                            <UserPlus size={13} />
                          </button>
                        )}
                        {lp.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            style={{ ...S.actBtn(), color: 'var(--status-assigned-text)', borderColor: 'var(--status-assigned-text)', background: 'rgba(96, 165, 250, 0.08)' }}
                            title="Reassign Laptop"
                            onClick={() => openAssignModal(lp)}
                          >
                            <ArrowLeftRight size={13} />
                          </button>
                        )}
                        {lp.status === 'RETIRED' && (
                          <button
                            type="button"
                            style={{ ...S.actBtn(), opacity: 0.3, cursor: 'not-allowed' }}
                            title="Retired — cannot be assigned"
                            disabled
                          >
                            <UserCheck size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {laptops.map((lp) => (
              <div key={`mobile-${lp.id}`} className="mobile-data-card" onClick={() => { setDetailLaptopId(lp.id); setDetailPanelOpen(true); }}>
                <div className="mobile-data-card-title">{lp.asset_tag}</div>
                <div className="mobile-data-card-row"><span>{lp.brand} {lp.model}</span><Badge status={lp.status} /></div>
                <div className="mobile-data-card-row"><span>{lp.serial_number}</span><Badge status={lp.condition} /></div>
                <div className="mobile-data-card-row">
                  <span>{getAssigneeName(lp)}</span>
                  <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <button type="button" style={S.actBtn()} title="View Details" onClick={() => { setDetailLaptopId(lp.id); setDetailPanelOpen(true); }}>
                      <Eye size={13} />
                    </button>
                    {lp.status === 'AVAILABLE' && (
                      <button
                        type="button"
                        style={{ ...S.actBtn(), color: 'var(--status-available-text)', borderColor: 'var(--status-available-text)', background: 'rgba(34, 197, 94, 0.08)' }}
                        title="Assign Laptop"
                        onClick={() => openAssignModal(lp)}
                      >
                        <UserPlus size={13} />
                      </button>
                    )}
                    {lp.status === 'ASSIGNED' && (
                      <button
                        type="button"
                        style={{ ...S.actBtn(), color: '#60a5fa', borderColor: '#60a5fa' }}
                        title="Reassign Laptop"
                        onClick={() => openAssignModal(lp)}
                      >
                        <ArrowLeftRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        {/* PAGINATION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid var(--border-default)`, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Showing {pageFrom}–{pageTo} of {total}</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" disabled={page <= 1} style={S.pagBtn(page <= 1)} onClick={() => setPage(1)}><ChevronsLeft  size={12} /></button>
              <button type="button" disabled={page <= 1} style={S.pagBtn(page <= 1)} onClick={() => setPage(p => p - 1)}><ChevronLeft   size={12} /></button>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 4px', whiteSpace: 'nowrap' }}>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" disabled={page >= totalPages} style={S.pagBtn(page >= totalPages)} onClick={() => setPage(p => p + 1)}><ChevronRight  size={12} /></button>
              <button type="button" disabled={page >= totalPages} style={S.pagBtn(page >= totalPages)} onClick={() => setPage(totalPages)}><ChevronsRight size={12} /></button>
            </div>
            <select
              style={{ background: 'var(--bg-elevated)', border: `1px solid var(--border-default)`, borderRadius: 5, color: 'var(--text-primary)', fontSize: 12, padding: '4px 6px', cursor: 'pointer', marginLeft: 4 }}
              defaultValue={20}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* SLIDE PANELS */}
      <LaptopDetailPanel
        isOpen={detailPanelOpen}
        onClose={() => setDetailPanelOpen(false)}
        laptopId={detailLaptopId}
        onDataChange={() => queryClient.invalidateQueries({ queryKey: ['laptops'] })}
        onOpenEditForm={(id) => { setFormLaptopId(id); setFormPanelOpen(true); }}
      />

      <LaptopFormPanel
        isOpen={formPanelOpen}
        onClose={() => setFormPanelOpen(false)}
        laptopId={formLaptopId}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['laptops'] })}
      />

      <AssetAssignmentModal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setSelectedLaptop(null); }}
        laptop={selectedLaptop}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['laptops'] })}
      />
    </div>
  );
};
