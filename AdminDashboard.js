import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalApplications: 0, submittedApplications: 0, approvedApplications: 0 });
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      const [statsRes, usersRes, appsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers }),
        axios.get('http://localhost:5000/api/admin/applications', { headers }),
        axios.get('http://localhost:5000/api/admin/logs', { headers })
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setApplications(appsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="container">Loading dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <nav className="navbar">
        <span className="navbar-brand">🎓 Admin Dashboard</span>
        <div className="navbar-links">
          <button onClick={() => setActiveTab('dashboard')} className="nav-link" style={{ background: activeTab === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none' }}>Dashboard</button>
          <button onClick={() => setActiveTab('users')} className="nav-link" style={{ background: activeTab === 'users' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none' }}>Users</button>
          <button onClick={() => setActiveTab('applications')} className="nav-link" style={{ background: activeTab === 'applications' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none' }}>Applications</button>
          <button onClick={() => setActiveTab('logs')} className="nav-link" style={{ background: activeTab === 'logs' ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none' }}>Logs</button>
          <Link to="/admin/scholarships" className="nav-link">Manage Scholarships</Link>
          <button onClick={handleLogout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {activeTab === 'dashboard' && (
          <>
            <h1>Dashboard Overview</h1>
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalApplications}</div>
                <div className="stat-label">Total Applications</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.submittedApplications}</div>
                <div className="stat-label">Submitted Applications</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.approvedApplications}</div>
                <div className="stat-label">Approved Applications</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h1>All Users</h1>
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Caste</th>
                    <th>Education</th>
                    <th>Created At</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{user.caste?.toUpperCase() || 'N/A'}</td>
                      <td>{user.education_level || 'N/A'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'applications' && (
          <>
            <h1>All Applications</h1>
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Scholarship</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Applied At</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>{app.first_name} {app.last_name}</td>
                      <td>{app.email}</td>
                      <td>{app.phone || 'N/A'}</td>
                      <td>{app.scholarship_name}</td>
                      <td>₹{app.amount}</td>
                      <td>{app.status.toUpperCase()}</td>
                      <td>{new Date(app.applied_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <>
            <h1>Activity Logs</h1>
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td>{log.first_name ? `${log.first_name} ${log.last_name}` : 'System'}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
