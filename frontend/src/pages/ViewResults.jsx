import { useState, useEffect } from 'react';
import { resultAPI, adminAPI } from '../services/api';
import { Search, Filter } from 'lucide-react';

export default function ViewResults() {
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    semester: '4',
    division_id: '',
    subject_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [subjectsRes, divisionsRes] = await Promise.all([
        adminAPI.getAllSubjects(),
        adminAPI.getAllDivisions()
      ]);
      setSubjects(subjectsRes.data.subjects);
      setDivisions(divisionsRes.data.divisions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await resultAPI.getResultsBySemester(filters);
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">View Results</h1>
        <p className="text-gray-600 mt-2">View uploaded student results</p>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <input
              type="number"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
              className="input-field"
              min="1"
              max="8"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            <select
              value={filters.division_id}
              onChange={(e) => setFilters({...filters, division_id: e.target.value})}
              className="input-field"
            >
              <option value="">All Divisions</option>
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.division_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subject_id}
              onChange={(e) => setFilters({...filters, subject_id: e.target.value})}
              className="input-field"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Results ({results.length})
        </h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No results found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Internal</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">External</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{result.student_code}</td>
                    <td className="py-3 px-4 text-gray-700">{result.roll_no}</td>
                    <td className="py-3 px-4 text-gray-700">{result.student_name}</td>
                    <td className="py-3 px-4 text-gray-700">{result.subject_code}</td>
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