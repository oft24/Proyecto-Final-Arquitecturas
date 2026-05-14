import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DoctorDashboardPage from "./pages/doctor/DoctorDashboardPage";
import DoctorAgendaPage from "./pages/doctor/DoctorAgendaPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import DoctorAtenderCitaPage from "./pages/doctor/DoctorAtenderCitaPage";
import PatientDashboardPage from "./pages/patient/PatientDashboardPage";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientRecordsPage from "./pages/patient/PatientRecordsPage";
import PatientBookPage from "./pages/patient/PatientBookPage";
import DirectorDashboardPage from "./pages/director/DirectorDashboardPage";
import DirectorRegistrarMedicoPage from "./pages/director/DirectorRegistrarMedicoPage";
import DirectorRegistrarRecepcionistaPage from "./pages/director/DirectorRegistrarRecepcionistaPage";
import DirectorPersonalPage from "./pages/director/DirectorPersonalPage";
import RecepcionistaDashboardPage from "./pages/recepcionista/RecepcionistaDashboardPage";
import RecepcionistaCitasPage from "./pages/recepcionista/RecepcionistaCitasPage";
import RecepcionistaAgendarPage from "./pages/recepcionista/RecepcionistaAgendarPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleGuard } from "./routes/RoleGuard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>

        {/* Rutas de médico */}
        <Route element={<RoleGuard role="medico" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
          <Route path="/doctor/agenda" element={<DoctorAgendaPage />} />
          <Route path="/doctor/pacientes" element={<DoctorPatientsPage />} />
          <Route path="/doctor/atender" element={<DoctorAtenderCitaPage />} />
        </Route>

        {/* Rutas de director */}
        <Route element={<RoleGuard role="director" />}>
          <Route path="/director/dashboard" element={<DirectorDashboardPage />} />
          <Route path="/director/registrar-medico" element={<DirectorRegistrarMedicoPage />} />
          <Route path="/director/registrar-recepcionista" element={<DirectorRegistrarRecepcionistaPage />} />
          <Route path="/director/personal" element={<DirectorPersonalPage />} />
        </Route>

        {/* Rutas de recepcionista */}
        <Route element={<RoleGuard role="recepcionista" />}>
          <Route path="/recepcionista/dashboard" element={<RecepcionistaDashboardPage />} />
          <Route path="/recepcionista/citas" element={<RecepcionistaCitasPage />} />
          <Route path="/recepcionista/agendar" element={<RecepcionistaAgendarPage />} />
          <Route path="/recepcionista/pacientes" element={<DoctorPatientsPage />} />
        </Route>

        {/* Rutas de paciente */}
        <Route element={<RoleGuard role="paciente" />}>
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient/citas" element={<PatientAppointmentsPage />} />
          <Route path="/patient/expediente" element={<PatientRecordsPage />} />
          <Route path="/patient/agendar" element={<PatientBookPage />} />
        </Route>

      </Route>
    </Routes>
  );
}
