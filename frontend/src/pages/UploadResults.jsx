import { useState, useEffect } from 'react';
import { resultAPI, adminAPI, teacherAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, Plus, Trash2, CheckCircle, AlertCircle, Users, BookOpen } from 'lucide-react';

export default function UploadResults() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [results, setResults] = useState([{ student_code: '', subject_id: '', semester: '4', academic_year: '2024-25', internal_marks: '', external_marks: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedDivision, students]);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching data for upload results...');
      console.log('👤 Current user role:', user.role);
      
      let subjectsData = [];
      
      // If teacher, get only assigned subjects
      if (user.role === 'teacher') {
        try {
          const assignmentsRes = await teacherAPI.getAssignments();
          const teacherAssignments = assignmentsRes.data.assignments || [];
          setAssignments(teacherAssignments);
          
          // Extract unique subjects from assignments
          const uniqueSubjects = [];
          const subjectIds = new Set();
          
          teacherAssignments.forEach(assignment => {
            if (!subjectIds.has(assignment.subject_id)) {
              subjectIds.add(assignment.subject_id);
              uniqueSubjects.push({
                id: assignment.subject_id,
                subject_code: assignment.subject_code,
                subject_name: assignment.subject_name,
                credits: assignment.credits
              });
            }
          });
          
          subjectsData = uniqueSubjects;
          console.log('✅ Teacher assigned subjects:', subjectsData.length);
          
          if (subjectsData.length === 0) {
            setMessage({ 
              type: 'error', 
              text: 'No subjects assigned to you. Please contact admin to assign subjects.' 
            });
          }
        } catch (error) {
          console.error('❌ Error fetching teacher assignments:', error);
          setMessage({ 
            type: 'error', 
            text: 'Failed to fetch your assigned subjects. Please contact admin.' 
          });
        }
      } else {
        // If admin, get all subjects
        try {
          const subjectsRes = await resultAPI.getAllSubjects();
          subjectsData = subjectsRes.data.subjects || [];
          console.log('✅ All subjects fetched:', subjectsData.length);
        } catch (error) {
          console.error('❌ Error fetching subjects:', error);
          try {
            const subjectsRes = await adminAPI.getAllSubjects();
            subjectsData = subjectsRes.data.subjects || [];
            console.log('✅ Subjects fetched from admin endpoint:', subjectsData.length);
          } catch (adminError) {
            console.error('❌ Error fetching subjects from admin:', adminError);
          }
        }
      }
      
      setSubjects(subjectsData);

      // Fetch students
      let studentsData = [];
      try {
        const studentsRes = await adminAPI.getAllStudents();
        studentsData = studentsRes.data.students || [];
        console.log('✅ Students fetched:', studentsData.length);
      } catch (error) {
        console.error('❌ Error fetching students:', error);
      }
      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Fetch divisions
      let divisionsData = [];
      try {
        const divisionsRes = await adminAPI.getAllDivisions();
        divisionsData = divisionsRes.data.divisions || [];
        console.log('✅ Divisions fetched:', divisionsData.length);
      } catch (error) {
        console.error('❌ Error fetching divisions:', error);
      }
      setDivisions(divisionsData);

    } catch (error) {
      console.error('❌ Failed to fetch data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load data. Please check your permissions or contact admin.' 
      });
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.roll_no?.includes(searchTerm)
      );
    }

    if (selectedDivision) {
      filtered = filtered.filter(s => s.division_id === parseInt(selectedDivision));
    }

    setFilteredStudents(filtered);
  };

  const addResultRow = () => {
    setResults([...results, { student_code: '', subject_id: '', semester: '4', academic_year: '2024-25', internal_marks: '', external_marks: '' }]);
  };

  const removeResultRow = (index) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const updateResult = (index, field, value) => {
    const updatedResults = [...results];
    updatedResults[index][field] = value;
    setResults(updatedResults);
  };

  const addResultForStudent = (studentCode) => {
    const existingIndex = results.findIndex(r => r.student_code === studentCode);
    
    if (existingIndex !== -1) {
      document.getElementById(`student-code-${existingIndex}`)?.focus();
      setMessage({ type: 'error', text: `Result entry for ${studentCode} already exists!` });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setResults([...results, { 
        student_code: studentCode, 
        subject_id: '', 
        semester: '4', 
        academic_year: '2024-25', 
        internal_marks: '', 
        external_marks: '' 
      }]);
      setMessage({ type: 'success', text: `Added entry for ${studentCode}` });
      setTimeout(() => setMessage(null), 2000);
      
      setTimeout(() => {
        const newIndex = results.length;
        document.getElementById(`student-code-${newIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const invalidEntries = results.filter(r => 
      !r.student_code || !r.subject_id || !r.internal_marks || !r.external_marks
    );

    if (invalidEntries.length > 0) {
      setMessage({ type: 'error', text: 'Please fill all required fields!' });
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Uploading results:', results);
      await resultAPI.uploadResults(results);
      setMessage({ type: 'success', text: `Successfully uploaded ${results.length} result(s)!` });
      setResults([{ student_code: '', subject_id: '', semester: '4', academic_year: '2024-25', internal_marks: '', external_marks: '' }]);
      
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('❌ Upload error:', error);
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

      {/* Show assigned subjects for teachers */}
      {user.role === 'teacher' && subjects.length > 0 && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Your Assigned Subjects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="font-bold text-gray-900">{subject.subject_code}</p>
                <p className="text-sm text-gray-600">{subject.subject_name}</p>
                <p className="text-xs text-gray-500 mt-1">{subject.credits} Credits</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-3">
            ℹ️ You can only upload results for these subjects
          </p>
        </div>
      )}

      {/* Students List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            Students List
          </h2>
          <span className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">{filteredStudents.length}</span> students
          </span>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">No students data available</p>
            <p className="text-sm text-yellow-700 mt-2">
              You may not have permission to view students. Contact admin if needed.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Student</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Search by name, student code, or roll no..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Division</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Divisions</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.division_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Division</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        No students found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{student.student_code}</td>
                        <td className="py-3 px-4 text-gray-700">{student.roll_no}</td>
                        <td className="py-3 px-4 text-gray-700">{student.full_name}</td>
                        <td className="py-3 px-4 text-gray-700">{student.division_name || '-'}</td>
                        <td className="py-3 px-4 text-gray-700">{student.batch || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => addResultForStudent(student.student_code)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                          >
                            Add Result
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Result Entries ({results.length})</h2>
        
        {subjects.length === 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ {user.role === 'teacher' ? 'No subjects assigned to you. Please contact admin.' : 'No subjects available. Please add subjects first.'}
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Result #{index + 1}</h3>
                {results.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeResultRow(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remove this entry"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id={`student-code-${index}`}
                    type="text"
                    value={result.student_code}
                    onChange={(e) => updateResult(index, 'student_code', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="E2K231316"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={result.subject_id}
                    onChange={(e) => updateResult(index, 'subject_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={result.semester}
                    onChange={(e) => updateResult(index, 'semester', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="4"
                    min="1"
                    max="8"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={result.academic_year}
                    onChange={(e) => updateResult(index, 'academic_year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="2024-25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Marks (0-30) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={result.internal_marks}
                    onChange={(e) => updateResult(index, 'internal_marks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="25"
                    min="0"
                    max="30"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External Marks (0-70) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={result.external_marks}
                    onChange={(e) => updateResult(index, 'external_marks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="40"
                    min="0"
                    max="70"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {result.internal_marks && result.external_marks && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <span className="font-medium text-blue-900">Total: </span>
                  <span className="text-blue-800">
                    {(parseFloat(result.internal_marks) + parseFloat(result.external_marks)).toFixed(2)} / 100
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={addResultRow}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Result
          </button>
          
          <button
            type="submit"
            disabled={loading || subjects.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Uploading...' : `Upload ${results.length} Result(s)`}
          </button>
        </div>
      </form>
    </div>
  );
}