import { useState, useEffect } from 'react';
import { resultAPI, adminAPI } from '../services/api';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadResults() {
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([{ student_code: '', subject_id: '', semester: '', academic_year: '', internal_marks: '', external_marks: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getAllSubjects();
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const addResultRow = () => {
    setResults([...results, { student_code: '', subject_id: '', semester: '', academic_year: '', internal_marks: '', external_marks: '' }]);
  };

  const removeResultRow = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const updateResult = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await resultAPI.uploadResults(results);
      setMessage({ type: 'success', text: 'Results uploaded successfully!' });
      setResults([{ student_code: '', subject_id: '', semester: '', academic_year: '', internal_marks: '', external_marks: '' }]);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload results' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Results</h1>
        <p className="text-gray-600 mt-2">Enter student results for the semester</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Result #{index + 1}</h3>
                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResultRow(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Code</label>
                  <input
                    type="text"
                    value={result.student_code}
                    onChange={(e) => updateResult(index, 'student_code', e.target.value)}
                    className="input-field"
                    placeholder="E2K23151"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={result.subject_id}
                    onChange={(e) => updateResult(index, 'subject_id', e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subject_code} - {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                  <input
                    type="number"
                    value={result.semester}
                    onChange={(e) => updateResult(index, 'semester', e.target.value)}
                    className="input-field"
                    placeholder="4"
                    min="1"
                    max="8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <input
                    type="text"
                    value={result.academic_year}
                    onChange={(e) => updateResult(index, 'academic_year', e.target.value)}
                    className="input-field"
                    placeholder="2024-25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Marks</label>
                  <input
                    type="number"
                    value={result.internal_marks}
                    onChange={(e) => updateResult(index, 'internal_marks', e.target.value)}
                    className="input-field"
                    placeholder="30"
                    min="0"
                    max="40"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">External Marks</label>
                  <input
                    type="number"
                    value={result.external_marks}
                    onChange={(e) => updateResult(index, 'external_marks', e.target.value)}
                    className="input-field"
                    placeholder="50"
                    min="0"
                    max="60"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={addResultRow}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Result
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Upload Results'}
          </button>
        </div>
      </form>
    </div>
  );
}