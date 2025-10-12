import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BookOpen, Plus } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subject_code: '',
    subject_name: '',
    semester: '',
    credits: 3
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getAllSubjects();
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addSubject(newSubject);
      alert('Subject added successfully!');
      setShowAddForm(false);
      setNewSubject({ subject_code: '', subject_name: '', semester: '', credits: 3 });
      fetchSubjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add subject');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage course subjects</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Subject</h2>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                <input
                  type="text"
                  value={newSubject.subject_code}
                  onChange={(e) => setNewSubject({...newSubject, subject_code: e.target.value})}
                  className="input-field"
                  placeholder="CS101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.subject_name}
                  onChange={(e) => setNewSubject({...newSubject, subject_name: e.target.value})}
                  className="input-field"
                  placeholder="Computer Networks"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <input
                  type="number"
                  value={newSubject.semester}
                  onChange={(e) => setNewSubject({...newSubject, semester: e.target.value})}
                  className="input-field"
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credits</label>
                <input
                  type="number"
                  value={newSubject.credits}
                  onChange={(e) => setNewSubject({...newSubject, credits: e.target.value})}
                  className="input-field"
                  min="1"
                  max="6"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Add Subject</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Subjects</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Name</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Semester</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Credits</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{subject.subject_code}</td>
                  <td className="py-3 px-4 text-gray-700">{subject.subject_name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.semester}</td>
                  <td className="py-3 px-4 text-center text-gray-700">{subject.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}