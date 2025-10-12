import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, UserPlus, X } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    full_name: '',
    student_code: '',
    roll_no: '',
    division_id: '',
    batch: '',
    elective: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, divisionsRes] = await Promise.all([
        adminAPI.getAllStudents(),
        adminAPI.getAllDivisions()
      ]);
      setStudents(studentsRes.data.students);
      setDivisions(divisionsRes.data.divisions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addUser({
        ...newStudent,
        role: 'student'
      });
      alert('Student added successfully!');
      setShowAddForm(false);
      setNewStudent({
        email: '',
        password: '',
        full_name: '',
        student_code: '',
        roll_no: '',
        division_id: '',
        batch: '',
        elective: ''
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.includes(searchTerm) ||
    s.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">Manage student accounts</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* ADD STUDENT FORM */}
      {showAddForm && (
        <div className="card border-2 border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Student</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="input-field"
                  placeholder="student@college.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Code *</label>
                <input
                  type="text"
                  value={newStudent.student_code}
                  onChange={(e) => setNewStudent({...newStudent, student_code: e.target.value})}
                  className="input-field"
                  placeholder="E2K23001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  value={newStudent.roll_no}
                  onChange={(e) => setNewStudent({...newStudent, roll_no: e.target.value})}
                  className="input-field"
                  placeholder="32001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                <select
                  value={newStudent.division_id}
                  onChange={(e) => setNewStudent({...newStudent, division_id: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.division_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <input
                  type="text"
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({...newStudent, batch: e.target.value})}
                  className="input-field"
                  placeholder="K5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Elective</label>
                <input
                  type="text"
                  value={newStudent.elective}
                  onChange={(e) => setNewStudent({...newStudent, elective: e.target.value})}
                  className="input-field"
                  placeholder="FJP"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Add Student</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND TABLE */}
      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by name, roll no, or student code..."
            />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Total Students: <span className="font-bold text-gray-900">{filteredStudents.length}</span></p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Division</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Batch</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Elective</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{student.student_code}</td>
                  <td className="py-3 px-4 text-gray-700">{student.roll_no}</td>
                  <td className="py-3 px-4 text-gray-700">{student.full_name}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm">{student.email}</td>
                  <td className="py-3 px-4 text-gray-700">{student.division_name || '-'}</td>
                  <td className="py-3 px-4 text-gray-700">{student.batch || '-'}</td>
                  <td className="py-3 px-4 text-gray-700">{student.elective || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}