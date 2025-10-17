import { useState, useEffect } from 'react';
import { resultAPI, adminAPI } from '../services/api';
import { FileText, Download, Filter } from 'lucide-react';

export default function AllResults() {
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    semester: '',
    division_id: '',
    subject_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allResults]);

  const fetchData = async () => {
    try {
      const [resultsRes, subjectsRes, divisionsRes] = await Promise.all([
        resultAPI.getResultsBySemester({}), // Get all results
        adminAPI.getAllSubjects(),
        adminAPI.getAllDivisions()
      ]);
      setAllResults(resultsRes.data.results);
      setFilteredResults(resultsRes.data.results);
      setSubjects(subjectsRes.data.subjects);
      setDivisions(divisionsRes.data.divisions);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allResults];

    // Filter by semester
    if (filters.semester) {
      filtered = filtered.filter(r => r.semester === parseInt(filters.semester));
    }

    // Filter by division
    if (filters.division_id) {
      filtered = filtered.filter(r => {
        // Get student's division from student data
        const student = allResults.find(res => res.student_code === r.student_code);
        return student && student.division_id === parseInt(filters.division_id);
      });
    }

    // Filter by subject
    if (filters.subject_id) {
      filtered = filtered.filter(r => r.subject_id === parseInt(filters.subject_id));
    }

    setFilteredResults(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    setFilters({
      semester: '',
      division_id: '',
      subject_id: ''
    });
  };

  const exportResults = () => {
    // Convert to CSV
    const headers = ['Student', 'Roll No', 'Subject', 'Internal', 'External', 'Total', 'Grade', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(r => 
        `"${r.student_name}","${r.roll_no}","${r.subject_code}",${r.internal_marks},${r.external_marks},${r.total_marks},"${r.grade}","${r.status}"`
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Results</h1>
          <p className="text-gray-600 mt-2">View all uploaded examination results</p>
        </div>
        <button 
          onClick={exportResults}
          className="btn-primary flex items-center gap-2"
          disabled={filteredResults.length === 0}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters Card */}
      <div className="card border-2 border-primary-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="input-field"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            <select
              value={filters.division_id}
              onChange={(e) => handleFilterChange('division_id', e.target.value)}
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
              onChange={(e) => handleFilterChange('subject_id', e.target.value)}
              className="input-field"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.semester || filters.division_id || filters.subject_id) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active Filters:</span>
            {filters.semester && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                Semester {filters.semester}
              </span>
            )}
            {filters.division_id && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {divisions.find(d => d.id === parseInt(filters.division_id))?.division_name}
              </span>
            )}
            {filters.subject_id && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {subjects.find(s => s.id === parseInt(filters.subject_id))?.subject_code}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Total Results: <span className="text-primary-600">{filteredResults.length}</span>
          </h2>
          
          {filteredResults.length !== allResults.length && (
            <span className="text-sm text-gray-600">
              (Filtered from {allResults.length} total results)
            </span>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {allResults.length === 0 ? 'No results uploaded yet' : 'No results match your filters'}
            </p>
            {allResults.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters to see all results
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
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
                    <td className="py-3 px-4 text-gray-900">{result.student_name}</td>
                    <td className="py-3 px-4 text-gray-700">{result.roll_no}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="font-medium">{result.subject_code}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.semester}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.internal_marks}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.external_marks}</td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-900">{result.total_marks}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B+' || result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        result.grade === 'D' || result.grade === 'E' ? 'bg-orange-100 text-orange-800' :
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

      {/* Statistics Summary */}
      {filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Average Marks</p>
            <p className="text-2xl font-bold text-blue-600">
              {(filteredResults.reduce((sum, r) => sum + parseFloat(r.total_marks), 0) / filteredResults.length).toFixed(2)}
            </p>
          </div>
          
          <div className="card bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {((filteredResults.filter(r => r.status === 'pass').length / filteredResults.length) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="card bg-purple-50">
            <p className="text-sm text-gray-600 mb-1">Total Passed</p>
            <p className="text-2xl font-bold text-purple-600">
              {filteredResults.filter(r => r.status === 'pass').length}
            </p>
          </div>
          
          <div className="card bg-red-50">
            <p className="text-sm text-gray-600 mb-1">Total Failed</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredResults.filter(r => r.status === 'fail').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}