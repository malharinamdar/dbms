import { useState, useEffect } from 'react';
import { resultAPI, adminAPI } from '../services/api';
import { FileText, Download } from 'lucide-react';

export default function AllResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await resultAPI.getResultsBySemester({});
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
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
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Total Results: {results.length}
        </h2>
        {results.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No results uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
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
                    <td className="py-3 px-4 text-gray-900">{result.student_name}</td>
                    <td className="py-3 px-4 text-gray-700">{result.roll_no}</td>
                    <td className="py-3 px-4 text-gray-700">{result.subject_code}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.internal_marks}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{result.external_marks}</td>
                    <td className="py-3 px-4 text-center font-semibold text-gray-900">{result.total_marks}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.grade === 'A+' || result.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B+' || result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
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