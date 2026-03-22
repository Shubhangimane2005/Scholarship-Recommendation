const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixLinks() {
  console.log('Fixing scholarship apply links...\n');
  
  try {
    // First, delete all applications
    console.log('Deleting old applications...');
    await pool.query('DELETE FROM applications');
    console.log('Old applications deleted.\n');
    
    // Then delete all scholarships
    console.log('Deleting old scholarships...');
    await pool.query('DELETE FROM scholarships');
    console.log('Old scholarships deleted.\n');
    
    // Now insert all scholarships from scholarships-data.js
    const scholarships = require('./scholarships-data.js');
    
    console.log(`Inserting ${scholarships.length} scholarships...`);
    
    for (const s of scholarships) {
      try {
        await pool.query(
          `INSERT INTO scholarships (name, description, level, caste, amount, eligibility, documents_required, deadline, provider, apply_link, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
          [s.name, s.description, s.level, s.caste, s.amount, s.eligibility, s.documents_required, s.deadline, s.provider, s.apply_link]
        );
        console.log(`✅ Inserted: ${s.name}`);
      } catch (e) {
        console.log(`❌ Error: ${s.name} - ${e.message}`);
      }
    }
    
    console.log('\n✅ All scholarships inserted with apply links!');
    
    // Verify
    const result = await pool.query('SELECT name, apply_link FROM scholarships');
    console.log(`\nTotal scholarships: ${result.rows.length}`);
    
    let withLinks = 0;
    result.rows.forEach(row => {
      if (row.apply_link) {
        withLinks++;
      }
    });
    console.log(`Scholarships with apply links: ${withLinks}`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await pool.end();
}

fixLinks();
