import { useState } from 'react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  // System Metrics
  // Backend stuff goes here, temporarily using mock data 
  const [metrics] = useState({
    serverThroughput: "150 req/sec",
    activeConcurrentRequests: 100,
    memoryLatency: "45 ms",
    memoryOverhead: "1.2 GB",
    llmUsage: "95%"
  });

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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
      </div>

      {/* System Metrics */}
      <section className={styles.metricsSection}>
        <h2 className={styles.pageSubtitle}>System Performance</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h3>Server Throughput</h3>
            <p className={styles.metricValue}>{metrics.serverThroughput}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Concurrent Requests</h3>
            <p className={styles.metricValue}>{metrics.activeConcurrentRequests}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Average Memory Latency</h3>
            <p className={styles.metricValue}>{metrics.memoryLatency}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>Memory Overhead</h3>
            <p className={styles.metricValue}>{metrics.memoryOverhead}</p>
          </div>
          <div className={styles.metricCard}>
            <h3>LLM API Uptime</h3>
            <p className={styles.metricValue}>{metrics.llmUsage}</p>
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
    </div>
  );
};

export default AdminDashboard;