const { pool } = require('../config/database');

// Upload results (Teacher/Admin)
exports.uploadResults = async (req, res) => {
  try {
    const { results } = req.body; // Array of result objects
    const uploadedBy = req.user.id;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'Results array is required' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const result of results) {
        const { student_code, subject_id, semester, academic_year, internal_marks, external_marks } = result;
        
        // Get student ID
        const [students] = await connection.query(
          'SELECT id FROM students WHERE student_code = ?',
          [student_code]
        );

        if (students.length === 0) {
          throw new Error(`Student not found: ${student_code}`);
        }

        const student_id = students[0].id;
        const total_marks = parseFloat(internal_marks) + parseFloat(external_marks);
        const grade = calculateGrade(total_marks);
        const status = total_marks >= 40 ? 'pass' : 'fail';

        // Insert or update result
        await connection.query(
          `INSERT INTO results (student_id, subject_id, semester, academic_year, internal_marks, external_marks, total_marks, grade, status, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           internal_marks = VALUES(internal_marks),
           external_marks = VALUES(external_marks),
           total_marks = VALUES(total_marks),
           grade = VALUES(grade),
           status = VALUES(status),
           uploaded_by = VALUES(uploaded_by),
           uploaded_at = CURRENT_TIMESTAMP`,
          [student_id, subject_id, semester, academic_year, internal_marks, external_marks, total_marks, grade, status, uploadedBy]
        );
      }

      await connection.commit();
      res.json({ success: true, message: 'Results uploaded successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Upload results error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get student results
exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.params.studentId;

    const [results] = await pool.query(
      `SELECT r.*, s.subject_code, s.subject_name, s.credits, u.full_name as uploaded_by_name
       FROM results r
       JOIN students st ON r.student_id = st.id
       JOIN subjects s ON r.subject_id = s.id
       JOIN users u ON r.uploaded_by = u.id
       WHERE st.user_id = ?
       ORDER BY r.semester DESC, r.academic_year DESC`,
      [studentId]
    );

    res.json({ success: true, results });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get results by semester
exports.getResultsBySemester = async (req, res) => {
  try {
    const { semester, division_id, subject_id } = req.query;

    let query = `
      SELECT r.*, st.student_code, st.roll_no, u.full_name as student_name, s.subject_code, s.subject_name
      FROM results r
      JOIN students st ON r.student_id = st.id
      JOIN users u ON st.user_id = u.id
      JOIN subjects s ON r.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (semester) {
      query += ' AND r.semester = ?';
      params.push(semester);
    }

    if (division_id) {
      query += ' AND st.division_id = ?';
      params.push(division_id);
    }

    if (subject_id) {
      query += ' AND r.subject_id = ?';
      params.push(subject_id);
    }

    query += ' ORDER BY st.roll_no';

    const [results] = await pool.query(query, params);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Get results by semester error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { subject_id, semester, division_id } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_students,
        AVG(total_marks) as average_marks,
        MAX(total_marks) as highest_marks,
        MIN(total_marks) as lowest_marks,
        SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
        SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as failed
      FROM results r
      JOIN students st ON r.student_id = st.id
      WHERE 1=1
    `;
    const params = [];

    if (subject_id) {
      query += ' AND r.subject_id = ?';
      params.push(subject_id);
    }

    if (semester) {
      query += ' AND r.semester = ?';
      params.push(semester);
    }

    if (division_id) {
      query += ' AND st.division_id = ?';
      params.push(division_id);
    }

    const [analytics] = await pool.query(query, params);
    res.json({ success: true, analytics: analytics[0] });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects ORDER BY semester, subject_code'
    );

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Get all subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Helper function to calculate grade
function calculateGrade(marks) {    
  if (marks >= 80) return 'O';
  if (marks >= 70) return 'A+';
  if (marks >= 60) return 'A';
  if (marks >= 55) return 'B+';
  if (marks >= 50) return 'B';
  if (marks >= 45) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}