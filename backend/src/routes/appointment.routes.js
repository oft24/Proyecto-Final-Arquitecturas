import { Router } from "express";
import { body } from "express-validator";
import {
  getAppointments,
  getDoctors,
  getDoctorDetails,
  getAvailableTimes,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  markComplete,
} from "../controllers/appointment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// ==================== PÚBLICAS (sin autenticación) ====================

// Obtener todos los médicos disponibles
router.get("/doctors", getDoctors);

// Obtener detalles de un médico
router.get("/doctors/:medicoId", getDoctorDetails);

// Obtener horarios disponibles de un médico
router.get("/doctors/:medicoId/available", getAvailableTimes);

// ==================== PROTEGIDAS (requiere autenticación) ====================

// Agendar una nueva cita (paciente)
router.post(
  "/book",
  requireAuth,
  [
    body("pacienteId").isUUID(),
    body("medicoId").isUUID(),
    body("fechaHora").isISO8601(),
    body("motivo").isLength({ min: 3 }),
  ],
  bookAppointment
);

// Obtener mis citas (paciente autenticado)
router.get("/my", requireAuth, getMyAppointments);

// Obtener citas (genérico - médico/recepcionista)
router.get("/", requireAuth, getAppointments);

// Obtener citas de un médico específico
router.get("/doctor/appointments", requireAuth, getDoctorAppointments);

// Cancelar una cita
router.delete(
  "/:citaId",
  requireAuth,
  [body("motivoCancelacion").isLength({ min: 3 })],
  cancelAppointment
);

// Marcar cita como completada (médico)
router.patch(
  "/:citaId/complete",
  requireAuth,
  requireRole("medico"),
  markComplete
);

export default router;
