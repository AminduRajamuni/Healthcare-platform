import { useEffect, useState, useRef } from 'react';
import { Loader2, UploadCloud, Trash2, Download } from 'lucide-react';
import patientService from '../../services/patientService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  const patientId = localStorage.getItem('userId');

  const loadReports = async () => {
    try {
      if (!patientId) {
        setError('No patient ID found. Please log in again.');
        setLoading(false);
        return;
      }
      const data = await patientService.getMedicalReports(patientId);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load medical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await patientService.uploadMedicalReport(patientId, file, description);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadReports();
    } catch (err) {
      setError('Failed to upload report. Make sure the file is under 5MB and of a supported type.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!patientId) return;
    const confirmed = window.confirm('Delete this report? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await patientService.deleteMedicalReport(patientId, reportId);
      await loadReports();
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const handleDownload = (report) => {
    // Assuming there is a dedicated download endpoint in backend like /api/reports/{id}/download.
    // If not yet implemented, this can be wired later.
    window.open(`/api/reports/${report.id}/download`, '_blank');
  };

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="text-h2">Medical Reports</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Upload and manage your lab results, scans, and other documents.
            </p>
          </div>
        </div>

        <form className="glass-panel" onSubmit={handleUpload} style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UploadCloud size={24} style={{ color: 'var(--gradient-1)' }} />
            <div>
              <h2 className="text-h3" style={{ margin: 0 }}>Upload new report</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                Supported: PDF, images, Word documents. Max size 5MB.
              </p>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px', borderRadius: '8px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description (optional)</label>
            <input
              className="glass-input"
              placeholder="e.g. Blood test results, MRI scan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ flex: 1 }}
              accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
              style={{ whiteSpace: 'nowrap', opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : 'Upload'}
            </button>
          </div>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No medical reports uploaded yet.
          </div>
        ) : (
          <section className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {reports
              .slice()
              .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
              .map((report) => (
                <div key={report.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="text-h3" style={{ margin: 0 }}>{report.fileName}</h2>
                      {report.description && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                          {report.description}
                        </p>
                      )}
                    </div>
                    {report.uploadedAt && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(report.uploadedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleDownload(report)}
                    >
                      <Download size={16} /> Download
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)' }}
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
