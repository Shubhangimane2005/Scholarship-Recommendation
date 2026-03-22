const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkApplications() {
  console.log('Checking applications in database...\n');
  
  try {
    // Get all applications with user and scholarship info
    const result = await pool.query(`
      SELECT a.id, a.status, a.applied_at, 
             u.first_name, u.last_name, u.email, u.phone,
             s.name as scholarship_name, s.amount
      FROM applications a
      JOIN users u ON a.user_id = u.id
      JOIN scholarships s ON a.scholarship_id = s.id
      ORDER BY a.applied_at DESC
    `);
    
    console.log(`Total applications: ${result.rows.length}\n`);
    
    result.rows.forEach(app => {
      console.log(`Application #${app.id}`);
      console.log(`  Student: ${app.first_name} ${app.last_name}`);
      console.log(`  Email: ${app.email}`);
      console.log(`  Phone: ${app.phone || 'N/A'}`);
      console.log(`  Scholarship: ${app.scholarship_name}`);
      console.log(`  Amount: ₹${app.amount}`);
      console.log(`  Status: ${app.status}`);
      console.log(`  Applied: ${app.applied_at}`);
      console.log('');
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await pool.end();
}

checkApplications();
