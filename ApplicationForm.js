import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function ApplicationForm({ user }) {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Applicant details state - editable by user
  const [applicantDetails, setApplicantDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    caste: 'open',
    educationLevel: '',
    schoolCollege: '',
    city: '',
    state: 'Maharashtra',
    pincode: ''
  });

  useEffect(() => {
    if (scholarshipId) {
      fetchScholarship();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarshipId]);

  useEffect(() => {
    // Pre-fill with user data from localStorage (most up-to-date)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setApplicantDetails(prev => ({
          ...prev,
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          caste: parsedUser.caste || 'open',
          educationLevel: parsedUser.educationLevel || ''
        }));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);

  const fetchScholarship = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scholarships/${scholarshipId}`);
      setScholarship(response.data);
    } catch (err) {
      console.error('Error fetching scholarship:', err);
      setError('Failed to load scholarship details. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation - only letters and spaces
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!applicantDetails.firstName || applicantDetails.firstName.trim() === '') {
      newErrors.firstName = 'First Name is required';
    } else if (!nameRegex.test(applicantDetails.firstName)) {
      newErrors.firstName = 'First Name should contain only letters';
    }
    
    if (!applicantDetails.lastName || applicantDetails.lastName.trim() === '') {
      newErrors.lastName = 'Last Name is required';
    } else if (!nameRegex.test(applicantDetails.lastName)) {
      newErrors.lastName = 'Last Name should contain only letters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!applicantDetails.email || applicantDetails.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(applicantDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation - 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!applicantDetails.phone || applicantDetails.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(applicantDetails.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // All fields required check
    if (!applicantDetails.educationLevel) {
      newErrors.educationLevel = 'Education Level is required';
    }
    if (!applicantDetails.caste) {
      newErrors.caste = 'Caste Category is required';
    }
    if (!applicantDetails.city || applicantDetails.city.trim() === '') {
      newErrors.city = 'City is required';
    }
    if (!applicantDetails.state || applicantDetails.state.trim() === '') {
      newErrors.state = 'State is required';
    }
    if (!applicantDetails.pincode || applicantDetails.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    }
    
    // STRICT Education level validation - user can ONLY apply for their exact education level
    if (applicantDetails.educationLevel && scholarship) {
      const userLevel = applicantDetails.educationLevel;
      const scholarshipLevel = scholarship.level;
      
      // Check if user's education level EXACTLY matches scholarship level
      if (userLevel !== scholarshipLevel) {
        newErrors.educationLevel = `❌ Your education level is "${getLevelName(userLevel)}" but this scholarship is for "${getLevelName(scholarshipLevel)}". You can only apply for ${getLevelName(userLevel)} scholarships.`;
      }
    }
    
    // STRICT Caste validation - user can ONLY apply if their caste is allowed
    if (applicantDetails.caste && scholarship && scholarship.caste) {
      const userCaste = applicantDetails.caste.toLowerCase();
      const allowedCastes = scholarship.caste.map(c => c.toLowerCase());
      
      if (!allowedCastes.includes(userCaste)) {
        const casteNames = {
          'open': 'Open (General)',
          'sc': 'SC',
          'st': 'ST',
          'obc': 'OBC',
          'nt': 'NT',
          'minority': 'Minority',
          'ews': 'EWS'
        };
        const userCasteName = casteNames[userCaste] || userCaste;
        const allowedCasteNames = allowedCastes.map(c => casteNames[c] || c).join(', ');
        newErrors.caste = `❌ Your caste is "${userCasteName}" but this scholarship is only for: ${allowedCasteNames}. You cannot apply for this scholarship.`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Check if token exists first
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please login again.');
      setSubmitting(false);
      navigate('/login');
      return;
    }

    // Validate form
    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/applications',
        { 
          scholarshipId,
          applicantDetails: applicantDetails
        },
        { 
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          } 
        }
      );
      setApplied(true);
      setMessage('✅ Application Submitted Successfully! Confirmation email sent to your email ID.');
    } catch (err) {
      console.error('Application submission error:', err.response || err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to submit application';
      setError(errorMsg);
      
      // If token is invalid, redirect to login
      if (err.response?.status === 401 || err.response?.status === 400) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!scholarship) {
    return (
      <div className="container">
        <div className="card">
          <h2>Scholarship not found</h2>
          <p>The scholarship you're looking for doesn't exist or has been removed.</p>
          <Link to="/scholarships" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Scholarships
          </Link>
        </div>
      </div>
    );
  }

  // Safely handle potentially undefined/null values
  const scholarshipLevel = scholarship.level ? scholarship.level.replace(/_/g, ' ').toUpperCase() : 'N/A';
  const scholarshipAmount = scholarship.amount ? `₹${scholarship.amount.toLocaleString()}` : 'N/A';
  const scholarshipDeadline = scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A';
  const documentsRequired = scholarship.documents_required || scholarship.documentsRequired || [];

  return (
    <div className="container">
      <Link to="/scholarships" className="back-button">
        ← Back to Scholarships
      </Link>
      
      <div className="card">
        <h1 className="card-header">📝 Apply for {scholarship.name}</h1>
        
        <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginBottom: '1.5rem' }}>
          <h3>Scholarship Details</h3>
          <p><strong>Amount:</strong> {scholarshipAmount}</p>
          <p><strong>Provider:</strong> {scholarship.provider || 'N/A'}</p>
          <p><strong>Level:</strong> {scholarshipLevel}</p>
          <p><strong>Eligible Castes:</strong> {scholarship.caste ? scholarship.caste.join(', ').toUpperCase() : 'All'}</p>
          <p><strong>Eligibility:</strong> {scholarship.eligibility || 'N/A'}</p>
          <p><strong>Deadline:</strong> {scholarshipDeadline}</p>
          
          {/* Official Apply Link */}
          {scholarship.apply_link && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '5px', border: '2px solid #ffc107' }}>
              <h4 style={{ color: '#856404', marginBottom: '0.5rem' }}>🔗 Official Apply Link:</h4>
              <p style={{ marginBottom: '0.5rem' }}>Click the button below to apply on the official scholarship website:</p>
              <a 
                href={scholarship.apply_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block', 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '10px 20px', 
                  textDecoration: 'none', 
                  borderRadius: '5px',
                  fontWeight: 'bold'
                }}
              >
                🌐 Apply on Official Website
              </a>
              <p style={{ fontSize: '12px', marginTop: '0.5rem', color: '#666' }}>Or copy: {scholarship.apply_link}</p>
            </div>
          )}
        </div>

        <h3>Required Documents:</h3>
        {documentsRequired.length > 0 ? (
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
            {documentsRequired.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        ) : (
          <p style={{ marginBottom: '1.5rem' }}>No specific documents listed.</p>
        )}

        {message && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '5px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3>📋 Applicant Information (Fill or Edit Details)</h3>
          
          {errors.firstName && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.firstName}</div>}
          {errors.lastName && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.lastName}</div>}
          {errors.email && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.email}</div>}
          {errors.phone && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.phone}</div>}
          {errors.educationLevel && <div style={{ color: 'red', marginBottom: '0.5rem', fontWeight: 'bold', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{errors.educationLevel}</div>}
          {errors.caste && <div style={{ color: 'red', marginBottom: '0.5rem', fontWeight: 'bold', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{errors.caste}</div>}
          {errors.city && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.city}</div>}
          {errors.state && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.state}</div>}
          {errors.pincode && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{errors.pincode}</div>}
          
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input 
                type="text" 
                name="firstName"
                value={applicantDetails.firstName} 
                onChange={handleInputChange}
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input 
                type="text" 
                name="lastName"
                value={applicantDetails.lastName} 
                onChange={handleInputChange}
                className="form-input" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input 
                type="email" 
                name="email"
                value={applicantDetails.email} 
                onChange={handleInputChange}
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone * (10 digits)</label>
              <input 
                type="tel" 
                name="phone"
                value={applicantDetails.phone} 
                onChange={handleInputChange}
                className="form-input" 
                placeholder="Enter 10-digit phone number"
                pattern="[0-9]{10}"
                maxLength={10}
                required 
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Caste Category *</label>
              <select 
                name="caste"
                value={applicantDetails.caste} 
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="open">Open (General)</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="obc">OBC</option>
                <option value="nt">NT</option>
                <option value="minority">Minority</option>
                <option value="ews">EWS</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Education Level *</label>
              <select 
                name="educationLevel"
                value={applicantDetails.educationLevel} 
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">Select Level</option>
                <option value="junior_kg">Junior KG</option>
                <option value="senior_kg">Senior KG</option>
                <option value="1st_to_10th">Class 1-10</option>
                <option value="11th_12th">Class 11-12</option>
                <option value="diploma">Diploma</option>
                <option value="graduate">Graduate (UG)</option>
                <option value="post_graduate">Post Graduate (PG)</option>
                <option value="master">Master's</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">School/College Name *</label>
              <input 
                type="text" 
                name="schoolCollege"
                value={applicantDetails.schoolCollege} 
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input 
                type="text" 
                name="city"
                value={applicantDetails.city} 
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">State *</label>
              <input 
                type="text" 
                name="state"
                value={applicantDetails.state} 
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input 
                type="text" 
                name="pincode"
                value={applicantDetails.pincode} 
                onChange={handleInputChange}
                className="form-input" 
                required
              />
            </div>
          </div>

          {!applied ? (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '5px' }}>
              <h4>📝 Fill Your Details & Submit:</h4>
              <p>After submitting, you will get a confirmation email on <strong>{applicantDetails.email}</strong></p>
              {scholarship.apply_link && (
                <p style={{ marginTop: '0.5rem', color: '#856404' }}>
                  💡 <strong>Note:</strong> After submitting here, click the "Apply on Official Website" button above to complete your application on the official portal.
                </p>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#d4edda', borderRadius: '5px', border: '2px solid #28a745' }}>
              <h4>🎉 Congratulations! Application Submitted!</h4>
              <p>A confirmation email has been sent to <strong>{applicantDetails.email}</strong></p>
              <p>Your application for <strong>{scholarship.name}</strong> has been recorded.</p>
              {scholarship.apply_link && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '5px' }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>🔗 Don't forget to apply on the official website:</p>
                  <a 
                    href={scholarship.apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block', 
                      background: '#007bff', 
                      color: 'white', 
                      padding: '10px 20px', 
                      textDecoration: 'none', 
                      borderRadius: '5px'
                    }}
                  >
                    🌐 Apply on Official Website
                  </a>
                </div>
              )}
            </div>
          )}
          
          <button type="submit" className="btn btn-success" disabled={submitting} style={{ marginTop: '1rem', fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
            {submitting ? 'Submitting...' : '✅ Submit Application'}
          </button>
          
          {applied && (
            <button 
              onClick={() => navigate('/my-applications')} 
              className="btn btn-secondary" 
              style={{ marginTop: '1rem', display: 'inline-block', marginLeft: '0.5rem' }}
            >
              View My Applications
            </button>
          )}
          
          <Link to="/scholarships" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Back to Scholarships
          </Link>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;
