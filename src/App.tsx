import React from 'react';
import {
  BrowserRouter, Routes, Route, Navigate
} from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LaptopList } from './pages/laptops/LaptopList';
import { LaptopDetail } from './pages/laptops/LaptopDetail';
import { LaptopForm } from './pages/laptops/LaptopForm';
import { EmployeeList } from './pages/employees/EmployeeList';
import { EmployeeDetail } from './pages/employees/EmployeeDetail';
import { EmployeeForm } from './pages/employees/EmployeeForm';
import { AssignmentList } from './pages/assignments/AssignmentList';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { useAuthStore } from './store/authStore';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />

          {/* Laptops */}
          <Route path="laptops"          element={<LaptopList />} />
          <Route path="laptops/new"      element={<LaptopForm />} />
          <Route path="laptops/:id"      element={<LaptopDetail />} />
          <Route path="laptops/:id/edit" element={<LaptopForm />} />

          {/* Employees */}
          <Route path="employees"          element={<EmployeeList />} />
          <Route path="employees/new"      element={<EmployeeForm />} />
          <Route path="employees/:id"      element={<EmployeeDetail />} />
          <Route path="employees/:id/edit" element={<EmployeeForm />} />

          {/* Assignments */}
          <Route path="assignments" element={<AssignmentList />} />

          {/* System */}
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
