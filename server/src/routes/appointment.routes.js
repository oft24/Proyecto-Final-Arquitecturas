import { Router } from "express";
import { getAppointments } from "../controllers/appointment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getAppointments);

export default router;
