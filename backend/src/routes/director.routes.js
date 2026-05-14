import { Router } from "express";
import { getHospitalStats, getMedicosConStats } from "../controllers/director.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Estadísticas generales del hospital
router.get("/stats", requireAuth, requireRole("director"), getHospitalStats);

// Médicos con sus estadísticas individuales
router.get("/medicos", requireAuth, requireRole("director"), getMedicosConStats);

export default router;
