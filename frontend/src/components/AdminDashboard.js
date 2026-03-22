import { useState, useEffect, useCallback } from 'react';
import styles from './AdminDashboard.module.css';
import { API_BASE, adminHeaders } from '../config/api';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setError('');
    const headers = {
      'Content-Type': 'application/json',
      ...adminHeaders(),
    };

    setLoadingMetrics(true);
    setLoadingUsers(true);

    try {
      const [mRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/admin/metrics`, { headers }),
        fetch(`${API_BASE}/admin/users`, { headers }),
      ]);

      const mData = await mRes.json();
      const uData = await uRes.json();

      if (!mData.success) {
        setError(mData.message || 'Failed to load metrics.');
      } else {
        setMetrics({
          serverThroughput: mData.serverThroughput,
          activeConcurrentRequests: mData.activeConcurrentRequests,
          memoryLatency: mData.memoryLatency,
          memoryOverhead: mData.memoryOverhead,
          llmUsage: mData.llmUsage,
        });
      }

      if (!uData.success) {
        setError((prev) =>
          prev
            ? `${prev} ${uData.message || 'Failed to load users.'}`
            : uData.message || 'Failed to load users.'
        );
      } else {
        setUsers(uData.users || []);
      }
    } catch (e) {
      console.error(e);
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setLoadingMetrics(false);
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders(),
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.message || 'Could not delete user.');
      }
    } catch (e) {
      console.error(e);
      alert('Request failed.');
    }
  };

  const metricVal = (key, fallback = '—') => {
    if (loadingMetrics) return 'Loading…';
    if (!metrics) return fallback;
    const v = metrics[key];
    return v != null && v !== '' ? String(v) : fallback;
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
      </div>

      {error && (
        <div
          style={{
            color: '#b71c1c',
            background: '#ffebee',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <section className={styles.metricsSection}>
        <h2 className={styles.pageSubtitle}>System Performance</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h3>Server Throughput</h3>
            <p className={styles.metricValue}>
              {metricVal('serverThroughput')}
            </p>
          </div>
          <div className={styles.metricCard}>
            <h3>Concurrent Requests</h3>
            <p className={styles.metricValue}>
              {metricVal('activeConcurrentRequests', '0')}
            </p>
          </div>
          <div className={styles.metricCard}>
            <h3>Average Memory Latency</h3>
            <p className={styles.metricValue}>{metricVal('memoryLatency')}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Memory Overhead</h3>
            <p className={styles.metricValue}>{metricVal('memoryOverhead')}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>LLM API Uptime</h3>
            <p className={styles.metricValue}>{metricVal('llmUsage')}</p>
          </div>
        </div>
      </section>

      <section className={styles.usersSection}>
        <h1 className={styles.pageSubtitle}>Registered Users</h1>
        <div className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Saved Itineraries</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No registered users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.savedTrips}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          user.status === 'Active'
                            ? styles.active
                            : styles.suspended
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
