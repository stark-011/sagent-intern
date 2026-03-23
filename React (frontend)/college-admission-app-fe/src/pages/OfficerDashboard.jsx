import React, { useEffect, useState } from 'react';
import { getAllApplications, updateStatus } from '../services/api';

const OfficerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllApplications = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAllApplications();
      setApplications(Array.isArray(data) ? data : data?.applications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    setError('');

    try {
      const currentApplication = applications.find((application) => application.appId === id);
      await updateStatus(id, status, currentApplication);
      setApplications((prev) =>
        prev.map((application) =>
          application.appId === id ? { ...application, status } : application
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="page fade-in">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
          <span>Loading all applications...</span>
        </div>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No applications available.
                  </td>
                </tr>
              ) : (
                applications.map((application) => (
                  <tr key={application.appId}>
                    <td>{application.appId}</td>
                    <td>{application.studentName || application.user?.name || 'N/A'}</td>
                    <td>{application.courseName || application.course?.courseName || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${(application.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                        {application.status || 'Submitted'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleUpdateStatus(application.appId, 'Under Review')}
                          disabled={updatingId === application.appId}
                        >
                          Under Review
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => handleUpdateStatus(application.appId, 'Accepted')}
                          disabled={updatingId === application.appId}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleUpdateStatus(application.appId, 'Rejected')}
                          disabled={updatingId === application.appId}
                        >
                          Rejected
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OfficerDashboard;
