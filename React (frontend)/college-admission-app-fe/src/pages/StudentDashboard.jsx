import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteApplication, getApplications } from '../services/api';

const StudentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      setLoading(true);
      setError('');

      try {
        const data = await getApplications();
        const list = Array.isArray(data) ? data : data?.applications || [];
        const filtered = list.filter((application) => {
          if (!currentUser) return true;
          const appUserId = application?.user?.userId || application?.user?.id;
          if (currentUser.userId && appUserId) return Number(appUserId) === Number(currentUser.userId);
          return (application?.user?.email || '').toLowerCase() === (currentUser.email || '').toLowerCase();
        });
        setApplications(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const canCancel = (status) => (status || '').toUpperCase() === 'SUBMITTED';

  const handleCancel = async (id) => {
    setActionLoadingId(id);
    setError('');

    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((application) => application.appId !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="page fade-in">
      <div className="page-header">
        <h2>Student Dashboard</h2>
        <Link to="/apply" className="btn btn-primary">
          New Application
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
          <span>Loading applications...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="card empty-card">No applications found. Start a new application.</div>
      ) : (
        <div className="card-grid">
          {applications.map((application) => (
            <article className="card application-card" key={application.appId}>
              <h3>Application #{application.appId}</h3>
              <p>
                <strong>Course:</strong>{' '}
                {application.courseName || application.course?.courseName || application.course?.name || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`status-pill ${(application.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {application.status || 'Submitted'}
                </span>
              </p>
              <p>
                <strong>Payment:</strong> {application.paymentStatus || 'Pending'}
              </p>

              {canCancel(application.status) && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleCancel(application.appId)}
                  disabled={actionLoadingId === application.appId}
                >
                  {actionLoadingId === application.appId ? <span className="spinner" /> : 'Cancel'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default StudentDashboard;
