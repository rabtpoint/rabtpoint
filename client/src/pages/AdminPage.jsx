import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function AdminPage() {
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/admin/reports'), api('/admin/audit-logs')])
      .then(([reportData, logData]) => {
        setReports(reportData.reports || []);
        setLogs(logData.logs || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const updateReport = async (id, status) => {
    const data = await api(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    setReports((current) => current.map((report) => (report._id === id ? data.report : report)));
  };

  return (
    <main className="app-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Moderation dashboard</h2>
        </div>
        <a className="secondary-button" href="/">
          Back to app
        </a>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="public-sections">
        <article className="public-section-card">
          <h3>Reports</h3>
          {reports.length === 0 && <p className="muted">Koi open report nahi.</p>}
          {reports.map((report) => (
            <div key={report._id} className="session-card">
              <strong>
                {report.targetType} · {report.status}
              </strong>
              <p>{report.reason}</p>
              <p className="muted">By {report.reporter?.name || 'Unknown'}</p>
              <div className="auth-tabs">
                <button className="secondary-button" type="button" onClick={() => updateReport(report._id, 'reviewed')}>
                  Mark reviewed
                </button>
                <button className="secondary-button" type="button" onClick={() => updateReport(report._id, 'dismissed')}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </article>

        <article className="public-section-card">
          <h3>Audit logs</h3>
          {logs.slice(0, 20).map((log) => (
            <div key={log._id} className="session-card">
              <strong>{log.action}</strong>
              <p className="muted">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
