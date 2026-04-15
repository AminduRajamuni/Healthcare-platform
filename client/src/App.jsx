import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientLoginPage from './pages/PatientLoginPage';
import PatientRegisterPage from './pages/PatientRegisterPage';
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
