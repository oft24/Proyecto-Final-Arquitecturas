import { Router } from "express";
import { body } from "express-validator";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/register",
  [body("fullName").isLength({ min: 3 }), body("email").isEmail(), body("password").isLength({ min: 8 }), body("role").isIn(["doctor", "patient"])],
  register,
);

router.post("/login", [body("email").isEmail(), body("password").isLength({ min: 6 })], login);

export default router;
