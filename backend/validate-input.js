#!/usr/bin/env node

/**
 * Script de diagnóstico para validar datos de entrada
 * Simula las validaciones de express-validator del backend
 * Uso: node validate-input.js
 */

import { body, validationResult } from "express-validator";
import express from "express";

const app = express();
app.use(express.json());

console.log("🔍 Validador de Entrada - MediSync\n");

// Simular validadores del backend
const staffValidators = [
  body("nombre").isLength({ min: 3 }).withMessage("Nombre debe tener mínimo 3 caracteres"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 8 }).withMessage("Password debe tener mínimo 8 caracteres"),
  body("role").isIn(["recepcionista", "medico", "director"]).withMessage('Role debe ser "recepcionista", "medico" o "director"'),
];

const patientValidators = [
  body("nombre").isLength({ min: 3 }).withMessage("Nombre debe tener mínimo 3 caracteres"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password").isLength({ min: 8 }).withMessage("Password debe tener mínimo 8 caracteres"),
  body("fechaNacimiento").isISO8601().toDate().withMessage("Fecha debe ser ISO8601 (YYYY-MM-DD)"),
  body("telefono").isLength({ min: 10, max: 20 }).withMessage("Teléfono debe tener entre 10 y 20 caracteres"),
];

// Test cases
const testCases = [
  {
    name: "✅ Registro Médico - Válido",
    data: {
      nombre: "Dr. Juan Pérez",
      email: "juan@hospital.com",
      password: "SecurePass123",
      role: "medico",
    },
    validators: staffValidators,
  },
  {
    name: "❌ Registro Médico - Nombre muy corto",
    data: {
      nombre: "Dr",
      email: "juan@hospital.com",
      password: "SecurePass123",
      role: "medico",
    },
    validators: staffValidators,
  },
  {
    name: "❌ Registro Médico - Email inválido",
    data: {
      nombre: "Dr. Juan Pérez",
      email: "juan-hospital.com",
      password: "SecurePass123",
      role: "medico",
    },
    validators: staffValidators,
  },
  {
    name: "❌ Registro Médico - Password muy corto",
    data: {
      nombre: "Dr. Juan Pérez",
      email: "juan@hospital.com",
      password: "short",
      role: "medico",
    },
    validators: staffValidators,
  },
  {
    name: "❌ Registro Médico - Role inválido",
    data: {
      nombre: "Dr. Juan Pérez",
      email: "juan@hospital.com",
      password: "SecurePass123",
      role: "doctor", // ❌ Incorrecto
    },
    validators: staffValidators,
  },
  {
    name: "✅ Registro Paciente - Válido",
    data: {
      nombre: "Ana María García",
      email: "ana@email.com",
      password: "PatientPass123",
      fechaNacimiento: "2000-05-15",
      telefono: "5551234567",
    },
    validators: patientValidators,
  },
  {
    name: "❌ Registro Paciente - Fecha inválida",
    data: {
      nombre: "Ana María García",
      email: "ana@email.com",
      password: "PatientPass123",
      fechaNacimiento: "15/05/2000", // ❌ Formato incorrecto
      telefono: "5551234567",
    },
    validators: patientValidators,
  },
  {
    name: "❌ Registro Paciente - Teléfono muy corto",
    data: {
      nombre: "Ana María García",
      email: "ana@email.com",
      password: "PatientPass123",
      fechaNacimiento: "2000-05-15",
      telefono: "555", // ❌ Muy corto
    },
    validators: patientValidators,
  },
];

async function runTests() {
  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log("─".repeat(50));
    
    // Crear request simulado
    const req = {
      body: testCase.data,
    };

    // Ejecutar validadores
    await Promise.all(testCase.validators.map(v => v.run(req)));
    
    // Verificar errores
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      console.log("✓ Datos válidos - Listo para enviar al servidor");
      console.log(`  Payload: ${JSON.stringify(testCase.data, null, 2).split("\n").join("\n  ")}`);
    } else {
      console.log("✗ Errores de validación:");
      errors.array().forEach(err => {
        console.log(`  - ${err.path}: ${err.msg}`);
      });
    }
  }
  
  console.log("\n" + "═".repeat(50));
  console.log("🎯 Resumen:");
  console.log(`  Total tests: ${testCases.length}`);
  console.log(`  ✅ Deberían pasar: ${testCases.filter(t => t.name.includes("✅")).length}`);
  console.log(`  ❌ Deberían fallar: ${testCases.filter(t => t.name.includes("❌")).length}`);
  console.log("\n💡 Consejos:");
  console.log("  1. Nombre: Mínimo 3 caracteres");
  console.log("  2. Email: Debe cumplir formato de email válido");
  console.log("  3. Password: Mínimo 8 caracteres");
  console.log("  4. Fecha: Usar formato ISO8601 (YYYY-MM-DD)");
  console.log("  5. Teléfono: Entre 10 y 20 caracteres");
  console.log("  6. Role: 'recepcionista', 'medico' o 'director'");
  console.log("═".repeat(50) + "\n");
}

runTests().catch(console.error);
