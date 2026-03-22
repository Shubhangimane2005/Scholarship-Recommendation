const scholarships = [
  // KG to Class 10
  { 
    name: 'NSP Pre-Matric Scholarship', 
    level: 'junior_kg', 
    caste: ['sc', 'st', 'obc', 'minority', 'open'], 
    amount: 1000, 
    eligibility: 'Income < ₹1L, Jr. KG to Class 10', 
    documents_required: ['Income Certificate', 'Aadhaar Card', 'Caste Certificate', 'Bank Passbook'], 
    deadline: '2025-03-31', 
    provider: 'National Scholarship Portal', 
    apply_link: 'https://scholarships.gov.in'
  },
  { 
    name: 'NMMS Scholarship', 
    level: '1st_to_10th', 
    caste: ['open'], 
    amount: 12000, 
    eligibility: 'MAT/SAT Exam qualified, Class 9-12 in Govt schools', 
    documents_required: ['Marksheet', 'MAT/SAT Rank Card', 'School Bonafide'], 
    deadline: '2025-02-28', 
    provider: 'NCERT', 
    apply_link: 'https://ncert.nic.in'
  },
  { 
    name: 'PM YASASVI Scholarship', 
    level: '1st_to_10th', 
    caste: ['obc', 'open'], 
    amount: 75000, 
    eligibility: 'Class 9 & 11 students, Income < ₹2.5L, Yashasvi Exam', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'Yashasvi Score Card', 'Aadhaar Card'], 
    deadline: '2025-02-28', 
    provider: 'NTA', 
    apply_link: 'https://yet.nta.ac.in'
  },
  { 
    name: 'ST Pre-Matric Scholarship', 
    level: '1st_to_10th', 
    caste: ['st'], 
    amount: 525, 
    eligibility: 'Income < ₹2.5L, Class 9-10 ST students', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'School Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'Ministry of Tribal Affairs', 
    apply_link: 'https://tribal.nic.in'
  },
  { 
    name: 'State Girl Child Scholarship', 
    level: 'junior_kg', 
    caste: ['open'], 
    amount: 10000, 
    eligibility: 'Girl student, State domicile', 
    documents_required: ['Birth Certificate', 'Aadhaar Card', 'School Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'State Portal', 
    apply_link: ''
  },
  { 
    name: 'CBSE Single Girl Child Scholarship', 
    level: '1st_to_10th', 
    caste: ['open'], 
    amount: 6000, 
    eligibility: 'Single girl child in CBSE school', 
    documents_required: ['Affidavit', 'CBSE ID', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'CBSE', 
    apply_link: 'https://cbse.gov.in'
  },
  
  // Class 11-12
  { 
    name: 'NSP Post-Matric Scholarship', 
    level: '11th_12th', 
    caste: ['sc', 'st', 'obc'], 
    amount: 3000, 
    eligibility: 'Income < ₹2.5L, Class 11 to PG', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'National Scholarship Portal', 
    apply_link: 'https://scholarships.gov.in'
  },
  { 
    name: 'LIC Scholarship', 
    level: '11th_12th', 
    caste: ['open'], 
    amount: 20000, 
    eligibility: '60% marks, Class 11 to UG', 
    documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'LIC of India', 
    apply_link: 'https://licindia.in'
  },
  { 
    name: 'Tata Pankh Scholarship', 
    level: '11th_12th', 
    caste: ['open'], 
    amount: 50000, 
    eligibility: 'Income < ₹2.5L, Class 11 to UG', 
    documents_required: ['Income Certificate', 'Marksheet', 'Fee Receipt'], 
    deadline: '2025-02-28', 
    provider: 'Buddy4Study', 
    apply_link: 'https://buddy4study.com'
  },
  
  // Diploma
  { 
    name: 'AICTE Pragati Scholarship (Girls)', 
    level: 'diploma', 
    caste: ['open', 'obc', 'sc', 'st'], 
    amount: 50000, 
    eligibility: 'Girls in 1st/2nd year AICTE approved college', 
    documents_required: ['Admission Proof', 'Income Certificate', 'Marksheet'], 
    deadline: '2025-03-31', 
    provider: 'AICTE', 
    apply_link: 'https://aicte-india.org'
  },
  { 
    name: 'AICTE Saksham Scholarship', 
    level: 'diploma', 
    caste: ['open'], 
    amount: 50000, 
    eligibility: 'Students with 40% disability, AICTE approved college', 
    documents_required: ['Disability Certificate', 'Income Certificate', 'Admission Proof'], 
    deadline: '2025-03-31', 
    provider: 'AICTE', 
    apply_link: 'https://aicte-india.org'
  },
  { 
    name: 'AICTE Swanath Scholarship', 
    level: 'diploma', 
    caste: ['open'], 
    amount: 50000, 
    eligibility: 'Orphan students in AICTE colleges', 
    documents_required: ['Proof of Orphan/Special Category', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'AICTE', 
    apply_link: 'https://aicte-india.org'
  },
  
  // Graduate (UG)
  { 
    name: 'INSPIRE Scholarship (SHE)', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 80000, 
    eligibility: 'Science students, Top 1% in Class 12', 
    documents_required: ['Rank Proof', 'JEE/NEET Rank Card', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'DST', 
    apply_link: 'https://online-inspire.gov.in'
  },
  { 
    name: 'Central Sector Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 20000, 
    eligibility: 'Top 20 percentile in Board exams, UG/PG', 
    documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-02-28', 
    provider: 'Ministry of Education', 
    apply_link: 'https://scholarships.gov.in'
  },
  { 
    name: 'PM-USP Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 20000, 
    eligibility: 'Merit-based, Top 20 percentile', 
    documents_required: ['Marksheet', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-02-28', 
    provider: 'myScheme', 
    apply_link: 'https://myscheme.gov.in'
  },
  { 
    name: 'SBI Asha Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 50000, 
    eligibility: '75% marks (60% for SC/ST), Income < ₹3L', 
    documents_required: ['Marksheet', 'Income Proof', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'SBI Foundation', 
    apply_link: 'https://sbifoundation.in'
  },
  { 
    name: 'Reliance Foundation Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 200000, 
    eligibility: 'Merit-based, Good academic record', 
    documents_required: ['Test Score', 'Marksheet', 'Personal Statement'], 
    deadline: '2025-02-28', 
    provider: 'Reliance Foundation', 
    apply_link: 'https://reliancefoundation.org'
  },
  { 
    name: 'Kotak Kanya Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 150000, 
    eligibility: 'Girls in professional UG courses, 75% marks', 
    documents_required: ['Marksheet', 'Income Certificate', 'College ID'], 
    deadline: '2025-02-28', 
    provider: 'Buddy4Study', 
    apply_link: 'https://kotakeducation.org'
  },
  { 
    name: "L'Oréal WINS Scholarship", 
    level: 'graduate', 
    caste: ['open'], 
    amount: 60000, 
    eligibility: 'Girls in Science (PCM/B), 85% in Class 12', 
    documents_required: ['Class 12 Marks', 'Personal Statement', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'For Young Women in Science', 
    apply_link: 'https://foryoungwomeninscience.com'
  },
  { 
    name: 'MahaDBT EBC Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 25000, 
    eligibility: 'Maharashtra students, Income < ₹8L', 
    documents_required: ['Domicile Certificate', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'MahaDBT', 
    apply_link: 'https://mahadbt.maharashtra.gov.in'
  },
  { 
    name: 'Minority Merit Scholarship', 
    level: 'graduate', 
    caste: ['minority'], 
    amount: 10000, 
    eligibility: 'Minority students, 50% marks, Income < ₹2L', 
    documents_required: ['Minority Certificate', 'Income Certificate', 'Marksheet'], 
    deadline: '2025-03-31', 
    provider: 'National Scholarship Portal', 
    apply_link: 'https://scholarships.gov.in'
  },
  { 
    name: 'PM Scholarship Scheme (Armed Forces)', 
    level: 'graduate', 
    caste: ['open', 'sc', 'st', 'obc'], 
    amount: 36000, 
    eligibility: 'Children of ex-servicemen/ serving defence personnel', 
    documents_required: ['Defence Service Certificate', 'Aadhaar Card', 'College Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'DESW', 
    apply_link: 'https://desw.gov.in'
  },
  { 
    name: 'SC Top Class Scholarship', 
    level: 'graduate', 
    caste: ['sc'], 
    amount: 200000, 
    eligibility: 'SC student, studying in professional course', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'College Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'Social Justice Department', 
    apply_link: 'https://socialjustice.gov.in'
  },
  { 
    name: 'Top Class OBC Scholarship', 
    level: 'graduate', 
    caste: ['obc'], 
    amount: 200000, 
    eligibility: 'OBC students, studying in professional course', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'College Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'Social Justice Department', 
    apply_link: 'https://socialjustice.gov.in'
  },
  { 
    name: 'Post Matric Disabled Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 250000, 
    eligibility: '40% disability, studying in recognized institution', 
    documents_required: ['Disability Certificate', 'Income Certificate', 'College Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'National Scholarship Portal', 
    apply_link: 'https://scholarships.gov.in'
  },
  { 
    name: 'Beedi Worker Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 25000, 
    eligibility: 'Parent should be a Beedi worker', 
    documents_required: ['Parent ID/Proof', 'Aadhaar Card', 'Marksheet'], 
    deadline: '2025-03-31', 
    provider: 'Labour Ministry', 
    apply_link: 'https://labour.gov.in'
  },
  { 
    name: 'Cine Worker Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 25000, 
    eligibility: 'Parent should be a Cine worker', 
    documents_required: ['Parent ID/Proof', 'Aadhaar Card', 'Marksheet'], 
    deadline: '2025-03-31', 
    provider: 'Labour Ministry', 
    apply_link: 'https://labour.gov.in'
  },
  { 
    name: 'Ishan Uday Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 93600, 
    eligibility: 'Students from North-Eastern Region (NER)', 
    documents_required: ['Domicile Certificate', 'Income Certificate', 'Marksheet'], 
    deadline: '2025-03-31', 
    provider: 'UGC', 
    apply_link: 'https://ugc.ac.in'
  },
  { 
    name: 'NEC Merit Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 20000, 
    eligibility: 'Merit students from North-Eastern Region', 
    documents_required: ['Domicile Certificate', 'Marksheet', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'NEC', 
    apply_link: 'https://necouncil.gov.in'
  },
  { 
    name: 'PMSSS Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 150000, 
    eligibility: 'J&K domicile students, UG in other states', 
    documents_required: ['Domicile Certificate', 'Aadhaar Card', 'College Bonafide'], 
    deadline: '2025-03-31', 
    provider: 'AICTE', 
    apply_link: 'https://aicte-india.org'
  },
  { 
    name: 'Digital India Scholarship', 
    level: 'graduate', 
    caste: ['open'], 
    amount: 50000, 
    eligibility: 'Tech students, Digital India project', 
    documents_required: ['Project Work', 'College Bonafide', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'MeitY', 
    apply_link: 'https://meity.gov.in'
  },
  
  // Post Graduate
  { 
    name: 'UGC PG Single Girl Child Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 36200, 
    eligibility: 'Only girl child, 1st year PG student', 
    documents_required: ['Affidavit', 'Graduation Marksheet', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'UGC', 
    apply_link: 'https://ugc.ac.in'
  },
  { 
    name: 'PG Rank Holder Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 37200, 
    eligibility: 'Rank holder in UG, admitted to PG course', 
    documents_required: ['UG Rank Proof', 'Marksheet', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'UGC', 
    apply_link: 'https://ugc.ac.in'
  },
  { 
    name: 'PG SC/ST Scholarship', 
    level: 'post_graduate', 
    caste: ['sc', 'st'], 
    amount: 93600, 
    eligibility: 'SC/ST students pursuing PG course', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'PG Admission Letter'], 
    deadline: '2025-03-31', 
    provider: 'UGC', 
    apply_link: 'https://ugc.ac.in'
  },
  { 
    name: 'AICTE GATE Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 148800, 
    eligibility: 'GATE qualified, M.Tech/M.Arch students', 
    documents_required: ['GATE Score Card', 'Graduation Marksheet', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'AICTE', 
    apply_link: 'https://aicte-india.org'
  },
  { 
    name: 'UGC National PG Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 36000, 
    eligibility: 'PG students, good academic record', 
    documents_required: ['Graduation Marksheet', 'Income Certificate', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'UGC', 
    apply_link: 'https://ugc.ac.in'
  },
  { 
    name: 'Adobe Women in Tech Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 100000, 
    eligibility: 'Female tech students, B.Tech/M.Tech', 
    documents_required: ['Resume', 'LOR', 'Academic Records'], 
    deadline: '2025-02-28', 
    provider: 'Adobe', 
    apply_link: 'https://research.adobe.com'
  },
  { 
    name: 'GyanDhan Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 100000, 
    eligibility: 'Based on merit test, No income limit', 
    documents_required: ['Test Score', 'Marksheets', 'Aadhaar Card'], 
    deadline: '2025-03-31', 
    provider: 'GyanDhan', 
    apply_link: 'https://gyandhan.com'
  },
  { 
    name: 'KC Mahindra PG Scholarship', 
    level: 'post_graduate', 
    caste: ['open'], 
    amount: 800000, 
    eligibility: 'First Class Degree holders, PG Admission', 
    documents_required: ['Degree Certificate', 'LOR', 'Income Certificate'], 
    deadline: '2025-03-31', 
    provider: 'K.C. Mahindra Trust', 
    apply_link: 'https://kcmet.org'
  },
  { 
    name: 'ST Fellowship', 
    level: 'post_graduate', 
    caste: ['st'], 
    amount: 372000, 
    eligibility: 'ST student, pursuing PG course', 
    documents_required: ['Caste Certificate', 'Income Certificate', 'PG Admission Letter'], 
    deadline: '2025-03-31', 
    provider: 'Ministry of Tribal Affairs', 
    apply_link: 'https://tribal.nic.in'
  },
  
  // Master's/Abroad
  { 
    name: 'GREAT Scholarship UK', 
    level: 'master', 
    caste: ['open'], 
    amount: 1000000, 
    eligibility: 'UG Degree, UK University Offer', 
    documents_required: ['Offer Letter', 'IELTS Score', 'Passport'], 
    deadline: '2025-02-28', 
    provider: 'British Council', 
    apply_link: 'https://study-uk.britishcouncil.org'
  },
  { 
    name: 'Fulbright-Nehru Scholarship', 
    level: 'master', 
    caste: ['open'], 
    amount: 2000000, 
    eligibility: 'UG Degree + Work Experience, GRE/TOEFL', 
    documents_required: ['GRE Score', 'TOEFL Score', 'Work Experience Proof'], 
    deadline: '2025-02-28', 
    provider: 'USIEF', 
    apply_link: 'https://usief.org.in'
  }
];

module.exports = scholarships;
