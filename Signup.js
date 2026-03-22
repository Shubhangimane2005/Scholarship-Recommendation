import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup({ setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    relation: '',
    educationLevel: '',
    schoolCollege: '',
    classGrade: '',
    caste: 'open'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!formData.firstName || formData.firstName.trim() === '') {
      newErrors.firstName = 'First Name is required';
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = 'First Name should contain only letters';
    }
    
    if (!formData.lastName || formData.lastName.trim() === '') {
      newErrors.lastName = 'Last Name is required';
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = 'Last Name should contain only letters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
    }
    if (!formData.state || formData.state.trim() === '') {
      newErrors.state = 'State is required';
    }
    if (!formData.pincode || formData.pincode.trim() === '') {
      newErrors.pincode = 'Pincode is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      const response = await axios.post('http://localhost:5000/api/auth/signup', data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/scholarships');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
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
        backgroundImage: 'url(https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80)',
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
      
      <div className="auth-card" style={{ position: 'relative', zIndex: 1, marginTop: '60px' }}>
        <h1 className="auth-title">Sign Up</h1>
        <p className="auth-subtitle">Create your account to apply for scholarships</p>
        
        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
              {errors.firstName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
              {errors.lastName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
            {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" required />
            {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" required />
            {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Registering As *</label>
            <select name="role" value={formData.role} onChange={handleChange} className="form-select" required>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone (10 digits)</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Enter 10-digit phone number" pattern="[0-9]{10}" maxLength={10} />
            {errors.phone && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Caste Category *</label>
            <select name="caste" value={formData.caste} onChange={handleChange} className="form-select" required>
              <option value="open">Open (General)</option>
              <option value="sc">SC (Scheduled Caste)</option>
              <option value="st">ST (Scheduled Tribe)</option>
              <option value="nt">NT (Nomadic Tribe)</option>
              <option value="obc">OBC (Other Backward Class)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Education Level</label>
            <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="form-select">
              <option value="">Select Level</option>
              <option value="senior_kg">Senior KG</option>
              <option value="junior_kg">Junior KG</option>
              <option value="1st_to_10th">1st to 10th</option>
              <option value="11th_12th">11th - 12th</option>
              <option value="diploma">Diploma</option>
              <option value="graduate">Graduate</option>
              <option value="post_graduate">Post Graduate</option>
              <option value="master">Master's</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">School/College Name</label>
            <input type="text" name="schoolCollege" value={formData.schoolCollege} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Class/Grade</label>
            <input type="text" name="classGrade" value={formData.classGrade} onChange={handleChange} className="form-input" />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Parent Details</h3>

          <div className="form-group">
            <label className="form-label">Parent Name</label>
            <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Phone</label>
            <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="form-input" placeholder="Enter 10-digit phone number" pattern="[0-9]{10}" maxLength={10} />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Email</label>
            <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Relation</label>
            <select name="relation" value={formData.relation} onChange={handleChange} className="form-select">
              <option value="">Select Relation</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Address</h3>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-textarea" rows="2"></textarea>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" required />
              {errors.city && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.city}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-input" required />
              {errors.state && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.state}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pincode *</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-input" required />
            {errors.pincode && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.pincode}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login"><span>Login here</span></Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
