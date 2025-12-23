
import React, { useState, useEffect } from 'react';
import { UserRole, Course } from './types';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AuthPage from './pages/AuthPage';
import { INITIAL_COURSES } from './constants';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Persistence logic
  useEffect(() => {
    // Courses
    const savedCourses = localStorage.getItem('edustream_courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(INITIAL_COURSES);
      localStorage.setItem('edustream_courses', JSON.stringify(INITIAL_COURSES));
    }

    // Progress
    const savedProgress = localStorage.getItem('edustream_progress');
    if (savedProgress) {
      setCompletedLessonIds(JSON.parse(savedProgress));
    }

    // Auth status (session based for better security, or localStorage for persistence)
    const authStatus = localStorage.getItem('edustream_admin_auth');
    if (authStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleUpdateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('edustream_courses', JSON.stringify(newCourses));
  };

  const handleToggleComplete = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const next = prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId) 
        : [...prev, lessonId];
      localStorage.setItem('edustream_progress', JSON.stringify(next));
      return next;
    });
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('edustream_admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('edustream_admin_auth');
    setRole('student');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        role={role} 
        onRoleChange={setRole} 
        isAdminLoggedIn={isAdminLoggedIn} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 bg-slate-50">
        {role === 'admin' ? (
          isAdminLoggedIn ? (
            <AdminDashboard courses={courses} onUpdateCourses={handleUpdateCourses} />
          ) : (
            <AuthPage onLoginSuccess={handleLoginSuccess} />
          )
        ) : (
          <UserDashboard 
            courses={courses} 
            completedLessonIds={completedLessonIds} 
            onToggleComplete={handleToggleComplete} 
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Prestma Academy Learning Management System. Built for Educators.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
