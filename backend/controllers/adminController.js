const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT s.*, u.email, u.full_name, d.division_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN divisions d ON s.division_id = d.id
       ORDER BY s.roll_no`
    );

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new user (Admin only)
exports.addUser = async (req, res) => {
  try {
    const { email, password, role, full_name, student_code, roll_no, division_id, batch, elective } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role, full_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, full_name]
    );

    // If student, insert into students table
    if (role === 'student' && student_code && roll_no) {
      await pool.query(
        'INSERT INTO students (user_id, student_code, roll_no, division_id, batch, elective) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, student_code, roll_no, division_id || null, batch || null, elective || null]
      );
    }

    res.status(201).json({ success: true, message: 'User added successfully' });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const [subjects] = await pool.query(
      'SELECT * FROM subjects ORDER BY semester, subject_name'
    );

    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Get all subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new subject
exports.addSubject = async (req, res) => {
  try {
    const { subject_code, subject_name, semester, credits } = req.body;

    await pool.query(
      'INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES (?, ?, ?, ?)',
      [subject_code, subject_name, semester, credits || 3]
    );

    res.status(201).json({ success: true, message: 'Subject added successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Subject code already exists' });
    }
    console.error('Add subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all divisions
exports.getAllDivisions = async (req, res) => {
  try {
    const [divisions] = await pool.query(
      'SELECT * FROM divisions ORDER BY year, semester, division_name'
    );

    res.json({ success: true, divisions });
  } catch (error) {
    console.error('Get all divisions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
        (SELECT COUNT(*) FROM subjects) as total_subjects,
        (SELECT COUNT(*) FROM results) as total_results
    `);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};