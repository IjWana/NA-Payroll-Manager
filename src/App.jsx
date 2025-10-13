import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { StaffProvider } from './context/StaffContext.jsx';
import { PayrollProvider } from './context/PayrollContext.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import {useAuth} from './context/AuthContext.jsx';



function PrivateRoute({children}){
  const {user} = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-gray-600">Page content will be implemented soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StaffProvider>
        <PayrollProvider>
          <Routes>
            {/* Public Routes  */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes  */}
            <Route element={ <PrivateRoute><Layout /> </PrivateRoute>}>        
              <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
              <Route path="/staff" element={<Placeholder title="Staff" />} />
              <Route path="/payroll" element={<Placeholder title="Payroll" />} />
              <Route path="/payslip" element={<Placeholder title="Payslip" />} />
              <Route path="/loans" element={<Placeholder title="Loans" />} />
              <Route path="/payrollcalendar" element={<Placeholder title="Payroll Calendar" />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
              <Route path="/reportsdocuments" element={<Placeholder title="Reports & Documents" />} />
              <Route path="/settings" element={<Placeholder title="Settings" />} />
              <Route path="/profile" element={<Placeholder title="Profile" />} />
            </Route>

            {/* Catch-all  */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PayrollProvider>
      </StaffProvider>
    </AuthProvider>
  );
}
