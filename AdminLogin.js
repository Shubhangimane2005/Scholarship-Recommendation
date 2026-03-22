import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/admin/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1e3c72',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4
      }}></div>
      
      {/* Headline */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.95)',
        padding: '15px 40px',
        borderRadius: '50px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1e3c72'
        }}>
          Scholarships empower students through education.
        </h2>
      </div>
      
      {/* Back Arrow */}
      <button 
        onClick={() => navigate('/login')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '45px',
          height: '45px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '1.2rem'
        }}
        title="Back to Login"
      >
        ←
      </button>
      
      <div className="auth-card" style={{ position: 'relative', zIndex: 1, marginTop: '60px' }}>
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">Access the admin dashboard</p>
        
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
