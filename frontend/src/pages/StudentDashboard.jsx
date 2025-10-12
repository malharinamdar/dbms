import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resultAPI, adminAPI } from '../services/api';
import { User, Mail, BookOpen, Award, GraduationCap, Calendar, RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resultsCount: 0, avgMarks: 0 });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data for user:', user);
      
      const [resultsRes, subjectsRes] = await Promise.all([
        resultAPI.getStudentResults(),
        resultAPI.getAllSubjects() // ⭐ Changed from adminAPI to resultAPI ⭐
      ]);
      
      console.log('✅ Results API Response:', resultsRes);
      console.log('✅ Subjects API Response:', subjectsRes);
      
      // Extract results array from response
      const results = resultsRes.data?.results || [];
      console.log('📊 Extracted Results Array:', results);
      
      // Calculate stats
      let avgMarks = 0;
      let resultsCount = 0;
      
      if (Array.isArray(results) && results.length > 0) {
        resultsCount = results.length;
        
        // Calculate average from total_marks field (as per backend)
        const totalSum = results.reduce((sum, r) => {
          const marks = parseFloat(r.total_marks || 0);
          console.log(`Processing result: subject=${r.subject_code}, marks=${marks}`);
          return sum + marks;
        }, 0);
        
        avgMarks = (totalSum / results.length).toFixed(2);
        console.log('📈 Calculated - Total:', totalSum, 'Count:', resultsCount, 'Average:', avgMarks);
      } else {
        console.warn('⚠️ No results found or invalid results array');
      }
      
      setStats({ resultsCount, avgMarks });
      
      // Extract subjects array from response
      const allSubjects = subjectsRes.data?.subjects || [];
      console.log('📚 Extracted Subjects Array:', allSubjects);
      
      if (Array.isArray(allSubjects)) {
        setSubjects(allSubjects);
        console.log(`✅ Set ${allSubjects.length} subjects`);
      } else {
        console.error('❌ Subjects is not an array:', allSubjects);
        setSubjects([]);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setError(error.response?.data?.message || error.message);
      setStats({ resultsCount: 0, avgMarks: 0 });
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter subjects for semester 4
  const semester4Subjects = subjects.filter(s => {
    const sem = parseInt(s.semester);
    return sem === 4;
  });

  console.log(`🎯 Filtered ${semester4Subjects.length} semester 4 subjects from ${subjects.length} total subjects`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.full_name}!</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">⚠️ Error loading data</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Student Info Card */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600" />
          My Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <User className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-semibold text-gray-900">{user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <Mail className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-900 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Student Code</p>
              <p className="font-semibold text-gray-900">{user.student_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <Calendar className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Roll Number</p>
              <p className="font-semibold text-gray-900">{user.roll_no}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Division</p>
              <p className="font-semibold text-gray-900">{user.division_id || 'Not Assigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
            <Award className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500">Batch / Elective</p>
              <p className="font-semibold text-gray-900">{user.batch || '-'} / {user.elective || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Results</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resultsCount}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.resultsCount === 0 ? 'No results uploaded yet' : 'Examination results'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Marks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgMarks}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.avgMarks > 0 ? 'Overall performance' : 'No marks available'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* All Subjects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Subjects (Semester 4)</h2>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {semester4Subjects.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No subjects available for semester 4</p>
            <p className="text-sm text-gray-500 mt-2">
              {subjects.length > 0 
                ? `Total subjects in database: ${subjects.length}` 
                : 'No subjects found in database'}
            </p>
            {subjects.length > 0 && (
              <details className="mt-4 text-left max-w-md mx-auto">
                <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                  View all subjects (Debug)
                </summary>
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  {subjects.map((s, i) => (
                    <div key={i} className="py-1">
                      {s.subject_code} - {s.subject_name} (Sem: {s.semester})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Showing {semester4Subjects.length} subjects for your current semester
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {semester4Subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{subject.subject_code}</h3>
                      <p className="text-sm text-gray-600 mt-1 break-words">{subject.subject_name}</p>
                      <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs text-gray-500">Semester: {subject.semester}</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {subject.credits} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      
    </div>
  );
}