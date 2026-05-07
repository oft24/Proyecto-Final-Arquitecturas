import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage";
import DoctorAgendaPage from "./pages/doctor/DoctorAgendaPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientRecordsPage from "./pages/patient/PatientRecordsPage";
import PatientBookPage from "./pages/patient/PatientBookPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleGuard } from "./routes/RoleGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard role="medico" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/agenda" element={<DoctorAgendaPage />} />
          <Route path="/doctor/pacientes" element={<DoctorPatientsPage />} />
        </Route>
        <Route element={<RoleGuard role="paciente" />}>
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient/citas" element={<PatientAppointmentsPage />} />
          <Route path="/patient/expediente" element={<PatientRecordsPage />} />
          <Route path="/patient/agendar" element={<PatientBookPage />} />
        </Route>
        <Route element={<RoleGuard role="recepcionista" />}>
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient/citas" element={<PatientAppointmentsPage />} />
          <Route path="/patient/expediente" element={<PatientRecordsPage />} />
          <Route path="/patient/agendar" element={<PatientBookPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
