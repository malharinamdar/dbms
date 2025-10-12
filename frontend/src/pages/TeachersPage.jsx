import { useState, useEffect } from 'react';
import { teacherAPI, adminAPI } from '../services/api';
import { UserPlus, Trash2, X } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  
  const [newTeacher, setNewTeacher] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const [assignForm, setAssignForm] = useState({
    teacher_id: '',
    subject_id: '',
    division_id: '',
    academic_year: '2024-25'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, divisionsRes] = await Promise.all([
        teacherAPI.getAllTeachers(),
        adminAPI.getAllSubjects(),
        adminAPI.getAllDivisions()
      ]);
      setTeachers(teachersRes.data.teachers);
      setSubjects(subjectsRes.data.subjects);
      setDivisions(divisionsRes.data.divisions);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addUser({
        ...newTeacher,
        role: 'teacher'
      });
      alert('Teacher added successfully!');
      setShowAddTeacher(false);
      setNewTeacher({ email: '', password: '', full_name: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.assignSubject(assignForm);
      alert('Subject assigned successfully!');
      setShowAssignForm(false);
      setAssignForm({ teacher_id: '', subject_id: '', division_id: '', academic_year: '2024-25' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign subject');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-2">Manage teachers and subject assignments</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddTeacher(!showAddTeacher)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Teacher
          </button>
          <button 
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="btn-secondary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Assign Subject
          </button>
        </div>
      </div>

      {/* ADD TEACHER FORM */}
      {showAddTeacher && (
        <div className="card border-2 border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Teacher</h2>
            <button onClick={() => setShowAddTeacher(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newTeacher.full_name}
                  onChange={(e) => setNewTeacher({...newTeacher, full_name: e.target.value})}
                  className="input-field"
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  className="input-field"
                  placeholder="teacher@college.edu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Add Teacher</button>
              <button type="button" onClick={() => setShowAddTeacher(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ASSIGN SUBJECT FORM */}
      {showAssignForm && (
        <div className="card border-2 border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Assign Subject to Teacher</h2>
            <button onClick={() => setShowAssignForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher *</label>
                <select
                  value={assignForm.teacher_id}
                  onChange={(e) => setAssignForm({...assignForm, teacher_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <select
                  value={assignForm.subject_id}
                  onChange={(e) => setAssignForm({...assignForm, subject_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Division *</label>
                <select
                  value={assignForm.division_id}
                  onChange={(e) => setAssignForm({...assignForm, division_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.division_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                <input
                  type="text"
                  value={assignForm.academic_year}
                  onChange={(e) => setAssignForm({...assignForm, academic_year: e.target.value})}
                  className="input-field"
                  placeholder="2024-25"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Assign Subject</button>
              <button type="button" onClick={() => setShowAssignForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* TEACHERS TABLE */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Teachers ({teachers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Assigned Subjects</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined Date</th>
              </tr>
            </thead>
            <tbody>
  {teachers.map((teacher, index) => (
    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4 font-medium text-gray-900">{teacher.full_name}</td>
      <td className="py-3 px-4 text-gray-700">{teacher.email}</td>
      <td className="py-3 px-4 text-center">
        {teacher.assigned_subject_codes ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {teacher.assigned_subject_codes.split(', ').map((code, i) => (
              <span key={i} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                {code}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No assignments</span>
        )}
      </td>
      <td className="py-3 px-4 text-gray-700">
        {new Date(teacher.created_at).toLocaleDateString()}
      </td>
    </tr>
  ))}
         </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}