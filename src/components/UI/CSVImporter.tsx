import React, { useRef, useState } from 'react';
import { Upload, Download, FileText, X, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface CSVImporterProps {
  onImport: (data: any[]) => Promise<void>;
  sampleHeaders: string[];
  sampleRows?: string[][];
  title: string;
  id?: string;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({
  onImport,
  sampleHeaders,
  sampleRows = [],
  title,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = () => {
    const rows = [sampleHeaders, ...sampleRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_sample.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file.');
    }
  };

  const handleProcess = () => {
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        try {
          const data = results.data;
          const chunkSize = 50;
          const totalChunks = Math.ceil(data.length / chunkSize);

          for (let i = 0; i < totalChunks; i++) {
            const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
            await onImport(chunk);
          }

          setIsOpen(false);
          setFile(null);
        } catch (err: any) {
          setError(err.message || 'Failed to import data');
        } finally {
          setImporting(false);
        }
      },
      error: (err: any) => {
        setError(err.message);
        setImporting(false);
      }
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <button className="btn btn-secondary btn-sm" onClick={() => setIsOpen(true)} id={id}>
          <Upload size={14} /> Import CSV
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleDownloadSample}>
          <Download size={14} /> Sample CSV
        </button>
      </div>

      {isOpen && (
        <div className="import-modal-overlay">
          <div className="import-modal-card">
            <div className="import-modal-header">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-secondary" />
                <h3>Import {title}</h3>
              </div>
              <button className="btn-icon-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="import-modal-body">
              {!file ? (
                <div 
                  className="import-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="text-muted" style={{ marginBottom: 12 }} />
                  <p className="upload-main">Click to select CSV file</p>
                  <p className="upload-sub">or drag and drop file here</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".csv" 
                    style={{ display: 'none' }} 
                  />
                </div>
              ) : (
                <div className="import-file-selected">
                   <div className="file-box">
                      <FileText size={24} className="text-primary" />
                      <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button className="btn-icon-sm" onClick={() => setFile(null)}>
                        <X size={14} />
                      </button>
                   </div>
                </div>
              )}

              {error && (
                <div className="import-error">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="import-tips">
                <h4>Tips for import:</h4>
                <ul>
                  <li>Ensure headers match the sample CSV exactly.</li>
                  <li>Email addresses must be unique.</li>
                  <li>Dates should be in YYYY-MM-DD format.</li>
                </ul>
              </div>
            </div>

            <div className="import-modal-footer">
               <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Cancel</button>
               <button 
                className="btn btn-primary" 
                disabled={!file || importing}
                onClick={handleProcess}
               >
                {importing ? <span className="spinner" /> : <Check size={14} />}
                {importing ? 'Importing...' : 'Start Import'}
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .import-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .import-modal-card {
          width: 100%;
          max-width: 480px;
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .import-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .import-modal-header h3 { font-size: 16px; font-weight: 700; }
        .btn-icon-close {
          background: none; border: none; color: var(--text-muted); padding: 4px;
          cursor: pointer; border-radius: 4px; display: flex;
        }
        .btn-icon-close:hover { background: var(--bg-hover); color: var(--text-primary); }
        .import-modal-body { padding: 20px; }
        .import-upload-zone {
          border: 2px dashed var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .import-upload-zone:hover {
          border-color: var(--accent-red);
          background: rgba(225,29,72,0.02);
        }
        .upload-main { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .upload-sub { font-size: 12px; color: var(--text-muted); }
        .import-file-selected { padding: 20px 0; }
        .file-box {
          display: flex; align-items: center; gap: 12px; padding: 12px;
          background: var(--bg-elevated); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }
        .file-info { flex: 1; }
        .file-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .file-size { font-size: 11px; color: var(--text-muted); }
        .import-error {
          margin-top: 16px; padding: 10px 12px; background: rgba(239,68,68,0.05);
          border-left: 3px solid #ef4444; color: #ef4444; font-size: 12px;
          display: flex; gap: 8px; align-items: center;
        }
        .import-tips { margin-top: 24px; }
        .import-tips h4 { font-size: 12px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; color: var(--text-muted); }
        .import-tips ul { padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
        .import-tips li { font-size: 12px; color: var(--text-secondary); }
        .import-modal-footer {
          padding: 16px 20px; background: var(--bg-subtle); border-top: 1px solid var(--border-subtle);
          display: flex; justify-content: flex-end; gap: 12px;
        }
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};
