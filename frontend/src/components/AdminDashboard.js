import { useEffect, useState } from 'react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  // System Metrics
  // Backend stuff goes here, temporarily using mock data 
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [metrics, setMetrics] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  fetch(`${BACKEND_URL}/admin/metrics`)
    .then(res => res.json())
    .then(data => setMetrics(data))
    .catch(() => setError("Failed to load system metrics"));
}, []);

  // Mock User Data
  // Backend stuff goes here, temporarily using mock data 
  const [users, setUsers] = useState([
    { id: '01', name: 'Jane Doe', email: 'janedoe@example.com', savedTrips: 4, status: 'Active' },
    { id: '02', name: 'John Doe', email: 'johndoe@example.com', savedTrips: 1, status: 'Active' },
    { id: '03', name: 'Mary Jane', email: 'maryjane@example.com', savedTrips: 12, status: 'Suspended' },
  ]);

  const handleDeleteUser = (id) => {
  // Backend stuff goes here, temporarily using mock data 
    if(window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  {/* CHANGE to variables for backend/db */}
 const [sourceName, setSourceName] = useState(
  process.env.REACT_APP_SOURCE_NAME || "Nominatim OpenStreetMap API"
);

const [sourceUrl, setSourceUrl] = useState(
  process.env.REACT_APP_SOURCE_URL || "https://nominatim.openstreetmap.org/search"
);


  return (
    <div className={styles.dashboardContainer}>
      {error && (
  <div style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>
    {error}
  </div>
)}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
      </div>

      {/* System Metrics */}
      <section className={styles.metricsSection}>
        <h2 className={styles.pageSubtitle}>System Performance</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h3>Server Throughput</h3>
            <p className={styles.metricValue}>
  {metrics ? metrics.serverThroughput : "Loading..."}
</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Concurrent Requests</h3>
            <p className={styles.metricValue}>
  {metrics ? metrics.activeConcurrentRequests : "Loading..."}
</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Average Memory Latency</h3>
            <p className={styles.metricValue}>
  {metrics ? metrics.memoryLatency : "Loading..."}
</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Memory Overhead</h3>
            <p className={styles.metricValue}>
  {metrics ? metrics.memoryOverhead : "Loading..."}
</p>
          </div>
          <div className={styles.metricCard}>
            <h3>LLM API Uptime</h3>
            <p className={styles.metricValue}>
  {metrics ? metrics.llmUsage : "Loading..."}
</p>
          </div>
        </div>
      </section>

      {/* User List */}
      <section className={styles.usersSection}>
        <h1 className={styles.pageSubtitle}>Registered Users</h1>
        <p></p>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.savedTrips}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.status === 'Active' ? styles.active : styles.suspended}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.deleteBtn} 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    {/* Source of Cities Data*/}
       <section className={styles.dataSourceSection}>
        <div>
          <h1 className={styles.pageSubtitle}>Data Source for Cities</h1>
          <p></p>
        <div className={styles.dataSourceCard}>
          {/* CHANGE to have variable that pulls data source from DB */}
           {isEditing ? (
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className={styles.sourceInput}
              placeholder="Enter source name"
            />
          ) : (
            <p className={styles.sourceName}>{sourceName}</p>
          )}

            {isEditing ? (
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className={styles.sourceInput}
            />
          ) : (
            <p className={styles.sourceUrl}>{sourceUrl}</p>
          )}

          <button
            className={styles.editSaveButton}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
        </div>
        </section>

    </div>

  );
};

export default AdminDashboard;