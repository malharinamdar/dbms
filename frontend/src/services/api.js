import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile')
};

// Result APIs
export const resultAPI = {
  uploadResults: (results) => api.post('/results/upload', { results }),
  getStudentResults: () => api.get('/results/student'),
  getResultsBySemester: (params) => api.get('/results/semester', { params }),
  getAnalytics: (params) => api.get('/results/analytics', { params }),

   // ⭐ ADD THIS NEW LINE ⭐
  getAllSubjects: () => api.get('/subjects')
};

// Teacher APIs
export const teacherAPI = {
  assignSubject: (data) => api.post('/teachers/assign', data),
  getAssignments: () => api.get('/teachers/assignments'),
  getAllTeachers: () => api.get('/teachers'),
  removeAssignment: (id) => api.delete(`/teachers/assignments/${id}`)
};

// Admin APIs
export const adminAPI = {
  getAllStudents: () => api.get('/admin/students'),
  addUser: (userData) => api.post('/admin/users', userData),
  getAllSubjects: () => api.get('/admin/subjects'),
  addSubject: (subjectData) => api.post('/admin/subjects', subjectData),
  getAllDivisions: () => api.get('/admin/divisions'),
  getDashboardStats: () => api.get('/admin/stats')
};

export default api;