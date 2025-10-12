const { pool } = require('../config/database');

// Assign subject to teacher (Admin only)
exports.assignSubject = async (req, res) => {
  try {
    const { teacher_id, subject_id, division_id, academic_year } = req.body;

    if (!teacher_id || !subject_id || !division_id || !academic_year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify teacher exists and has teacher role
    const [teachers] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "teacher"',
      [teacher_id]
    );

    if (teachers.length === 0) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Insert assignment
    await pool.query(
      'INSERT INTO teacher_subjects (teacher_id, subject_id, division_id, academic_year) VALUES (?, ?, ?, ?)',
      [teacher_id, subject_id, division_id, academic_year]
    );

    res.json({ success: true, message: 'Subject assigned successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'This assignment already exists' });
    }
    console.error('Assign subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get teacher assignments
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.role === 'teacher' ? req.user.id : req.params.teacherId;

    const [assignments] = await pool.query(
      `SELECT ts.*, s.subject_code, s.subject_name, s.credits, d.division_name, d.year, d.semester
       FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.id
       JOIN divisions d ON ts.division_id = d.id
       WHERE ts.teacher_id = ?
       ORDER BY ts.academic_year DESC, d.semester DESC`,
      [teacherId]
    );

    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teachers (Admin only)
exports.getAllTeachers = async (req, res) => {
  try {
    const [teachers] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.created_at,
       GROUP_CONCAT(DISTINCT s.subject_code SEPARATOR ', ') as assigned_subject_codes,
       COUNT(DISTINCT ts.id) as assigned_subjects
       FROM users u
       LEFT JOIN teacher_subjects ts ON u.id = ts.teacher_id
       LEFT JOIN subjects s ON ts.subject_id = s.id
       WHERE u.role = 'teacher'
       GROUP BY u.id
       ORDER BY u.full_name`
    );

    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Get all teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove subject assignment (Admin only)
exports.removeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM teacher_subjects WHERE id = ?',
      [assignmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};