import { Router } from "express";
import { body } from "express-validator";
import { login, register, registerPatientController } from "../controllers/auth.controller.js";

const router = Router();

// Registro de usuarios del sistema (recepcionista, medico, director)
router.post(
  "/register",
  [
    body("nombre").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("role").isIn(["recepcionista", "medico", "director"])
  ],
  register,
);

// Registro de pacientes
router.post(
  "/register/patient",
  [
    body("nombre").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("fechaNacimiento").isISO8601(),
    body("telefono").isLength({ min: 10, max: 20 })
  ],
  registerPatientController,
);

// Login (para todos los tipos de usuarios)
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("userType").optional().isIn(["paciente", "medico", "usuario"])
  ],
  login
);

export default router;
