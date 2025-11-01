import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import { PayrollProvider } from './context/PayrollContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Payroll from './pages/Payroll.jsx';
import Reports from './pages/Reports.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import SignUp from './pages/SignUp.jsx';
import PersonnelManagement from './pages/PersonnelManagement.jsx';
import PayrollHistory from './pages/PayrollHistory.jsx';


export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <StaffProvider>
        <PayrollProvider>
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected (wrapped with Layout) */}
            <Route
              element={
                <PrivateRoute>
                  <NotificationsProvider>
                    <SearchProvider>
                      <Layout />
                    </SearchProvider>
                  </NotificationsProvider>
                </PrivateRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/personnel" element={<PersonnelManagement />} />
              <Route path="/history" element={<PayrollHistory />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PayrollProvider>
      </StaffProvider>
    </AuthProvider>
  );
}
