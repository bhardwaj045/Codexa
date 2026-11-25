import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { MyProgressPage } from './pages/MyProgressPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminManageProblemsPage } from './pages/AdminManageProblemsPage';
import { AdminProblemFormPage } from './pages/AdminProblemFormPage';
import { AdminManageTestCasesPage } from './pages/AdminManageTestCasesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

const AppLayoutWrapper = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Problem workspace and dedicated split screen pages manage their own chrome
  const isWorkspace = location.pathname.startsWith('/problems/') && location.pathname !== '/problems';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAppLayoutPage = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/progress') ||
                          location.pathname === '/problems' ||
                          location.pathname === '/submissions' ||
                          location.pathname === '/leaderboard';

  // Show top navbar/footer on Home Page, but not on workspace, auth, or internal app layout pages (which have their own sidebar)
  const showNavbarFooter = location.pathname === '/' || (!isAuthenticated && !isWorkspace && !isAuthPage && !isAppLayoutPage);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {showNavbarFooter && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute requireAdmin={false} />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/progress" element={<MyProgressPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/problems" element={<AdminManageProblemsPage />} />
            <Route path="/admin/problems/new" element={<AdminProblemFormPage />} />
            <Route path="/admin/problems/edit/:id" element={<AdminProblemFormPage />} />
            <Route path="/admin/problems/:id/test-cases" element={<AdminManageTestCasesPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNavbarFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayoutWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
