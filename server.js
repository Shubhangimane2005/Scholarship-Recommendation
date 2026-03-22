const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'scholarship_secret_key_2024';

// PostgreSQL Connection (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@host.neon.tech/scholarship_app?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// Test Database Connection
pool.query('SELECT NOW()')
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.log('Database connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Database Tables
const initDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'student',
      phone VARCHAR(20),
      date_of_birth DATE,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      parent_name VARCHAR(100),
      parent_phone VARCHAR(20),
      parent_email VARCHAR(255),
      relation VARCHAR(50),
      education_level VARCHAR(100),
      school_college VARCHAR(255),
      class_grade VARCHAR(50),
      caste VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      level VARCHAR(50) NOT NULL,
      caste TEXT[],
      amount DECIMAL(12,2),
      eligibility TEXT,
      documents_required TEXT[],
      deadline DATE,
      provider VARCHAR(255),
      apply_link VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add apply_link column if it doesn't exist (for existing databases)
  try {
    await pool.query(`ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS apply_link VARCHAR(500)`);
    console.log('apply_link column verified');
  } catch (e) {
    // Column might already exist, ignore error
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      scholarship_id INTEGER REFERENCES scholarships(id),
      status VARCHAR(50) DEFAULT 'submitted',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      documents TEXT[],
      remarks TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      action VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(50),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables initialized');
};

// Email Transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️ Email transporter verification FAILED:', error.message);
    } else {
      console.log('✅ Email transporter is ready to send emails');
    }
  });
} catch (e) {
  console.log('⚠️ Failed to create email transporter:', e.message);
}

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log('Email: Transporter not initialized');
    return { success: false, error: 'Email service not available' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    });
    console.log('✅ Email sent successfully to:', to, 'Message ID:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.log('❌ Email sending FAILED:', error.message);
    return { success: false, error: error.message };
  }
};

