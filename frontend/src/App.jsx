import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { 
  BarChart, GraduationCap, Users, ClipboardList, Calendar, 
  DollarSign, Wallet, Video, Clock 
} from './components/Icons';

// Public pages
import Home from './pages/Home';

import CourseDetail from './pages/CourseDetail';
import Teachers from './pages/Teachers';
import TeacherProfile from './pages/TeacherProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Enroll from './pages/Enroll';
import Login from './pages/Login';

import Pricing from './pages/Pricing';
import Curriculum from './pages/Curriculum';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminStudentPayments from './pages/admin/AdminStudentPayments';
import AdminTeacherPayments from './pages/admin/AdminTeacherPayments';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherRecordSession from './pages/teacher/TeacherRecordSession';
import TeacherTimeSlots from './pages/teacher/TeacherTimeSlots';
import TeacherCalendar from './pages/teacher/TeacherCalendar';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentReview from './pages/student/StudentReview';


import PlacementTest from './pages/PlacementTest';

import './App.css';

// Menu configs for each dashboard
const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <BarChart size={18} />, end: true },
  { path: '/admin/students', label: 'Students', icon: <GraduationCap size={18} /> },
  { path: '/admin/teachers', label: 'Teachers', icon: <Users size={18} /> },
  { path: '/admin/attendance', label: 'Attendance', icon: <ClipboardList size={18} /> },
  { path: '/admin/schedule', label: 'Schedule', icon: <Calendar size={18} /> },
  { path: '/admin/payments/students', label: 'Student Payments', icon: <DollarSign size={18} /> },
  { path: '/admin/payments/teachers', label: 'Teacher Payroll', icon: <Wallet size={18} /> },
];

const teacherMenu = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: <BarChart size={18} />, end: true },
  { path: '/teacher/record', label: 'Record Session', icon: <ClipboardList size={18} /> },
  { path: '/teacher/slots', label: 'Time Slots', icon: <Clock size={18} /> },
  { path: '/teacher/calendar', label: 'Calendar', icon: <Calendar size={18} /> },
];

const studentMenu = [
  { path: '/student/dashboard', label: 'Dashboard', icon: <BarChart size={18} />, end: true },
];

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Scroll to top button
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <button className={`scroll-to-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top">
      ↑
    </button>
  );
}

// Layout for public pages (with navbar + footer)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </>
  );
}

// Determine if route is a dashboard route
function AppRoutes() {
  const location = useLocation();
  const isDashboard = ['/admin', '/teacher', '/student'].some(p => location.pathname.startsWith(p));

  if (isDashboard) {
    return (
      <>
        <Navbar />
        <Routes>
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin" menuItems={adminMenu} />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="payments/students" element={<AdminStudentPayments />} />
            <Route path="payments/teachers" element={<AdminTeacherPayments />} />
          </Route>

          {/* Teacher routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <DashboardLayout role="teacher" menuItems={teacherMenu} />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="record" element={<TeacherRecordSession />} />
            <Route path="slots" element={<TeacherTimeSlots />} />
            <Route path="calendar" element={<TeacherCalendar />} />
          </Route>

          {/* Student routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout role="student" menuItems={studentMenu} />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="review/:sessionId" element={<StudentReview />} />

          </Route>
        </Routes>
      </>
    );
  }

  // Public routes
  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/curriculum/:id" element={<CourseDetail />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/teachers/:id" element={<TeacherProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/login" element={<Login />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/placement-tests" element={<PlacementTest />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </PublicLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
