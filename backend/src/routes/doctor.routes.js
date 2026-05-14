import { Router } from "express";
import {
  getDoctorDashboard,
  getDoctorAppointmentsByDate,
  getDoctorSchedule,
} from "../controllers/doctor.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("medico"), getDoctorDashboard);

// Obtener citas del médico para una fecha específica
router.get(
  "/appointments/by-date",
  requireAuth,
  requireRole("medico"),
  getDoctorAppointmentsByDate
);

// Obtener horario completo del médico con citas
router.get(
  "/schedule",
  requireAuth,
  requireRole("medico"),
  getDoctorSchedule
);

export default router;