// Log email config on startup
console.log('Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', process.env.EMAIL_PASS ? 'Yes (length: ' + process.env.EMAIL_PASS.length + ')' : 'No');
console.log('GEMINI_API_KEY set:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// Admin Middleware
const adminAuth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// ==================== ROUTES ====================

// Student/Parent Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, parentName, parentPhone, parentEmail, relation, educationLevel, schoolCollege, classGrade, caste, dateOfBirth, address, city, state, pincode } = req.body;

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, phone, parent_name, parent_phone, parent_email, relation, education_level, school_college, class_grade, caste, date_of_birth, address, city, state, pincode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [firstName, lastName, email, hashedPassword, role || 'student', phone, parentName, parentPhone, parentEmail, relation, educationLevel, schoolCollege, classGrade, caste, dateOfBirth, address, city, state, pincode]
    );

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [newUser.rows[0].id, 'signup', `User signed up as ${role || 'student'}`]
    );

    sendEmail(email, 'Welcome to Scholarship Portal', `<p>Hello ${firstName},</p><p>Welcome to our Scholarship Portal!</p>`);

    const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { 
      id: newUser.rows[0].id, 
      firstName: newUser.rows[0].first_name, 
      lastName: newUser.rows[0].last_name,
      email: newUser.rows[0].email, 
      role: newUser.rows[0].role,
      caste: newUser.rows[0].caste,
      educationLevel: newUser.rows[0].education_level,
      phone: newUser.rows[0].phone
    } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (Student/Parent)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.rows[0].id]);
    await pool.query('INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)', [user.rows[0].id, 'login', 'User logged in']);

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { 
      id: user.rows[0].id, 
      firstName: user.rows[0].first_name,
      lastName: user.rows[0].last_name,
      email: user.rows[0].email, 
      role: user.rows[0].role,
      caste: user.rows[0].caste,
      educationLevel: user.rows[0].education_level,
      phone: user.rows[0].phone
    } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Forgot Password - Send reset link
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  try {
    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found with this email' });
    }
    
    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Save reset token to database (you may need to add a reset_token column)
    // For now, we'll simulate sending email
    
    // In production, send email with nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - Scholarship App',
      html: `<p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>`
    });
    */
    
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.json({ msg: 'Password reset link has been sent to your email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Admin Login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.rows[0].id]);
    await pool.query('INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)', [user.rows[0].id, 'admin_login', 'Admin logged in']);

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { 
      id: user.rows[0].id, 
      firstName: user.rows[0].first_name,
      lastName: user.rows[0].last_name,
      email: user.rows[0].email, 
      role: user.rows[0].role,
      caste: user.rows[0].caste,
      educationLevel: user.rows[0].education_level,
      phone: user.rows[0].phone
    } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all scholarships (with filters)
app.get('/api/scholarships', async (req, res) => {
  try {
    const { level, caste } = req.query;
    let query = 'SELECT * FROM scholarships WHERE is_active = true';
    const params = [];

    if (level) {
      params.push(level);
      query += ` AND level = $${params.length}`;
    }

    if (caste) {
      params.push(`%${caste}%`);
      query += ` AND caste::text LIKE $${params.length}`;
    }

    const scholarships = await pool.query(query, params);
    res.json(scholarships.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single scholarship
app.get('/api/scholarships/:id', async (req, res) => {
  try {
    const scholarship = await pool.query('SELECT * FROM scholarships WHERE id = $1', [req.params.id]);
    if (scholarship.rows.length === 0) {
      return res.status(404).json({ msg: 'Scholarship not found' });
    }
    res.json(scholarship.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all scholarships (including inactive)
app.get('/api/admin/scholarships', adminAuth, async (req, res) => {
  try {
    const scholarships = await pool.query('SELECT * FROM scholarships ORDER BY created_at DESC');
    res.json(scholarships.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add new scholarship
app.post('/api/admin/scholarships', adminAuth, async (req, res) => {
  try {
    const { name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active } = req.body;

    const newScholarship = await pool.query(
      `INSERT INTO scholarships (name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active !== false]
    );

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'add_scholarship', `Added new scholarship: ${name}`]
    );

    res.json({ msg: 'Scholarship added successfully', scholarship: newScholarship.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update scholarship
app.put('/api/admin/scholarships/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active } = req.body;

    const updatedScholarship = await pool.query(
      `UPDATE scholarships SET name = $1, description = $2, level = $3, caste = $4, amount = $5, eligibility = $6, 
       documents_required = $7, deadline = $8, provider = $9, apply_link = $10, is_active = $11
       WHERE id = $12 RETURNING *`,
      [name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active !== false, req.params.id]
    );

    if (updatedScholarship.rows.length === 0) {
      return res.status(404).json({ msg: 'Scholarship not found' });
    }

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'update_scholarship', `Updated scholarship: ${name}`]
    );

    res.json({ msg: 'Scholarship updated successfully', scholarship: updatedScholarship.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete scholarship
app.delete('/api/admin/scholarships/:id', adminAuth, async (req, res) => {
  try {
    // First get the scholarship name for logging
    const scholarship = await pool.query('SELECT name FROM scholarships WHERE id = $1', [req.params.id]);
    
    if (scholarship.rows.length === 0) {
      return res.status(404).json({ msg: 'Scholarship not found' });
    }

    await pool.query('DELETE FROM applications WHERE scholarship_id = $1', [req.params.id]);
    await pool.query('DELETE FROM scholarships WHERE id = $1', [req.params.id]);

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'delete_scholarship', `Deleted scholarship: ${scholarship.rows[0].name}`]
    );

    res.json({ msg: 'Scholarship deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit application
app.post('/api/applications', auth, async (req, res) => {
  try {
    const { scholarshipId, documents, applicantDetails } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    const appFirstName = applicantDetails?.firstName || user.rows[0].first_name;
    const appLastName = applicantDetails?.lastName || user.rows[0].last_name;
    const appEmail = applicantDetails?.email || user.rows[0].email;
    const appPhone = applicantDetails?.phone || user.rows[0].phone;
    const appCaste = applicantDetails?.caste || user.rows[0].caste;
    const appEducationLevel = applicantDetails?.educationLevel || user.rows[0].education_level;
    const appSchoolCollege = applicantDetails?.schoolCollege || user.rows[0].school_college;
    const appCity = applicantDetails?.city || user.rows[0].city;
    const appState = applicantDetails?.state || user.rows[0].state;
    
    const newApplication = await pool.query(
      'INSERT INTO applications (user_id, scholarship_id, documents) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, scholarshipId, documents || []]
    );

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'apply', `Applied for scholarship ${scholarshipId}`]
    );

    const scholarship = await pool.query('SELECT * FROM scholarships WHERE id = $1', [scholarshipId]);
    
    // Build email content with official link
    let emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">🎉 Congratulations! Application Submitted Successfully!</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #333;">Scholarship Details:</h3>
          <p><strong>Scholarship Name:</strong> ${scholarship.rows[0].name}</p>
          <p><strong>Amount:</strong> ₹${scholarship.rows[0].amount?.toLocaleString() || 'N/A'}</p>
          <p><strong>Provider:</strong> ${scholarship.rows[0].provider || 'N/A'}</p>
          <p><strong>Deadline:</strong> ${new Date(scholarship.rows[0].deadline).toLocaleDateString() || 'N/A'}</p>
        </div>
        
        <div style="background: #e7f3ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #333;">Applicant Information:</h3>
          <p><strong>Name:</strong> ${appFirstName} ${appLastName}</p>
          <p><strong>Email:</strong> ${appEmail}</p>
          <p><strong>Phone:</strong> ${appPhone || 'N/A'}</p>
          <p><strong>Caste Category:</strong> ${appCaste?.toUpperCase() || 'N/A'}</p>
          <p><strong>Education Level:</strong> ${appEducationLevel?.replace(/_/g, ' ').toUpperCase() || 'N/A'}</p>
          <p><strong>School/College:</strong> ${appSchoolCollege || 'N/A'}</p>
          <p><strong>City:</strong> ${appCity || 'N/A'}</p>
          <p><strong>State:</strong> ${appState || 'N/A'}</p>
        </div>
    `;
    
    if (scholarship.rows[0].apply_link) {
      emailContent += `
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #856404;">🔗 Official Website Link:</h3>
          <p>Click the button below to apply on the official scholarship website:</p>
          <a href="${scholarship.rows[0].apply_link}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;" target="_blank">🌐 Apply on Official Website</a>
          <p style="margin-top: 10px; font-size: 12px;">Or copy this link: ${scholarship.rows[0].apply_link}</p>
        </div>
      `;
    }
    
    emailContent += `
        <p style="color: #666; margin-top: 30px;">
          Thank you for using our Scholarship Portal!<br>
          Best regards,<br>
          <strong>Scholarship Team</strong>
        </p>
      </div>
    `;
    
    sendEmail(appEmail, `Scholarship Application Submitted - ${scholarship.rows[0].name}`, emailContent);

    res.json({ msg: 'Application submitted successfully', application: newApplication.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's applications
app.get('/api/applications/my', auth, async (req, res) => {
  try {
    const applications = await pool.query(
      `SELECT a.*, s.name as scholarship_name, s.level, s.amount, s.description, s.apply_link
       FROM applications a
       JOIN scholarships s ON a.scholarship_id = s.id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(applications.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ user: {
      id: user.rows[0].id,
      firstName: user.rows[0].first_name,
      lastName: user.rows[0].last_name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      caste: user.rows[0].caste,
      educationLevel: user.rows[0].education_level,
      phone: user.rows[0].phone,
      dateOfBirth: user.rows[0].date_of_birth,
      address: user.rows[0].address,
      city: user.rows[0].city,
      state: user.rows[0].state,
      pincode: user.rows[0].pincode,
      parentName: user.rows[0].parent_name,
      parentPhone: user.rows[0].parent_phone,
      parentEmail: user.rows[0].parent_email,
      relation: user.rows[0].relation,
      schoolCollege: user.rows[0].school_college,
      classGrade: user.rows[0].class_grade
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, address, city, state, pincode, parentName, parentPhone, parentEmail, relation, educationLevel, schoolCollege, classGrade, caste } = req.body;

    // Handle empty date - convert to null for database
    const dob = dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth : null;

    const updatedUser = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, address = $5, city = $6, state = $7, pincode = $8, parent_name = $9, parent_phone = $10, parent_email = $11, relation = $12, education_level = $13, school_college = $14, class_grade = $15, caste = $16
       WHERE id = $17 RETURNING *`,
      [firstName, lastName, phone, dob, address, city, state, pincode, parentName, parentPhone, parentEmail, relation, educationLevel, schoolCollege, classGrade, caste, req.user.id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await pool.query(
      'INSERT INTO logs (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'profile_update', 'User updated their profile']
    );

    res.json({ msg: 'Profile updated successfully', user: { 
      id: updatedUser.rows[0].id, 
      firstName: updatedUser.rows[0].first_name,
      lastName: updatedUser.rows[0].last_name,
      email: updatedUser.rows[0].email, 
      role: updatedUser.rows[0].role,
      caste: updatedUser.rows[0].caste,
      educationLevel: updatedUser.rows[0].education_level,
      phone: updatedUser.rows[0].phone,
      dateOfBirth: updatedUser.rows[0].date_of_birth,
      address: updatedUser.rows[0].address,
      city: updatedUser.rows[0].city,
      state: updatedUser.rows[0].state,
      pincode: updatedUser.rows[0].pincode,
      parentName: updatedUser.rows[0].parent_name,
      parentPhone: updatedUser.rows[0].parent_phone,
      parentEmail: updatedUser.rows[0].parent_email,
      relation: updatedUser.rows[0].relation,
      schoolCollege: updatedUser.rows[0].school_college,
      classGrade: updatedUser.rows[0].class_grade
    } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin)
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all applications (admin)
app.get('/api/admin/applications', adminAuth, async (req, res) => {
  try {
    const applications = await pool.query(
      `SELECT a.*, u.first_name, u.last_name, u.email, u.phone, s.name as scholarship_name, s.level, s.amount
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN scholarships s ON a.scholarship_id = s.id
       ORDER BY a.applied_at DESC`
    );
    res.json(applications.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all logs (admin)
app.get('/api/admin/logs', adminAuth, async (req, res) => {
  try {
    const logs = await pool.query(
      `SELECT l.*, u.first_name, u.last_name, u.email
       FROM logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.timestamp DESC
       LIMIT 100`
    );
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard stats (admin)
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']);
    const totalApplications = await pool.query('SELECT COUNT(*) FROM applications');
    const submittedApplications = await pool.query("SELECT COUNT(*) FROM applications WHERE status = $1", ['submitted']);
    const approvedApplications = await pool.query("SELECT COUNT(*) FROM applications WHERE status = $1", ['approved']);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalApplications: parseInt(totalApplications.rows[0].count),
      submittedApplications: parseInt(submittedApplications.rows[0].count),
      approvedApplications: parseInt(approvedApplications.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scholarship analytics (admin)
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
  try {
    // Get all scholarships with application counts
    const scholarshipStats = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.level,
        s.caste,
        s.amount,
        s.provider,
        COUNT(a.id) as application_count
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarship_id
      GROUP BY s.id, s.name, s.level, s.caste, s.amount, s.provider
      ORDER BY application_count DESC
    `);

    // Get total applications
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM applications');
    const totalApplications = parseInt(totalResult.rows[0].total);

    // Get category-wise distribution (from user caste)
    const categoryStats = await pool.query(`
      SELECT 
        u.caste,
        COUNT(a.id) as count
      FROM applications a
      JOIN users u ON a.user_id = u.id
      GROUP BY u.caste
    `);

    // Get education level distribution
    const levelStats = await pool.query(`
      SELECT 
        u.education_level,
        COUNT(a.id) as count
      FROM applications a
      JOIN users u ON a.user_id = u.id
      GROUP BY u.education_level
    `);

    // Calculate percentages and rankings
    const scholarshipData = scholarshipStats.rows.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      caste: s.caste,
      amount: parseFloat(s.amount),
      provider: s.provider,
      applicationCount: parseInt(s.application_count),
      applicationRatio: totalApplications > 0 ? ((parseInt(s.application_count) / totalApplications) * 100).toFixed(2) : 0
    }));

    // Sort by application count
    const sortedByApplications = [...scholarshipData].sort((a, b) => b.applicationCount - a.applicationCount);
    
    const mostPopular = sortedByApplications.find(s => s.applicationCount > 0);
    const leastPopular = sortedByApplications.slice().reverse().find(s => s.applicationCount >= 0);

    res.json({
      totalApplications,
      scholarshipData,
      categoryStats: categoryStats.rows,
      levelStats: levelStats.rows,
      mostPopular,
      leastPopular,
      leaderboard: sortedByApplications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chatbot AI Route using Gemini API
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!message) {
      return res.status(400).json({ response: 'Please provide a message' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.json({ response: getLocalResponse(message, language) });
    }

    const langPrompt = language === 'hi' ? ' Reply in Hindi' : language === 'mr' ? ' Reply in Marathi' : 'Reply in English';
    
    const prompt = `${langPrompt}. You are a scholarship assistant helping students in India. Answer questions about government scholarships, eligibility, documents, deadlines, amounts, and application process. Question: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      res.json({ response: data.candidates[0].content.parts[0].text });
    } else {
      res.json({ response: getLocalResponse(message, language) });
    }
  } catch (err) {
    console.error('Chatbot error:', err);
    res.json({ response: getLocalResponse(req.body.message, req.body.language) });
  }
});

// Local fallback responses
function getLocalResponse(query, lang) {
  const responses = {
    en: {
      scholarships: "We have scholarships for all levels from Junior KG to Master's degree. You can browse them by education level and caste category.",
      amount: "Scholarship amounts range from ₹500 to ₹20,00,000 depending on the program and your eligibility.",
      apply: "To apply:\n1. Create an account on our portal\n2. Browse scholarships and filter by your level and category\n3. Click 'Apply Now' on any scholarship\n4. Fill the application form\n5. Submit and receive confirmation email",
      documents: "Required documents typically include:\n• Birth Certificate\n• Caste Certificate (SC/ST/OBC)\n• Income Certificate\n• Aadhar Card\n• Academic Mark Sheets\n• Passport size photos",
      deadline: "Deadlines vary by scholarship. Most scholarships have deadline around March-April.",
      level: "Scholarship levels:\n• Junior KG - Class 8\n• Class 9-10\n• Class 11-12\n• Diploma\n• Graduate (UG)\n• Post Graduate (PG)\n• Master's\n• Study Abroad",
      caste: "Scholarships available for:\n• Open (General)\n• SC (Scheduled Caste)\n• ST (Scheduled Tribe)\n• OBC (Other Backward Class)\n• NT (Nomadic Tribe)\n• Minority\n• EWS",
      default: "I'm here to help with scholarship information. You can ask about:\n• Available scholarships\n• Application process\n• Required documents\n• Deadlines\n• Amount\n• Eligibility criteria\n\nSwitch language using buttons above!"
    },
    hi: {
      scholarships: "हमारे पास जूनियर केजी से लेकर मास्टर डिग्री तक सभी स्तरों के लिए छात्रवृत्तियां हैं।",
      amount: "छात्रवृत्ति की राशि ₹500 से ₹20,00,000 तक होती है।",
      apply: "आवेदन करने के लिए:\n1. पोर्टल पर खाता बनाएं\n2. छात्रवृत्तियां ब्राउज़ करें\n3. अप्लाई करें",
      documents: "आवश्यक दस्तावेज़:\n• जन्म प्रमाण पत्र\n• जाति प्रमाण पत्र\n• आय प्रमाण पत्र\n• आधार कार्ड",
      deadline: "अधिकांश छात्रवृत्तियों की समय सीमा मार्च-अप्रैल में होती है।",
      level: "छात्रवृत्ति स्तर: जूनियर केजी से मास्टर तक",
      caste: "छात्रवृत्तियां: ओपन, SC, ST, OBC, NT, अल्पसंख्यक, EWS",
      default: "मैं छात्रवृत्ति जानकारी में मदद करने के लिए यहां हूं।"
    },
    mr: {
      scholarships: "आमच्याकडे जूनियर केजीपासून मास्टर डिग्रीपर्यंत सर्व स्तरांसाठी शिष्यवृत्त्या आहेत.",
      amount: "शिष्यवृत्तीची रक्कम ₹500 ते ₹20,00,000 पर्यंत असते.",
      apply: "अर्ज करण्यासाठी:\n1. पोर्टलवर खाते तयार करा\n2. शिष्यवृत्त्या ब्राउझ करा\n3. अर्ज करा",
      documents: "आवश्यक कागदपत्रे:\n• जन्म प्रमाणपत्र\n• जातीचे प्रमाणपत्र\n• उत्पन्न प्रमाणपत्र\n• आधार कार्ड",
      deadline: "बहुतेक शिष्यवृत्त्यांची मुदत मार्च-एप्रिलच्या आसपास असते.",
      level: "शिष्यवृत्ती स्तर: जूनियर केजी ते मास्टर",
      caste: "शिष्यवृत्त्या: ओपन, एससी, एसटी, ओबीसी, एनटी, अल्पसंख्यक",
      default: "मी शिष्यवृत्ती माहितीमध्ये मदत करण्यासाठी येथे आहे."
    }
  };

  const q = query.toLowerCase();
  const r = responses[lang] || responses.en;
  
  if (q.includes('scholarship') || q.includes('छात्रवृत्ति') || q.includes('शिष्यवृत्ती')) {
    return r.scholarships;
  } else if (q.includes('amount') || q.includes('राशि') || q.includes('रक्कम')) {
    return r.amount;
  } else if (q.includes('apply') || q.includes('आवेदन') || q.includes('अर्ज')) {
    return r.apply;
  } else if (q.includes('document') || q.includes('दस्तावेज') || q.includes('कागदपत्र')) {
    return r.documents;
  } else if (q.includes('deadline') || q.includes('तिथि') || q.includes('तारीख')) {
    return r.deadline;
  } else if (q.includes('level') || q.includes('स्तर') || q.includes('इयत्ता')) {
    return r.level;
  } else if (q.includes('caste') || q.includes('जाति') || q.includes('जात')) {
    return r.caste;
  } else {
    return r.default;
  }
}

// Seed Scholarships with Official Links
const seedScholarships = async () => {
  const count = await pool.query('SELECT COUNT(*) FROM scholarships');
  
  // Define apply links for scholarships
  const applyLinks = {
    'NSP Pre-Matric Scholarship': 'https://scholarships.gov.in',
    'NMMS Scholarship': 'https://ncert.nic.in',
    'PM YASASVI Scholarship': 'https://yet.nta.ac.in',
    'ST Pre-Matric Scholarship': 'https://tribal.nic.in',
    'State Girl Child Scholarship': '',
    'CBSE Single Girl Child Scholarship': 'https://cbse.gov.in',
    'NSP Post-Matric Scholarship': 'https://scholarships.gov.in',
    'LIC Scholarship': 'https://licindia.in',
    'Tata Pankh Scholarship': 'https://buddy4study.com',
    'AICTE Pragati Scholarship (Girls)': 'https://aicte-india.org',
    'AICTE Saksham Scholarship': 'https://aicte-india.org',
    'AICTE Swanath Scholarship': 'https://aicte-india.org',
    'INSPIRE Scholarship (SHE)': 'https://online-inspire.gov.in',
    'Central Sector Scholarship': 'https://scholarships.gov.in',
    'PM-USP Scholarship': 'https://myscheme.gov.in',
    'SBI Asha Scholarship': 'https://sbifoundation.in',
    'Reliance Foundation Scholarship': 'https://reliancefoundation.org',
    'Kotak Kanya Scholarship': 'https://kotakeducation.org',
    "L'Oréal WINS Scholarship": 'https://foryoungwomeninscience.com',
    'MahaDBT EBC Scholarship': 'https://mahadbt.maharashtra.gov.in',
    'Minority Merit Scholarship': 'https://scholarships.gov.in',
    'PM Scholarship Scheme (Armed Forces)': 'https://desw.gov.in',
    'SC Top Class Scholarship': 'https://socialjustice.gov.in',
    'Top Class OBC Scholarship': 'https://socialjustice.gov.in',
    'Post Matric Disabled Scholarship': 'https://scholarships.gov.in',
    'Beedi Worker Scholarship': 'https://labour.gov.in',
    'Cine Worker Scholarship': 'https://labour.gov.in',
    'Ishan Uday Scholarship': 'https://ugc.ac.in',
    'NEC Merit Scholarship': 'https://necouncil.gov.in',
    'PMSSS Scholarship': 'https://aicte-india.org',
    'Digital India Scholarship': 'https://meity.gov.in',
    'UGC PG Single Girl Child Scholarship': 'https://ugc.ac.in',
    'PG Rank Holder Scholarship': 'https://ugc.ac.in',
    'PG SC/ST Scholarship': 'https://ugc.ac.in',
    'AICTE GATE Scholarship': 'https://aicte-india.org',
    'UGC National PG Scholarship': 'https://ugc.ac.in',
    'Adobe Women in Tech Scholarship': 'https://research.adobe.com',
    'GyanDhan Scholarship': 'https://gyandhan.com',
    'KC Mahindra PG Scholarship': 'https://kcmet.org',
    'ST Fellowship': 'https://tribal.nic.in',
    'GREAT Scholarship UK': 'https://study-uk.britishcouncil.org',
    'Fulbright-Nehru Scholarship': 'https://usief.org.in'
  };

  // Update existing scholarships with apply_link
  for (const [name, link] of Object.entries(applyLinks)) {
    try {
      await pool.query(
        `UPDATE scholarships SET apply_link = $1 WHERE name = $2 AND (apply_link IS NULL OR apply_link = '' OR apply_link IS NOT NULL)`,
        [link, name]
      );
    } catch (e) {
      console.log('Error updating:', name, e.message);
    }
  }
  console.log('Scholarship apply links updated!');

  if (parseInt(count.rows[0].count) === 0) {
    const scholarshipsData = [
      // KG to Class 10
      { name: 'NSP Pre-Matric Scholarship', description: 'Government support for Minority/SC/ST/OBC students. Covers tuition fees, books, uniform.', level: 'junior_kg', caste: ['sc', 'st', 'obc', 'minority', 'open'], amount: 1000, eligibility: 'Income < ₹1L, Jr. KG to Class 10', documents_required: ['Income Certificate', 'Aadhaar Card', 'Caste Certificate', 'Bank Passbook'], deadline: '2025-03-31', provider: 'National Scholarship Portal', apply_link: 'https://scholarships.gov.in' },
      { name: 'NMMS Scholarship', description: 'Merit-cum-means scholarship for Government school students. ₹12,000/year.', level: '1st_to_10th', caste: ['open'], amount: 12000, eligibility: 'MAT/SAT Exam qualified, Class 9-12 in Govt schools', documents_required: ['Marksheet', 'MAT/SAT Rank Card', 'School Bonafide'], deadline: '2025-02-28', provider: 'NCERT', apply_link: 'https://ncert.nic.in' },
      { name: 'PM YASASVI Scholarship', description: 'Merit scholarship for OBC/EBC/DNT students. ₹75,000/year.', level: '1st_to_10th', caste: ['obc', 'open'], amount: 75000, eligibility: 'Class 9 & 11 students, Income < ₹2.5L, Yashasvi Exam', documents_required: ['Caste Certificate', 'Income Certificate', 'Yashasvi Score Card', 'Aadhaar Card'], deadline: '2025-02-28', provider: 'NTA', apply_link: 'https://yet.nta.ac.in' },
      { name: 'ST Pre-Matric Scholarship', description: 'For ST students in Class 9-10. ₹225-₹525/month.', level: '1st_to_10th', caste: ['st'], amount: 525, eligibility: 'Income < ₹2.5L, Class 9-10 ST students', documents_required: ['Caste Certificate', 'Income Certificate', 'School Bonafide'], deadline: '2025-03-31', provider: 'Ministry of Tribal Affairs', apply_link: 'https://tribal.nic.in' },
      { name: 'State Girl Child Scholarship', description: 'For girl students. ₹10,000.', level: 'junior_kg', caste: ['open'], amount: 10000, eligibility: 'Girl student, State domicile', documents_required: ['Birth Certificate', 'Aadhaar Card', 'School Bonafide'], deadline: '2025-03-31', provider: 'State Portal', apply_link: '' },
      { name: 'CBSE Single Girl Child Scholarship', description: 'For CBSE single girl child. ₹500/month.', level: '1st_to_10th', caste: ['open'], amount: 6000, eligibility: 'Single girl child in CBSE school', documents_required: ['Affidavit', 'CBSE ID', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'CBSE', apply_link: 'https://cbse.gov.in' },
      
      // Class 11-12
      { name: 'NSP Post-Matric Scholarship', description: 'Government scholarship for Class 11 to PG students.', level: '11th_12th', caste: ['sc', 'st', 'obc'], amount: 3000, eligibility: 'Income < ₹2.5L, Class 11 to PG', documents_required: ['Caste Certificate', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'National Scholarship Portal', apply_link: 'https://scholarships.gov.in' },
      { name: 'LIC Scholarship', description: 'For Class 11 to UG students. ₹20,000/year.', level: '11th_12th', caste: ['open'], amount: 20000, eligibility: '60% marks, Class 11 to UG', documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'LIC of India', apply_link: 'https://licindia.in' },
      { name: 'Tata Pankh Scholarship', description: 'For Class 11 to UG. ₹12,000-₹50,000/year.', level: '11th_12th', caste: ['open'], amount: 50000, eligibility: 'Income < ₹2.5L, Class 11 to UG', documents_required: ['Income Certificate', 'Marksheet', 'Fee Receipt'], deadline: '2025-02-28', provider: 'Buddy4Study', apply_link: 'https://buddy4study.com' },
      
      // Diploma
      { name: 'AICTE Pragati Scholarship (Girls)', description: 'For girls in engineering/diploma courses. ₹50,000/year.', level: 'diploma', caste: ['open', 'obc', 'sc', 'st'], amount: 50000, eligibility: 'Girls in 1st/2nd year AICTE approved college', documents_required: ['Admission Proof', 'Income Certificate', 'Marksheet'], deadline: '2025-03-31', provider: 'AICTE', apply_link: 'https://aicte-india.org' },
      { name: 'AICTE Saksham Scholarship', description: 'For differently-abled students. ₹50,000/year.', level: 'diploma', caste: ['open'], amount: 50000, eligibility: 'Students with 40% disability, AICTE approved college', documents_required: ['Disability Certificate', 'Income Certificate', 'Admission Proof'], deadline: '2025-03-31', provider: 'AICTE', apply_link: 'https://aicte-india.org' },
      { name: 'AICTE Swanath Scholarship', description: 'For orphan/special category students. ₹50,000/year.', level: 'diploma', caste: ['open'], amount: 50000, eligibility: 'Orphan students in AICTE colleges', documents_required: ['Proof of Orphan/Special Category', 'Income Certificate'], deadline: '2025-03-31', provider: 'AICTE', apply_link: 'https://aicte-india.org' },
      
      // Graduate (UG)
      { name: 'INSPIRE Scholarship (SHE)', description: 'For Science students in BSc/MSc. ₹80,000/year.', level: 'graduate', caste: ['open'], amount: 80000, eligibility: 'Science students, Top 1% in Class 12', documents_required: ['Rank Proof', 'JEE/NEET Rank Card', 'Income Certificate'], deadline: '2025-03-31', provider: 'DST', apply_link: 'https://online-inspire.gov.in' },
      { name: 'Central Sector Scholarship', description: 'For top-performing UG/PG students. ₹10,000-₹20,000/year.', level: 'graduate', caste: ['open'], amount: 20000, eligibility: 'Top 20 percentile in Board exams, UG/PG', documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-02-28', provider: 'Ministry of Education', apply_link: 'https://scholarships.gov.in' },
      { name: 'PM-USP Scholarship', description: 'Central Sector Scholarship. 82,000 seats available.', level: 'graduate', caste: ['open'], amount: 20000, eligibility: 'Merit-based, Top 20 percentile', documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-02-28', provider: 'myScheme', apply_link: 'https://myscheme.gov.in' },
      { name: 'SBI Asha Scholarship', description: 'For Class 9 to PG. ₹15,000-₹50,000/year.', level: 'graduate', caste: ['open'], amount: 50000, eligibility: '75% marks (60% for SC/ST), Income < ₹3L', documents_required: ['Marksheet', 'Income Proof', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'SBI Foundation', apply_link: 'https://sbifoundation.in' },
      { name: 'Reliance Foundation Scholarship', description: 'Merit-based for UG students. ₹2 Lakh.', level: 'graduate', caste: ['open'], amount: 200000, eligibility: 'Merit-based, Good academic record', documents_required: ['Test Score', 'Marksheet', 'Personal Statement'], deadline: '2025-02-28', provider: 'Reliance Foundation', apply_link: 'https://reliancefoundation.org' },
      { name: 'Kotak Kanya Scholarship', description: 'For girl students in professional courses. ₹1.5 Lakh.', level: 'graduate', caste: ['open'], amount: 150000, eligibility: 'Girls in professional UG courses, 75% marks', documents_required: ['Marksheet', 'Income Certificate', 'College ID'], deadline: '2025-02-28', provider: 'Buddy4Study', apply_link: 'https://kotakeducation.org' },
      { name: "L'Oréal WINS Scholarship", description: 'Women in Science for UG. ₹60,000.', level: 'graduate', caste: ['open'], amount: 60000, eligibility: 'Girls in Science (PCM/B), 85% in Class 12', documents_required: ['Class 12 Marks', 'Personal Statement', 'Income Certificate'], deadline: '2025-03-31', provider: 'For Young Women in Science', apply_link: 'https://foryoungwomeninscience.com' },
      { name: 'MahaDBT EBC Scholarship', description: 'For Maharashtra EBC students. ₹25,000+/year.', level: 'graduate', caste: ['open'], amount: 25000, eligibility: 'Maharashtra students, Income < ₹8L', documents_required: ['Domicile Certificate', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'MahaDBT', apply_link: 'https://mahadbt.maharashtra.gov.in' },
      { name: 'Minority Merit Scholarship', description: 'For minority community students. ₹10,000+/year.', level: 'graduate', caste: ['minority'], amount: 10000, eligibility: 'Minority students, 50% marks, Income < ₹2L', documents_required: ['Minority Certificate', 'Income Certificate', 'Marksheet'], deadline: '2025-03-31', provider: 'National Scholarship Portal', apply_link: 'https://scholarships.gov.in' },
      { name: 'PM Scholarship Scheme (Armed Forces)', description: 'For children of defence personnel. ₹3,000/month.', level: 'graduate', caste: ['open', 'sc', 'st', 'obc'], amount: 36000, eligibility: 'Children of ex-servicemen/ serving defence personnel', documents_required: ['Defence Service Certificate', 'Aadhaar Card', 'College Bonafide'], deadline: '2025-03-31', provider: 'DESW', apply_link: 'https://desw.gov.in' },
      { name: 'SC Top Class Scholarship', description: 'For SC students in professional courses. ₹2L+/year.', level: 'graduate', caste: ['sc'], amount: 200000, eligibility: 'SC student, studying in professional course', documents_required: ['Caste Certificate', 'Income Certificate', 'College Bonafide'], deadline: '2025-03-31', provider: 'Social Justice Department', apply_link: 'https://socialjustice.gov.in' },
      { name: 'Top Class OBC Scholarship', description: 'For OBC students in professional courses. ₹2 Lakh.', level: 'graduate', caste: ['obc'], amount: 200000, eligibility: 'OBC students, studying in professional course', documents_required: ['Caste Certificate', 'Income Certificate', 'College Bonafide'], deadline: '2025-03-31', provider: 'Social Justice Department', apply_link: 'https://socialjustice.gov.in' },
      { name: 'Post Matric Disabled Scholarship', description: 'For differently-abled students. ₹2.5 Lakh.', level: 'graduate', caste: ['open'], amount: 250000, eligibility: '40% disability, studying in recognized institution', documents_required: ['Disability Certificate', 'Income Certificate', 'College Bonafide'], deadline: '2025-03-31', provider: 'National Scholarship Portal', apply_link: 'https://scholarships.gov.in' },
      { name: 'Beedi Worker Scholarship', description: 'For children of beedi workers. ₹25,000.', level: 'graduate', caste: ['open'], amount: 25000, eligibility: 'Parent should be a Beedi worker', documents_required: ['Parent ID/Proof', 'Aadhaar Card', 'Marksheet'], deadline: '2025-03-31', provider: 'Labour Ministry', apply_link: 'https://labour.gov.in' },
      { name: 'Cine Worker Scholarship', description: 'For children of cine workers. ₹25,000.', level: 'graduate', caste: ['open'], amount: 25000, eligibility: 'Parent should be a Cine worker', documents_required: ['Parent ID/Proof', 'Aadhaar Card', 'Marksheet'], deadline: '2025-03-31', provider: 'Labour Ministry', apply_link: 'https://labour.gov.in' },
      { name: 'Ishan Uday Scholarship', description: 'For North-East students. ₹7,800/month.', level: 'graduate', caste: ['open'], amount: 93600, eligibility: 'Students from North-Eastern Region (NER)', documents_required: ['Domicile Certificate', 'Income Certificate', 'Marksheet'], deadline: '2025-03-31', provider: 'UGC', apply_link: 'https://ugc.ac.in' },
      { name: 'NEC Merit Scholarship', description: 'For North-East students. ₹20,000.', level: 'graduate', caste: ['open'], amount: 20000, eligibility: 'Merit students from North-Eastern Region', documents_required: ['Domicile Certificate', 'Marksheet', 'Income Certificate'], deadline: '2025-03-31', provider: 'NEC', apply_link: 'https://necouncil.gov.in' },
      { name: 'PMSSS Scholarship', description: 'For J&K students. ₹1.5 Lakh.', level: 'graduate', caste: ['open'], amount: 150000, eligibility: 'J&K domicile students, UG in other states', documents_required: ['Domicile Certificate', 'Aadhaar Card', 'College Bonafide'], deadline: '2025-03-31', provider: 'AICTE', apply_link: 'https://aicte-india.org' },
      { name: 'Digital India Scholarship', description: 'For tech students. ₹50,000.', level: 'graduate', caste: ['open'], amount: 50000, eligibility: 'Tech students, Digital India project', documents_required: ['Project Work', 'College Bonafide', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'MeitY', apply_link: 'https://meity.gov.in' },
      
      // Post Graduate
      { name: 'UGC PG Single Girl Child Scholarship', description: 'For single girl child at PG level. ₹36,200/year.', level: 'post_graduate', caste: ['open'], amount: 36200, eligibility: 'Only girl child, 1st year PG student', documents_required: ['Affidavit', 'Graduation Marksheet', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'UGC', apply_link: 'https://ugc.ac.in' },
      { name: 'PG Rank Holder Scholarship', description: 'For PG students with good UG rank. ₹3,100/month.', level: 'post_graduate', caste: ['open'], amount: 37200, eligibility: 'Rank holder in UG, admitted to PG course', documents_required: ['UG Rank Proof', 'Marksheet', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'UGC', apply_link: 'https://ugc.ac.in' },
      { name: 'PG SC/ST Scholarship', description: 'For SC/ST PG students. ₹4,500-₹7,800/month.', level: 'post_graduate', caste: ['sc', 'st'], amount: 93600, eligibility: 'SC/ST students pursuing PG course', documents_required: ['Caste Certificate', 'Income Certificate', 'PG Admission Letter'], deadline: '2025-03-31', provider: 'UGC', apply_link: 'https://ugc.ac.in' },
      { name: 'AICTE GATE Scholarship', description: 'For GATE qualified PG students. ₹12,400/month.', level: 'post_graduate', caste: ['open'], amount: 148800, eligibility: 'GATE qualified, M.Tech/M.Arch students', documents_required: ['GATE Score Card', 'Graduation Marksheet', 'Income Certificate'], deadline: '2025-03-31', provider: 'AICTE', apply_link: 'https://aicte-india.org' },
      { name: 'UGC National PG Scholarship', description: 'For PG students. ₹36,000/year.', level: 'post_graduate', caste: ['open'], amount: 36000, eligibility: 'PG students, good academic record', documents_required: ['Graduation Marksheet', 'Income Certificate', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'UGC', apply_link: 'https://ugc.ac.in' },
      { name: 'Adobe Women in Tech Scholarship', description: 'For women in Computer Science. ₹1 Lakh.', level: 'post_graduate', caste: ['open'], amount: 100000, eligibility: 'Female tech students, B.Tech/M.Tech', documents_required: ['Resume', 'LOR', 'Academic Records'], deadline: '2025-02-28', provider: 'Adobe', apply_link: 'https://research.adobe.com' },
      { name: 'GyanDhan Scholarship', description: 'Merit test-based scholarship. ₹1 Lakh.', level: 'post_graduate', caste: ['open'], amount: 100000, eligibility: 'Based on merit test, No income limit', documents_required: ['Test Score', 'Marksheets', 'Aadhaar Card'], deadline: '2025-03-31', provider: 'GyanDhan', apply_link: 'https://gyandhan.com' },
      { name: 'KC Mahindra PG Scholarship', description: 'PG loan scholarship. ₹8 Lakh loan interest subsidy.', level: 'post_graduate', caste: ['open'], amount: 800000, eligibility: 'First Class Degree holders, PG Admission', documents_required: ['Degree Certificate', 'LOR', 'Income Certificate'], deadline: '2025-03-31', provider: 'K.C. Mahindra Trust', apply_link: 'https://kcmet.org' },
      { name: 'ST Fellowship', description: 'For ST students pursuing PG. ₹31,000/month.', level: 'post_graduate', caste: ['st'], amount: 372000, eligibility: 'ST student, pursuing PG course', documents_required: ['Caste Certificate', 'Income Certificate', 'PG Admission Letter'], deadline: '2025-03-31', provider: 'Ministry of Tribal Affairs', apply_link: 'https://tribal.nic.in' },
      
      // Master's/Abroad
      { name: 'GREAT Scholarship UK', description: 'For Indian students in UK. ₹10 Lakh.', level: 'master', caste: ['open'], amount: 1000000, eligibility: 'UG Degree, UK University Offer', documents_required: ['Offer Letter', 'IELTS Score', 'Passport'], deadline: '2025-02-28', provider: 'British Council', apply_link: 'https://study-uk.britishcouncil.org' },
      { name: 'Fulbright-Nehru Scholarship', description: 'Fully funded US Masters. Full Fund.', level: 'master', caste: ['open'], amount: 2000000, eligibility: 'UG Degree + Work Experience, GRE/TOEFL', documents_required: ['GRE Score', 'TOEFL Score', 'Work Experience Proof'], deadline: '2025-02-28', provider: 'USIEF', apply_link: 'https://usief.org.in' }
    ];

    for (const s of scholarshipsData) {
      await pool.query(
        `INSERT INTO scholarships (name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [s.name, s.description, s.level, s.caste, s.amount, s.eligibility, s.documents_required, s.deadline, s.provider, s.apply_link]
      );
    }
    console.log('All 42 scholarships seeded with official links!');
  }
};

// Create default admin
const createDefaultAdmin = async () => {
  const admin = await pool.query("SELECT * FROM users WHERE role = 'admin'");
  if (admin.rows.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Admin', 'Administrator', 'admin@scholarship.gov', hashedPassword, 'admin', '1234567890']
    );
    console.log('Default admin created: admin@scholarship.gov / admin123');
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDatabase();
  await seedScholarships();
  await createDefaultAdmin();
});
