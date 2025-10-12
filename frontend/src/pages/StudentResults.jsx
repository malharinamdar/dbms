import { useState, useEffect } from 'react';
import { resultAPI } from '../services/api';
import { FileText, TrendingUp, Award, Calendar } from 'lucide-react';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await resultAPI.getStudentResults();
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = selectedSemester === 'all' 
    ? results 
    : results.filter(r => r.semester === parseInt(selectedSemester));

  const calculateStats = () => {
  if (filteredResults.length === 0) return { avgMarks: 0, totalCredits: 0, cgpa: 0 };
  
  // Calculate grade points based on marks
  const getGradePoint = (marks) => {
    if (marks >= 80) return 10;
    if (marks >= 70) return 9;
    if (marks >= 60) return 8;
    if (marks >= 55) return 7;
    if (marks >= 50) return 6;
    if (marks >= 45) return 5;
    if (marks >= 40) return 4;
    return 0; // Fail
  };
  
  const totalMarks = filteredResults.reduce((sum, r) => sum + parseFloat(r.total_marks), 0);
  const avgMarks = totalMarks / filteredResults.length;
  const totalCredits = filteredResults.reduce((sum, r) => sum + r.credits, 0);
  
  // Calculate CGPA using grade points
  const totalGradePoints = filteredResults.reduce((sum, r) => {
    const gradePoint = getGradePoint(parseFloat(r.total_marks));
    return sum + (gradePoint * r.credits);
  }, 0);
  
  const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  
  return { avgMarks: avgMarks.toFixed(2), totalCredits, cgpa };
};

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
          <p className="text-gray-600 mt-2">View your semester examination results</p>
        </div>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Semesters</option>
          {[...new Set(results.map(r => r.semester))].sort().map(sem => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Marks</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgMarks}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Credits</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCredits}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">CGPA</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cgpa}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Examination Results</h2>
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No results available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Name</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Semester</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Internal</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">External</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{result.subject_code}</td>
                    <td className="py-3 px-4 text-gray-700">{result.subject_name}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.semester}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.internal_marks}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.external_marks}</td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-900">{result.total_marks}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B+' || result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}