import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, LayoutDashboard, FileText, Users, BookOpen, 
  Settings, LogOut, Menu, X, UserCircle 
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
  const commonItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }
  ];

  if (user.role === 'admin') {
    return [
      ...commonItems,
      { icon: Users, label: 'Students', path: '/dashboard/students' },
      { icon: Users, label: 'Teachers', path: '/dashboard/teachers' },
      { icon: BookOpen, label: 'Subjects', path: '/dashboard/subjects' },
      { icon: FileText, label: 'All Results', path: '/dashboard/all-results' }
    ];
  } else if (user.role === 'teacher') {
    return [
      ...commonItems,
      { icon: BookOpen, label: 'My Subjects', path: '/dashboard/assignments' },
      { icon: FileText, label: 'Upload Results', path: '/dashboard/upload-results' },
      { icon: FileText, label: 'View Results', path: '/dashboard/view-results' }
    ];
  } else {
    // Student
    return [
      ...commonItems,
      { icon: FileText, label: 'My Results', path: '/dashboard/results' }
    ];
  }
};

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white border-r border-gray-200`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">SRMS</h1>
                <p className="text-xs text-gray-500">Result System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
              <UserCircle className="w-8 h-8 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, <span className="font-medium">{user.full_name}</span></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}