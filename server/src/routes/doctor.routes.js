import { Router } from "express";
import { getDoctorDashboard } from "../controllers/doctor.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("DOCTOR"), getDoctorDashboard);

export default router;
