import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Account({ user, setUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
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
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch latest user data from backend on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Fetch full user profile from backend
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { 'x-auth-token': token }
        });
        
        const fullUser = response.data.user || userData;
        
        // Handle date format - convert to YYYY-MM-DD for input field
        let dob = '';
        if (fullUser.dateOfBirth) {
          if (typeof fullUser.dateOfBirth === 'string') {
            dob = fullUser.dateOfBirth.split('T')[0];
          } else if (fullUser.dateOfBirth instanceof Date) {
            dob = fullUser.dateOfBirth.toISOString().split('T')[0];
          }
        }
        
        setFormData({
          firstName: fullUser.firstName || '',
          lastName: fullUser.lastName || '',
          email: fullUser.email || '',
          phone: fullUser.phone || '',
          dateOfBirth: dob,
          address: fullUser.address || '',
          city: fullUser.city || '',
          state: fullUser.state || '',
          pincode: fullUser.pincode || '',
          parentName: fullUser.parentName || '',
          parentPhone: fullUser.parentPhone || '',
          parentEmail: fullUser.parentEmail || '',
          relation: fullUser.relation || '',
          educationLevel: fullUser.educationLevel || '',
          schoolCollege: fullUser.schoolCollege || '',
          classGrade: fullUser.classGrade || '',
          caste: fullUser.caste || 'open'
        });
        
        // Update localStorage with full user data
        localStorage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fall back to initial user data from props
      if (user) {
        // Handle date format for fallback data too
        let dob = '';
        if (user.dateOfBirth) {
          if (typeof user.dateOfBirth === 'string') {
            dob = user.dateOfBirth.split('T')[0];
          } else if (user.dateOfBirth instanceof Date) {
            dob = user.dateOfBirth.toISOString().split('T')[0];
          }
        }
        
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: dob,
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          parentName: user.parentName || '',
          parentPhone: user.parentPhone || '',
          parentEmail: user.parentEmail || '',
          relation: user.relation || '',
          educationLevel: user.educationLevel || '',
          schoolCollege: user.schoolCollege || '',
          classGrade: user.classGrade || '',
          caste: user.caste || 'open'
        });
      }
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
        headers: { 'x-auth-token': token }
      });
      
      // Update localStorage with saved user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
        <div className="card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div className="card">
        <h1 style={{ marginBottom: '1.5rem' }}>My Account</h1>
        
        {message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '4px',
            background: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: '1rem' }}>Personal Information</h3>
          
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Caste Category</label>
            <select name="caste" value={formData.caste} onChange={handleChange} className="form-select">
              <option value="open">Open (General)</option>
              <option value="sc">SC (Scheduled Caste)</option>
              <option value="st">ST (Scheduled Tribe)</option>
              <option value="nt">NT (Nomadic Tribe)</option>
              <option value="obc">OBC (Other Backward Class)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Education Details</h3>

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

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Parent Phone</label>
              <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Parent Email</label>
              <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} className="form-input" />
            </div>
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
              <label className="form-label">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="form-input" />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Account;
