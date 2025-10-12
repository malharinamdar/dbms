const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get additional info based on role
    let additionalInfo = {};
    if (user.role === 'student') {
      const [students] = await pool.query(
      'SELECT student_code, roll_no, division_id, batch, elective FROM students WHERE user_id = ?',
      [user.id]
    );

    if (students.length > 0) {
    additionalInfo = {
      student_code: students[0].student_code,
      roll_no: students[0].roll_no,
      division_id: students[0].division_id,
      batch: students[0].batch || '-',
      elective: students[0].elective || '-'
    };
  }
}

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        ...additionalInfo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        ...additionalInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, full_name, student_code, roll_no, division_id, batch, elective } = req.body;

    // Validate required fields
    if (!email || !password || !role || !full_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

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

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, role, full_name, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = users[0];

    // Get student info if student
    if (profile.role === 'student') {
      const [students] = await pool.query(
        'SELECT student_code, roll_no, division_id, batch, elective FROM students WHERE user_id = ?',
        [profile.id]
      );
      if (students.length > 0) {
        profile = { ...profile, ...students[0] };
      }
    }

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};