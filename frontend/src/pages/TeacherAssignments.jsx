import { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';
import { BookOpen } from 'lucide-react';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        <p className="text-gray-600 mt-2">Subjects assigned to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{assignment.subject_code}</h3>
                <p className="text-sm text-gray-600 mt-1">{assignment.subject_name}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Division:</span> {assignment.division_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Semester:</span> {assignment.semester}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Credits:</span> {assignment.credits}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Academic Year:</span> {assignment.academic_year}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No subjects assigned yet</p>
        </div>
      )}
    </div>
  );
}