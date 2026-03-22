import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    level: '',
    caste: '',
    amount: '',
    eligibility: '',
    documents_required: '',
    deadline: '',
    provider: '',
    apply_link: '',
    is_active: true
  });

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/scholarships', {
        headers: { 'x-auth-token': token }
      });
      setScholarships(response.data);
    } catch (err) {
      console.error('Error fetching scholarships:', err);
      setError('Failed to load scholarships');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      // Prepare data - convert comma-separated strings to arrays
      const casteArray = formData.caste.split(',').map(c => c.trim()).filter(c => c);
      const documentsArray = formData.documents_required.split(',').map(d => d.trim()).filter(d => d);
      
      const scholarshipData = {
        name: formData.name,
        description: formData.description,
        level: formData.level,
        caste: casteArray,
        amount: parseFloat(formData.amount) || 0,
        eligibility: formData.eligibility,
        documents_required: documentsArray,
        deadline: formData.deadline,
        provider: formData.provider,
        apply_link: formData.apply_link,
        is_active: formData.is_active
      };

      console.log('Saving scholarship:', editingScholarship ? 'Update' : 'Add', scholarshipData);

      if (editingScholarship && editingScholarship.id) {
        // Update existing scholarship
        const response = await axios.put(
          `http://localhost:5000/api/admin/scholarships/${editingScholarship.id}`, 
          scholarshipData, 
          { headers }
        );
        console.log('Update response:', response.data);
        alert('Scholarship updated successfully!');
      } else {
        // Add new scholarship
        const response = await axios.post(
          'http://localhost:5000/api/admin/scholarships', 
          scholarshipData, 
          { headers }
        );
        console.log('Add response:', response.data);
        alert('Scholarship added successfully!');
      }
      
      // Reset form and refresh list
      resetForm();
      fetchScholarships();
    } catch (err) {
      console.error('Error saving scholarship:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message;
      setError('Error: ' + errorMsg);
      alert('Error: ' + errorMsg);
    }
  };

  const handleEdit = (scholarship) => {
    console.log('Editing scholarship:', scholarship);
    setEditingScholarship(scholarship);
    setFormData({
      id: scholarship.id,
      name: scholarship.name || '',
      description: scholarship.description || '',
      level: scholarship.level || '',
      caste: Array.isArray(scholarship.caste) ? scholarship.caste.join(', ') : (scholarship.caste || ''),
      amount: scholarship.amount ? String(scholarship.amount) : '',
      eligibility: scholarship.eligibility || '',
      documents_required: Array.isArray(scholarship.documents_required) ? scholarship.documents_required.join(', ') : (scholarship.documents_required || ''),
      deadline: scholarship.deadline ? String(scholarship.deadline).split('T')[0] : '',
      provider: scholarship.provider || '',
      apply_link: scholarship.apply_link || '',
      is_active: scholarship.is_active !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scholarship? This will also delete all applications for this scholarship.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/scholarships/${id}`, {
        headers: { 'x-auth-token': token }
      });
      alert('Scholarship deleted successfully!');
      fetchScholarships();
    } catch (err) {
      console.error('Error deleting scholarship:', err);
      alert('Error: ' + (err.response?.data?.msg || err.message));
    }
  };

  const toggleActive = async (scholarship) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/scholarships/${scholarship.id}`, 
        { ...scholarship, is_active: !scholarship.is_active },
        { headers: { 'x-auth-token': token } }
      );
      fetchScholarships();
    } catch (err) {
      console.error('Error toggling active status:', err);
      alert('Error: ' + (err.response?.data?.msg || err.message));
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingScholarship(null);
    setFormData({
      id: null,
      name: '',
      description: '',
      level: '',
      caste: '',
      amount: '',
      eligibility: '',
      documents_required: '',
      deadline: '',
      provider: '',
      apply_link: '',
      is_active: true
    });
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Scholarships</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          {showForm ? 'Cancel' : '+ Add New Scholarship'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', marginBottom: '1rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h2>{editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Scholarship Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Provider/Offering Organization *</label>
                <input type="text" name="provider" value={formData.provider} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" required />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Education Level *</label>
                <select name="level" value={formData.level} onChange={handleChange} className="form-select" required>
                  <option value="">Select Level</option>
                  <option value="junior_kg">Junior KG</option>
                  <option value="senior_kg">Senior KG</option>
                  <option value="1st_to_10th">1st to 10th</option>
                  <option value="11th_12th">11th - 12th</option>
                  <option value="diploma">Diploma</option>
                  <option value="graduate">Graduate (UG)</option>
                  <option value="post_graduate">Post Graduate</option>
                  <option value="master">Master's</option>
                  <option value="abroad">Study Abroad</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Deadline *</label>
                <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Caste Categories (comma separated) *</label>
                <input type="text" name="caste" value={formData.caste} onChange={handleChange} className="form-input" placeholder="open, sc, st, obc, nt" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility Criteria *</label>
              <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} className="form-textarea" rows="2" required />
            </div>

            <div className="form-group">
              <label className="form-label">Required Documents (comma separated) *</label>
              <input type="text" name="documents_required" value={formData.documents_required} onChange={handleChange} className="form-input" placeholder="Aadhaar Card, Caste Certificate, Income Certificate" required />
            </div>

            <div className="form-group">
              <label className="form-label">Apply Link (Official Website)</label>
              <input type="url" name="apply_link" value={formData.apply_link} onChange={handleChange} className="form-input" placeholder="https://example.com/apply" />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
                <span>Active (Visible to users)</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary">
              {editingScholarship ? 'Update Scholarship' : 'Add Scholarship'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '1rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th>Amount</th>
              <th>Deadline</th>
              <th>Provider</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scholarships.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.level?.replace(/_/g, ' ').toUpperCase()}</td>
                <td>₹{s.amount?.toLocaleString()}</td>
                <td>{s.deadline ? new Date(s.deadline).toLocaleDateString() : 'N/A'}</td>
                <td>{s.provider}</td>
                <td>
                  <button 
                    onClick={() => toggleActive(s)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      background: s.is_active !== false ? '#d4edda' : '#f8d7da',
                      color: s.is_active !== false ? '#155724' : '#721c24',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {s.is_active !== false ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => handleEdit(s)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(s.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminScholarships;
