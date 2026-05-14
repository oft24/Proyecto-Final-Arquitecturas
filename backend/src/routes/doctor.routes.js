import { Router } from "express";
import {
  getDoctorDashboard,
  getDoctorCitas,
  atenderCita,
} from "../controllers/doctor.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { body } from "express-validator";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("medico"), getDoctorDashboard);

// Citas asignadas al médico autenticado
router.get("/citas", requireAuth, requireRole("medico"), getDoctorCitas);

// Atender cita: marcar como completada + crear expediente
router.post(
  "/citas/:citaId/atender",
  requireAuth,
  requireRole("medico"),
  [
    body("motivoConsulta").isLength({ min: 3 }),
    body("diagnostico").isLength({ min: 3 }),
    body("tratamiento").isLength({ min: 3 }),
    body("observaciones").optional().isString(),
  ],
  atenderCita
);

export default router;
