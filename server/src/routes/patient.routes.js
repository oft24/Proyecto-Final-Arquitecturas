import { Router } from "express";
import { getPatientDashboard } from "../controllers/patient.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("PATIENT"), getPatientDashboard);

export default router;
