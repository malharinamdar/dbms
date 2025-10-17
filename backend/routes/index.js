const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const resultController = require('../controllers/resultController');
const teacherController = require('../controllers/teacherController');
const adminController = require('../controllers/adminController');

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/profile', authenticate, authController.getProfile);

// Result Routes
router.post('/results/upload', authenticate, authorize('teacher', 'admin'), resultController.uploadResults);
router.get('/results/student', authenticate, resultController.getStudentResults);
router.get('/results/student/:studentId', authenticate, authorize('admin', 'teacher'), resultController.getStudentResults);
router.get('/results/semester', authenticate, authorize('admin', 'teacher'), resultController.getResultsBySemester);
router.get('/results/analytics', authenticate, authorize('admin', 'teacher'), resultController.getAnalytics);


router.get('/subjects', authenticate, resultController.getAllSubjects);

// Teacher Routes
router.post('/teachers/assign', authenticate, authorize('admin'), teacherController.assignSubject);
router.get('/teachers/assignments', authenticate, authorize('teacher'), teacherController.getTeacherAssignments);
router.get('/teachers/assignments/:teacherId', authenticate, authorize('admin'), teacherController.getTeacherAssignments);
router.get('/teachers', authenticate, authorize('admin'), teacherController.getAllTeachers);
router.delete('/teachers/assignments/:assignmentId', authenticate, authorize('admin'), teacherController.removeAssignment);

// Admin Routes
// Admin Routes
router.get('/admin/students', authenticate, authorize('admin', 'teacher'), adminController.getAllStudents);
router.post('/admin/users', authenticate, authorize('admin'), adminController.addUser);
router.get('/admin/subjects', authenticate, authorize('admin', 'teacher'), adminController.getAllSubjects);
router.post('/admin/subjects', authenticate, authorize('admin'), adminController.addSubject);
router.get('/admin/divisions', authenticate, authorize('admin', 'teacher'), adminController.getAllDivisions);
router.get('/admin/stats', authenticate, authorize('admin'), adminController.getDashboardStats);

module.exports = router;