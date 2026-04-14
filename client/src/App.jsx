import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientRegistration from './pages/PatientRegistration';
import DoctorRegistration from './pages/DoctorRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="glow-bg"></div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register/patient" element={<PatientRegistration />} />
          <Route path="/register/doctor" element={<DoctorRegistration />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
