-- Create Database
CREATE DATABASE IF NOT EXISTS student_result_system;
USE student_result_system;

-- Users Table (Admin, Teachers, Students)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    division_id INT,
    batch VARCHAR(10),
    elective VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Divisions Table
CREATE TABLE divisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    division_name VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL
);

-- Subjects Table
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3
);

-- Teacher Subject Assignment
CREATE TABLE teacher_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    division_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, subject_id, division_id, academic_year)
);

-- Results Table
CREATE TABLE results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    internal_marks DECIMAL(5,2),
    external_marks DECIMAL(5,2),
    total_marks DECIMAL(5,2),
    grade VARCHAR(2),
    status ENUM('pass', 'fail', 'absent') DEFAULT 'pass',
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    UNIQUE KEY unique_result (student_id, subject_id, semester, academic_year)
);

-- Insert Default Admin
INSERT INTO users (email, password, role, full_name) 
VALUES ('admin@college.edu', '$2b$10$XqZ9YGz5vQYz9YGz5vQYz.XqZ9YGz5vQYz9YGz5vQYzOb8jKGiS4m', 'admin', 'System Administrator');
-- Default password: admin123 (will need to be hashed properly)

-- Insert Sample Divisions
INSERT INTO divisions (division_name, year, semester) VALUES
('Division 1', 2, 4),
('Division 2', 2, 4),
('Division 3', 2, 4),
('Division 4', 2, 4);

-- Insert Sample Subjects
INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES
('FJP', 'Full Stack Java Programming', 4, 4),
('CN', 'Computer Networks', 4, 4),
('OS', 'Operating Systems', 4, 3),
('DBMS', 'Database Management Systems', 4, 4),
('SE', 'Software Engineering', 4, 3);

-- Create indexes for better performance
CREATE INDEX idx_student_roll ON students(roll_no);
CREATE INDEX idx_student_code ON students(student_code);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_subject ON results(subject_id);
CREATE INDEX idx_teacher_subjects ON teacher_subjects(teacher_id, subject_id);