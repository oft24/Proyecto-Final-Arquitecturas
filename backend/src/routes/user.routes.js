import { Router } from "express";
import { getMe, getPersonal, deletePersonal } from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/personal", requireAuth, requireRole("director"), getPersonal);
router.delete("/personal/:tipo/:id", requireAuth, requireRole("director"), deletePersonal);

export default router;
