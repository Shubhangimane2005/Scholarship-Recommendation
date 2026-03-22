import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Scholarships({ user }) {
  const [scholarships, setScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: '',
    caste: ''
  });

  useEffect(() => {
    fetchScholarships();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarships, filters]);

  const fetchScholarships = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/scholarships');
      setScholarships(response.data);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = scholarships;
    if (filters.level) {
      filtered = filtered.filter(s => s.level === filters.level);
    }
    if (filters.caste) {
      filtered = filtered.filter(s => s.caste && s.caste.includes(filters.caste));
    }
    setFilteredScholarships(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getLevelName = (level) => {
    const levels = {
      'junior_kg': 'Junior KG',
      'class_8': 'Class 8',
      '1st_to_10th': '1st to 10th',
      '11th_12th': '11th - 12th',
      'diploma': 'Diploma',
      'graduate': 'Graduate',
      'post_graduate': 'Post Graduate',
      'master': "Master's",
      'abroad': 'Study Abroad'
    };
    return levels[level] || level;
  };

  if (loading) {
    return <div className="container">Loading scholarships...</div>;
  }

  return (
    <div className="container">
      <div className="hero-section">
        <h1 className="hero-title">🎓 Available Government Scholarships</h1>
        <p className="hero-subtitle">
          Browse and apply for scholarships from Junior KG to Master's level. 
          Filter by your education level and caste category to find relevant scholarships.
        </p>
      </div>
      
      <div className="filter-section">
        <h2 className="filter-title">Filter Scholarships</h2>
        <div className="filter-group">
          <div className="filter-item">
            <label className="form-label">Education Level</label>
            <select name="level" value={filters.level} onChange={handleFilterChange} className="form-select">
              <option value="">All Levels</option>
              <option value="junior_kg">Junior KG</option>
              <option value="class_8">Class 8</option>
              <option value="1st_to_10th">1st to 10th</option>
              <option value="11th_12th">11th - 12th</option>
              <option value="diploma">Diploma</option>
              <option value="graduate">Graduate</option>
              <option value="post_graduate">Post Graduate</option>
              <option value="master">Master's</option>
              <option value="abroad">Study Abroad</option>
            </select>
          </div>
          <div className="filter-item">
            <label className="form-label">Caste Category</label>
            <select name="caste" value={filters.caste} onChange={handleFilterChange} className="form-select">
              <option value="">All Categories</option>
              <option value="open">Open (General)</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
              <option value="nt">NT</option>
              <option value="obc">OBC</option>
              <option value="minority">Minority</option>
              <option value="ews">EWS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        {filteredScholarships.map(scholarship => (
          <div key={scholarship.id} className="scholarship-card">
            <h3 className="scholarship-title">{scholarship.name}</h3>
            <p className="scholarship-info">{scholarship.description}</p>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="scholarship-tag" style={{ backgroundColor: '#3498db' }}>
                {getLevelName(scholarship.level)}
              </span>
            </div>
            <p className="scholarship-info" style={{ marginTop: '0.5rem' }}>
              <strong>Provider:</strong> {scholarship.provider}
            </p>
            <p className="scholarship-amount">₹{scholarship.amount?.toLocaleString()}</p>
            <div style={{ marginTop: '0.5rem' }}>
              {scholarship.caste && scholarship.caste.map(c => (
                <span key={c} className="scholarship-tag">{c.toUpperCase()}</span>
              ))}
            </div>
            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <p className="scholarship-info" style={{ fontSize: '0.9rem' }}>
                <strong>Deadline:</strong> {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString('en-IN') : 'N/A'}
              </p>
              {scholarship.apply_link && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <strong>Official Website:</strong> <a href={scholarship.apply_link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', wordBreak: 'break-all' }}>{scholarship.apply_link}</a>
                </p>
              )}
              {user ? (
                <Link to={`/apply/${scholarship.id}`} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                  Apply Now
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                  Login to Apply
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>No scholarships found matching your criteria.</p>
      )}
    </div>
  );
}

export default Scholarships;
