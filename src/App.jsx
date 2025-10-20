import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import { PayrollProvider } from './context/PayrollContext.jsx';
import { NotificationsProvider } from './context/NotificationsContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Staff from './pages/Staff.jsx';
import Payroll from './pages/Payroll.jsx';
import Payslip from './pages/Payslip.jsx';
import Loans from './pages/Loans.jsx';
import PayrollCalendar from './pages/PayrollCalendar.jsx';
import Reports from './pages/Reports.jsx';
import ReportsAndDocuments from './pages/ReportsAndDocuments.jsx';
import Settings from './pages/Settings.jsx';



function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}



export default function App() {
  return (
    <AuthProvider>
      <StaffProvider>
        <PayrollProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

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
              <Route path="/staff" element={<Staff />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/payslip" element={<Payslip />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/payrollcalendar" element={<PayrollCalendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reportsdocuments" element={<ReportsAndDocuments />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PayrollProvider>
      </StaffProvider>
    </AuthProvider>
  );
}
