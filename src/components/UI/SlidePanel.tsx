/* ============================================================
   SLIDE PANEL — sp-* classes
   ============================================================ */

.sp-device-header {
  margin-bottom: 16px;
}

.sp-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.sp-device-tag {
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 5px;
  padding: 3px 8px;
}

.sp-device-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.sp-info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.sp-info-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
}

.sp-info-card-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 4px;
}

.sp-info-card-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: monospace;
}

.sp-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 20px 0 10px;
}

.sp-assignee-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  padding: 14px;
}

.sp-assignee-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.sp-assignee-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(96,165,250,0.15);
  color: #60a5fa;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sp-assignee-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.sp-assignee-email {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.sp-assignee-dept {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.sp-assignee-actions {
  display: flex;
  gap: 8px;
}

.sp-assignee-actions .btn {
  flex: 1;
  justify-content: center;
  font-size: 12px;
  padding: 7px 12px;
}

.sp-empty-assignment {
  background: var(--bg-elevated);
  border: 1px dashed var(--border-default);
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.sp-history-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.sp-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.sp-history-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.sp-history-dates {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.sp-history-notes {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border-subtle);
  font-style: italic;
}

.sp-fault-block,
.sp-notes-block {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.sp-fault-label,
.sp-notes-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.sp-fault-text,
.sp-notes-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.sp-action-btn-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 8px;
}

.sp-action-btn-full:hover {
  background: var(--bg-hover);
  border-color: var(--accent-green);
  color: var(--accent-green);
}

/* Employee panel specific */
.sp-employee-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.sp-employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(37,99,235,0.15);
  color: var(--accent-green);
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sp-employee-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.sp-contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.sp-device-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  transition: border-color 0.15s;
}

.sp-device-card:hover {
  border-color: var(--accent-green);
}

.sp-device-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.sp-device-card-tag {
  font-family: monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.sp-device-card-name {
  font-size: 13px;
  color: var(--text-secondary);
}

.sp-device-card-dates {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ============================================================
   CONFIRMATION MODAL (for critical actions)
   ============================================================ */

.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: confirmScale 0.2s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes confirmScale {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

.confirm-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirm-modal-icon.warning {
  background: rgba(245,158,11,0.12);
  color: #f59e0b;
}

.confirm-modal-icon.danger {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
}

.confirm-modal h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
}

.confirm-modal p {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24px;
}

.confirm-modal-actions {
  display: flex;
  gap: 10px;
}

.confirm-modal-actions .btn {
  flex: 1;
  justify-content: center;
}

/* ============================================================
   DROPDOWN FIX — always opens downward, scrollable
   ============================================================ */

.dropdown-portal {
  position: fixed !important;
  z-index: 9999 !important;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  min-width: 180px;
}

.dropdown-portal-item {
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-primary);
  transition: background 0.1s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-portal-item:hover {
  background: var(--bg-hover);
}

/* MultiSelect fix — always below, scrollable */
.multiselect-dropdown {
  position: absolute;
  top: calc(100% + 4px) !important;
  bottom: auto !important;
  left: 0;
  min-width: 100%;
  max-height: 240px;
  overflow-y: auto;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  z-index: 200;
}

/* Search input right padding for chevron */
.search-with-icon {
  position: relative;
}

.search-with-icon input,
.search-with-icon select {
  padding-right: 36px !important;
}

.search-with-icon .search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
}

/* ============================================================
   ERROR MESSAGES — structured
   ============================================================ */

.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.error-alert.error {
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  color: #ef4444;
}

.error-alert.warning {
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.25);
  color: #f59e0b;
}

.error-alert.info {
  background: rgba(96,165,250,0.08);
  border: 1px solid rgba(96,165,250,0.25);
  color: #60a5fa;
}

.error-alert-title {
  font-weight: 700;
  margin-bottom: 2px;
}

.error-alert-body {
  color: inherit;
  opacity: 0.85;
}

/* ============================================================
   MOBILE RESPONSIVE
   ============================================================ */

@media (max-width: 768px) {
  /* Slide panel full width on mobile */
  .slide-panel-inner {
    width: 100% !important;
    max-width: 100% !important;
  }

  .sp-info-row {
    grid-template-columns: 1fr !important;
  }

  .sp-assignee-actions {
    flex-direction: column;
  }

  /* Tables hidden, cards shown */
  .desktop-table-wrap { display: none !important; }
  .mobile-card-list   { display: flex !important; flex-direction: column; gap: 10px; padding: 12px; }

  .mobile-data-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-data-card-title {
    font-weight: 700;
    font-size: 14px;
    font-family: monospace;
  }

  .mobile-data-card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* Dashboard */
  .dashboard-grid        { grid-template-columns: 1fr !important; }
  .dashboard-stat-grid   { grid-template-columns: 1fr 1fr !important; }
  .dashboard-welcome     { flex-direction: column !important; gap: 12px !important; }
  .dashboard-header-right { width: 100%; }
  .dash-action-btn       { flex: 1; justify-content: center; }
  .detail-cols-grid      { grid-template-columns: 1fr !important; }
  .page-header           { flex-direction: column !important; gap: 12px !important; }

  /* Stat cards */
  .stat-value { font-size: 22px !important; }
  .stat-card  { padding: 14px !important; }

  /* Confirm modal full bottom sheet on mobile */
  .confirm-modal-overlay { align-items: flex-end; padding: 0; }
  .confirm-modal {
    border-radius: 16px 16px 0 0;
    max-width: 100%;
    padding: 24px 20px 32px;
  }
}

@media (min-width: 769px) {
  .mobile-card-list   { display: none !important; }
  .desktop-table-wrap { display: block !important; }
}

/* ============================================================
   DASHBOARD — smaller cards, single line layout
   ============================================================ */

.dashboard-stat-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.dashboard-stat-card {
  padding: 16px !important;
}

.dashboard-stat-card .stat-value {
  font-size: 26px;
}

.dashboard-stat-card .stat-label {
  font-size: 12px;
}

.dashboard-stat-card .dashboard-stat-meta {
  font-size: 11px;
}

/* Dashboard bottom section — single row on large screen */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }

  /* Bar chart fills remaining space when it wraps */
  .dashboard-grid > *:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-stat-grid {
    grid-template-columns: 1fr 1fr;
  }
}
