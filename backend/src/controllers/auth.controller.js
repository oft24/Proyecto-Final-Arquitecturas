import { validationResult } from "express-validator";
import { loginUser, registerUser, registerPatient } from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function registerPatientController(req, res, next) {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const result = await registerPatient(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    // Validar datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}
