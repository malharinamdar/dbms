import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { teacherAPI, resultAPI } from '../services/api';
import { BookOpen, FileText, Upload, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ totalAssignments: 0, totalResults: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const assignmentsRes = await teacherAPI.getAssignments();
      setAssignments(assignmentsRes.data.assignments);
      setStats({
        totalAssignments: assignmentsRes.data.assignments.length,
        totalResults: 0 // You can add API call for teacher's uploaded results count
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.full_name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">My Subjects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Results Uploaded</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalResults}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Semester</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/upload-results')}
              className="w-full text-left px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-primary-700" />
                <div>
                  <p className="font-medium text-primary-900">Upload Results</p>
                  <p className="text-sm text-primary-700">Add student examination results</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/view-results')}
              className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-green-700" />
                <div>
                  <p className="font-medium text-green-900">View Results</p>
                  <p className="text-sm text-green-700">Check uploaded results</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* My Subjects */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Subjects</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.map((assignment, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{assignment.subject_code} - {assignment.subject_name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Division: {assignment.division_name} | Semester: {assignment.semester}
                </p>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No subjects assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}