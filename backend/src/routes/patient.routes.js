import { Router } from "express";
import {
  searchPatients,
  getPatientDetails,
  listPatients,
  getUpcomingAppointments,
  getPatientRecords,
  getPatientStats,
  getPatientDashboard,
} from "../controllers/patient.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// ==================== PROTEGIDAS (requiere autenticación) ====================

// Dashboard de pacientes (recepcionista/director)
router.get("/dashboard", requireAuth, getPatientDashboard);

// Buscar pacientes por nombre, email, folio o teléfono
// Uso: GET /api/patient/search?q=juan
router.get("/search", requireAuth, searchPatients);

// Obtener lista paginada de todos los pacientes
// Uso: GET /api/patient/list?page=1&limit=20
router.get("/list", requireAuth, listPatients);

// Obtener detalles completos de un paciente
router.get("/:pacienteId", requireAuth, getPatientDetails);

// Obtener citas próximas de un paciente
router.get("/:pacienteId/appointments", requireAuth, getUpcomingAppointments);

// Obtener expedientes de un paciente
router.get("/:pacienteId/records", requireAuth, getPatientRecords);

// Obtener estadísticas de un paciente
router.get("/:pacienteId/stats", requireAuth, getPatientStats);

export default router;
