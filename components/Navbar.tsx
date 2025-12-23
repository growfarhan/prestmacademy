
import React from 'react';
import { BookOpen, ShieldCheck, User, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onRoleChange, isAdminLoggedIn, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-indigo-900 italic">Prestma <span className="text-indigo-600">Academy</span></span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
            <button
              onClick={() => onRoleChange('student')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <User size={16} /> Student
              </div>
            </button>
            <button
              onClick={() => onRoleChange('admin')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                role === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} /> Instructor
              </div>
            </button>
          </div>

          {role === 'admin' && isAdminLoggedIn && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-red-100"
              title="Logout Instructor"
            >
              <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
