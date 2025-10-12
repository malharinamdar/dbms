import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentResults from './pages/StudentResults';
import UploadResults from './pages/UploadResults';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import SubjectsPage from './pages/SubjectsPage';
import TeacherAssignments from './pages/TeacherAssignments';
import ViewResults from './pages/ViewResults';
import AllResults from './pages/AllResults';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function DashboardHome() {
  const { user } = useAuth();
  
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="upload-results" element={<UploadResults />} />
            <Route path="view-results" element={<ViewResults />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="all-results" element={<AllResults />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;