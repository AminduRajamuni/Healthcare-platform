import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorTeleconferencesPage from './pages/doctor/DoctorTeleconferencesPage';
import DoctorSessionDetailsPage from './pages/doctor/DoctorSessionDetailsPage';
import DoctorActiveConsultationPage from './pages/doctor/DoctorActiveConsultationPage';
import PatientLoginPage from './pages/PatientLoginPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
import PatientRegistration from './pages/PatientRegistration';
import DoctorRegistration from './pages/DoctorRegistration';
import PatientSessionListPage from './pages/patient/PatientSessionListPage';
import PatientJoinSessionPage from './pages/patient/PatientJoinSessionPage';
import PatientSessionDetailsPage from './pages/patient/PatientSessionDetailsPage';
import PatientMedicalHistoryPage from './pages/patient/PatientMedicalHistoryPage';
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage';
import PatientReportsPage from './pages/patient/PatientReportsPage';
import PatientSearchDoctorsPage from './pages/patient/PatientSearchDoctorsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import AdminManagePatientsPage from './pages/admin/AdminManagePatientsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="glow-bg"></div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/patient/login" element={<PatientLoginPage />} />
          <Route path="/patient/register" element={<PatientRegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/doctor/teleconferences" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorTeleconferencesPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/teleconferences/session/:id" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorSessionDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/teleconferences/session/:id/active" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorActiveConsultationPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/sessions" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientSessionListPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/session/:id/join" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientJoinSessionPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/session/:id" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientSessionDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/patient/medical-history" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientMedicalHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientPrescriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/reports" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/search-doctors" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientSearchDoctorsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminManagePatientsPage />
            </ProtectedRoute>
          } />
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
