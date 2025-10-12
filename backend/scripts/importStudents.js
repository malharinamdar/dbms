// import_students.js
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database'); // assume mysql2/promise pool
require('dotenv').config();
const fs = require('fs');
const path = require('path');

/**
 * Parse CSV file (simple parser tailored for your file)
 * - Accepts fields with optional double quotes
 * - Trims values
 * - Returns array of objects keyed by header
 */
function parseStudentsFromFile(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').trim();
  if (!csvContent) return [];

  const lines = csvContent.split('\n');
  const header = lines[0].split(',').map(h => h.trim());

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // split CSV respecting double quotes (handles fields like "Last, First")
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"' && line[j+1] === '"') { // escaped quote ""
        cur += '"';
        j++; // skip the next quote
        continue;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      } else if (ch === ',' && !inQuotes) {
        values.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur.trim());

    if (values.length !== header.length) {
      console.warn(`Skipping malformed line ${i+1} (expected ${header.length} cols, got ${values.length}): ${line}`);
      continue;
    }

    const obj = {};
    for (let k = 0; k < header.length; k++) {
      // remove surrounding quotes if any (already mostly handled but keep safe)
      let v = values[k];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      obj[header[k]] = v;
    }

    rows.push({
      student_code: obj.Student_Code || '',
      roll_no: obj.Roll_No || '',
      name: obj.Name || '',
      division_id_raw: obj.Division_ID || '',
      batch: obj.Batch || null,
      elective: obj.Elective || null
    });
  }

  return rows;
}

async function importStudents() {
  // adjust path if needed — example uses project root; change to /mnt/data/student_data.txt if that is where your file lives
  const STUDENT_DATA_PATH = path.join(__dirname, '..', '..', 'student_data.txt');
  // If you want the exact path from this environment, uncomment:
  // const STUDENT_DATA_PATH = '/mnt/data/student_data.txt';

  if (!fs.existsSync(STUDENT_DATA_PATH)) {
    console.error('Student data file not found at', STUDENT_DATA_PATH);
    process.exit(1);
  }

  const students = parseStudentsFromFile(STUDENT_DATA_PATH);
  console.log(`Parsed ${students.length} rows from ${STUDENT_DATA_PATH}`);

  if (students.length === 0) {
    console.log('No students to import.');
    process.exit(0);
  }

  const defaultPasswordHash = await bcrypt.hash('student123', 10);

  // Pre-prepare SQL strings
  const insertUserSql = 'INSERT INTO users (email, password, role, full_name) VALUES (?, ?, ?, ?)';
  const selectUserSql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
  const insertStudentSql = `INSERT INTO students (user_id, student_code, roll_no, division_id, batch, elective) 
                           VALUES (?, ?, ?, ?, ?, ?)`;

  let imported = 0, skipped = 0, failed = 0;

  // process sequentially (safe). For larger files consider batching or a limited concurrency pool.
  for (const s of students) {
    const email = `${s.student_code.toLowerCase()}@college.edu`;

    // normalize division_id: parseInt or set null
    let division_id = null;
    if (s.division_id_raw && s.division_id_raw.trim() !== '') {
      const parsed = parseInt(s.division_id_raw, 10);
      if (Number.isFinite(parsed)) division_id = parsed;
      else division_id = null;
    }

    // normalize batch/elective to null if empty string
    const batch = s.batch && s.batch.trim() !== '' ? s.batch.trim() : null;
    const elective = s.elective && s.elective.trim() !== '' ? s.elective.trim() : null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Try to insert user. If duplicate, select existing user id.
      let userId;
      try {
        const [res] = await conn.query(insertUserSql, [email, defaultPasswordHash, 'student', s.name]);
        userId = res.insertId;
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          // user exists — fetch id
          const [rows] = await conn.query(selectUserSql, [email]);
          if (rows.length > 0) {
            userId = rows[0].id;
            // optionally update password/name if you want:
            // await conn.query('UPDATE users SET password = ?, full_name = ? WHERE id = ?', [defaultPasswordHash, s.name, userId]);
          } else {
            throw err; // unexpected, rethrow
          }
        } else {
          throw err;
        }
      }

      // Insert student row — handle duplicate student_code gracefully
      try {
        await conn.query(insertStudentSql, [userId, s.student_code, s.roll_no, division_id, batch, elective]);
      } catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          // student already exists — skip or update as necessary
          skipped++;
          console.warn(`Skipping duplicate student ${s.student_code} (${s.name})`);
          await conn.rollback();
          conn.release();
          continue;
        } else {
          throw err;
        }
      }

      await conn.commit();
      imported++;
      console.log(`Imported: ${s.student_code} — ${s.name}`);
    } catch (err) {
      failed++;
      console.error(`Failed to import ${s.student_code} (${s.name}):`, err.message);
      try { await conn.rollback(); } catch (_) {}
    } finally {
      conn.release();
    }
  }

  console.log(`Done. Imported: ${imported}, Skipped: ${skipped}, Failed: ${failed}`);
  process.exit(0);
}

importStudents().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});
