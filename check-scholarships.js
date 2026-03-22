const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkScholarships() {
  console.log('Checking scholarships in database...\n');
  
  try {
    // Get all scholarships with their apply links
    const result = await pool.query('SELECT id, name, apply_link, level FROM scholarships ORDER BY id');
    
    console.log(`Total scholarships: ${result.rows.length}\n`);
    
    let withLink = 0;
    let withoutLink = 0;
    
    result.rows.forEach(s => {
      if (s.apply_link && s.apply_link.trim() !== '') {
        console.log(`✅ ${s.name}`);
        console.log(`   Link: ${s.apply_link}`);
        withLink++;
      } else {
        console.log(`❌ ${s.name}`);
        console.log(`   Link: (empty)`);
        withoutLink++;
      }
      console.log('');
    });
    
    console.log(`\nSummary:`);
    console.log(`  With links: ${withLink}`);
    console.log(`  Without links: ${withoutLink}`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await pool.end();
}

checkScholarships();
