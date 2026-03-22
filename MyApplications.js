import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyApplications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching applications with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('You are not logged in. Please login again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/applications/my', {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Applications fetched successfully:', response.data.length);
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 400) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.msg || err.response?.data?.error || 'Failed to fetch applications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLevelName = (level) => {
    const levels = {
      'junior_kg': 'Junior KG',
      'senior_kg': 'Senior KG',
      '1st_to_10th': 'Class 1-10',
      '11th_12th': 'Class 11-12',
      'diploma': 'Diploma',
      'graduate': 'Graduate (UG)',
      'post_graduate': 'Post Graduate (PG)',
      'master': "Master's"
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>📋 My Applications</h1>
        <button onClick={fetchApplications} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
          🔄 Refresh
        </button>
      </div>
      
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '10px' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>You haven't applied for any scholarships yet.</p>
          <Link to="/scholarships" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Browse Scholarships
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {applications.map(app => (
            <div key={app.id} className="card" style={{ border: '2px solid #28a745', borderRadius: '10px' }}>
              <h3 style={{ color: '#007bff', marginBottom: '0.5rem' }}>{app.scholarship_name}</h3>
              
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>📚 Level:</strong> {getLevelName(app.level)}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>💰 Amount:</strong> ₹{app.amount?.toLocaleString() || 'N/A'}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>📅 Applied on:</strong> {new Date(app.applied_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>
                  <strong>📌 Status:</strong> 
                  <span style={{ 
                    background: app.status === 'submitted' ? '#ffc107' : app.status === 'approved' ? '#28a745' : '#dc3545',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginLeft: '0.5rem',
                    fontSize: '0.9rem'
                  }}>
                    {app.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
              </div>
              
              {/* Official Apply Link - PROMINENTLY DISPLAYED */}
              {app.apply_link ? (
                <div style={{ background: '#fff3cd', padding: '1rem', borderRadius: '5px', border: '2px solid #ffc107', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#856404', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔗 Official Apply Link
                  </h4>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#666' }}>
                    Click below to complete your application on the official scholarship website:
                  </p>
                  <a 
                    href={app.apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      display: 'block', 
                      background: '#007bff', 
                      color: 'white', 
                      padding: '12px 20px', 
                      textDecoration: 'none', 
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: '1rem'
                    }}
                  >
                    🌐 Apply on Official Website
                  </a>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#666', wordBreak: 'break-all' }}>
                    {app.apply_link}
                  </p>
                </div>
              ) : (
                <div style={{ background: '#e7f3ff', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    ℹ️ Official apply link not available for this scholarship.
                  </p>
                </div>
              )}
              
              <div style={{ background: '#d4edda', padding: '1rem', borderRadius: '5px', border: '2px solid #28a745' }}>
                <p style={{ color: '#155724', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ✅ Application Submitted Successfully!
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {applications.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/scholarships" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Apply for More Scholarships
          </Link>
        </div>
      )}
    </div>
  );
}

export default MyApplications;
