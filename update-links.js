const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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

async function updateLinks() {
  console.log('Updating scholarship links...');
  
  let updated = 0;
  for (const [name, link] of Object.entries(applyLinks)) {
    try {
      const result = await pool.query(
        `UPDATE scholarships SET apply_link = $1 WHERE name = $2 RETURNING *`,
        [link, name]
      );
      if (result.rowCount > 0) {
        console.log(`✅ Updated: ${name} -> ${link || '(empty)'}`);
        updated++;
      }
    } catch (e) {
      console.log(`❌ Error updating ${name}:`, e.message);
    }
  }
  
  console.log(`\n🎉 Updated ${updated} scholarships with apply links!`);
  
  // Show current links
  const current = await pool.query('SELECT name, apply_link FROM scholarships LIMIT 10');
  console.log('\nCurrent links in database:');
  current.rows.forEach(row => {
    console.log(`  ${row.name}: ${row.apply_link || '(empty)'}`);
  });
  
  await pool.end();
}

updateLinks();
