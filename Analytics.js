import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: { 'x-auth-token': token }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Chart colors
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40', '#4BC0C0'
  ];

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>
      </div>
    );
  }

  const { totalApplications, scholarshipData, categoryStats, levelStats, mostPopular, leastPopular, leaderboard } = analytics || {};

  // Prepare pie chart data
  const pieData = scholarshipData?.filter(s => s.applicationCount > 0).slice(0, 10) || [];

  // Prepare bar chart data
  const barData = scholarshipData?.filter(s => s.applicationCount > 0).slice(0, 10) || [];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>📊 Scholarship Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>{totalApplications || 0}</div>
          <div style={{ color: '#666' }}>Total Applications</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff' }}>{mostPopular?.name || 'N/A'}</div>
          <div style={{ color: '#666' }}>Most Popular Scholarship</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545' }}>{leastPopular?.name || 'N/A'}</div>
          <div style={{ color: '#666' }}>Least Applied Scholarship</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeatmax(400px, 1fr(auto-fit, min))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pie Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📈 Application Distribution (Pie Chart)</h3>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              {pieData.map((item, index) => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: colors[index % colors.length] + '20',
                  borderRadius: '8px',
                  minWidth: '200px'
                }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    background: colors[index % colors.length],
                    borderRadius: '4px'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{item.name.substring(0, 25)}...</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.applicationCount} ({item.applicationRatio}%)</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No applications yet</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📊 Applications by Scholarship (Bar Graph)</h3>
          {barData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {barData.map((item, index) => (
                <div key={item.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{item.name.substring(0, 30)}...</span>
                    <span style={{ fontWeight: 'bold' }}>{item.applicationCount}</span>
                  </div>
                  <div style={{ 
                    height: '25px', 
                    background: '#f0f0f0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.max((item.applicationCount / (barData[0]?.applicationCount || 1)) * 100, 2)}%`,
                      background: colors[index % colors.length],
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No applications yet</p>
          )}
        </div>
      </div>

      {/* Category & Level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Category Distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>👥 Applications by Category (Caste)</h3>
          {categoryStats && categoryStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoryStats.map((cat, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{cat.caste || 'Unknown'}</span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: colors[index % colors.length] + '20',
                    borderRadius: '15px',
                    fontWeight: 'bold'
                  }}>{cat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No data available</p>
          )}
        </div>

        {/* Education Level Distribution */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>🎓 Applications by Education Level</h3>
          {levelStats && levelStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {levelStats.map((level, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{(level.education_level || 'Unknown').replace(/_/g, ' ')}</span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: colors[(index + 5) % colors.length] + '20',
                    borderRadius: '15px',
                    fontWeight: 'bold'
                  }}>{level.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#666' }}>No data available</p>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>🏆 Scholarship Leaderboard (Most to Least Applied)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Scholarship Name</th>
              <th>Level</th>
              <th>Category</th>
              <th>Amount (₹)</th>
              <th>Applications</th>
              <th>Ratio (%)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((scholarship, index) => (
                <tr key={scholarship.id} style={{ 
                  background: index < 3 ? (index === 0 ? '#fff3cd' : index === 1 ? '#f8f9fa' : '#fff3cd') : 'transparent'
                }}>
                  <td>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td>{scholarship.name}</td>
                  <td>{(scholarship.level || '').replace(/_/g, ' ').toUpperCase()}</td>
                  <td>{(scholarship.caste || []).join(', ').toUpperCase()}</td>
                  <td>₹{scholarship.amount?.toLocaleString()}</td>
                  <td style={{ fontWeight: 'bold' }}>{scholarship.applicationCount}</td>
                  <td>{scholarship.applicationRatio}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No applications yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Analytics;
