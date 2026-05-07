#!/usr/bin/env node

/**
 * 🧪 Test API Completo - MediSync
 * Prueba los endpoints de autenticación
 * Requiere que el backend esté ejecutándose en puerto 4000
 * Uso: node test-auth-complete.js
 */

import axios from "axios";

const API_URL = "http://localhost:4000/api";

// Colores para consola
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(msg) {
  log(`✅ ${msg}`, "green");
}

function error(msg) {
  log(`❌ ${msg}`, "red");
}

function info(msg) {
  log(`ℹ️  ${msg}`, "cyan");
}

function warn(msg) {
  log(`⚠️  ${msg}`, "yellow");
}

async function testAPI() {
  log("\n" + "═".repeat(80), "blue");
  log("🧪 PRUEBAS DE AUTENTICACIÓN - MEDISYNC", "blue");
  log("═".repeat(80) + "\n", "blue");

  // Verificar que el API está disponible
  log("1️⃣ Verificando conexión al API...", "cyan");
  try {
    const health = await axios.get(`${API_URL.replace("/api", "")}/api/health`);
    success(`API disponible: ${health.data.service}`);
  } catch (err) {
    error("No se puede conectar al API");
    error(`Asegúrate de que el backend esté ejecutándose: npm run dev`);
    process.exit(1);
  }

  const timestamp = Date.now();
  const testData = {
    medico: {
      nombre: `Dr. Test ${timestamp}`,
      email: `doctor${timestamp}@test.com`,
      password: "TestPassword123",
      role: "medico",
      especialidad: "Cardiología",
      costoConsulta: "500",
    },
    paciente: {
      nombre: `Paciente Test ${timestamp}`,
      email: `patient${timestamp}@test.com`,
      password: "TestPassword123",
      fechaNacimiento: "2000-05-15",
      telefono: "5551234567",
    },
  };

  let medicoData = null;
  let pacienteData = null;

  // Test 1: Registro de Médico
  log("\n2️⃣ Prueba: Registro de Médico", "cyan");
  log("─".repeat(80));
  try {
    info(`POST /auth/register`);
    info(`Datos: ${JSON.stringify(testData.medico, null, 2).split("\n").join("\n        ")}`);

    const response = await axios.post(`${API_URL}/auth/register`, testData.medico);

    medicoData = response.data;
    success("Registro exitoso");
    info(`Token Access: ${response.data.accessToken.substring(0, 20)}...`);
    info(`User ID: ${response.data.user.usuarioId}`);
    info(`User Role: ${response.data.user.rol}`);
  } catch (err) {
    error("Registro de médico falló");
    if (err.response?.data?.errors) {
      err.response.data.errors.forEach((e) => {
        warn(`  - ${e.path}: ${e.msg}`);
      });
    } else {
      warn(`  ${err.response?.data?.message || err.message}`);
    }
  }

  // Test 2: Registro de Paciente
  log("\n3️⃣ Prueba: Registro de Paciente", "cyan");
  log("─".repeat(80));
  try {
    info(`POST /auth/register/patient`);
    info(`Datos: ${JSON.stringify(testData.paciente, null, 2).split("\n").join("\n        ")}`);

    const response = await axios.post(`${API_URL}/auth/register/patient`, testData.paciente);

    pacienteData = response.data;
    success("Registro exitoso");
    info(`Token Access: ${response.data.accessToken.substring(0, 20)}...`);
    info(`User ID: ${response.data.user.usuarioId}`);
    info(`User Role: ${response.data.user.rol}`);
  } catch (err) {
    error("Registro de paciente falló");
    if (err.response?.data?.errors) {
      err.response.data.errors.forEach((e) => {
        warn(`  - ${e.path}: ${e.msg}`);
      });
    } else {
      warn(`  ${err.response?.data?.message || err.message}`);
    }
  }

  // Test 3: Login con Médico
  if (medicoData) {
    log("\n4️⃣ Prueba: Login de Médico", "cyan");
    log("─".repeat(80));
    try {
      info(`POST /auth/login`);
      info(`Email: ${testData.medico.email}`);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testData.medico.email,
        password: testData.medico.password,
        userType: "medico",
      });

      success("Login exitoso");
      info(`User: ${response.data.user.nombre}`);
      info(`Role: ${response.data.user.rol}`);
    } catch (err) {
      error("Login de médico falló");
      warn(`  ${err.response?.data?.message || err.message}`);
    }
  }

  // Test 4: Login con Paciente
  if (pacienteData) {
    log("\n5️⃣ Prueba: Login de Paciente", "cyan");
    log("─".repeat(80));
    try {
      info(`POST /auth/login`);
      info(`Email: ${testData.paciente.email}`);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testData.paciente.email,
        password: testData.paciente.password,
        userType: "paciente",
      });

      success("Login exitoso");
      info(`User: ${response.data.user.nombre}`);
      info(`Role: ${response.data.user.rol}`);
    } catch (err) {
      error("Login de paciente falló");
      warn(`  ${err.response?.data?.message || err.message}`);
    }
  }

  // Test 5: Validaciones
  log("\n6️⃣ Prueba: Validaciones de Entrada", "cyan");
  log("─".repeat(80));

  const invalidCases = [
    {
      name: "Email inválido",
      data: { ...testData.medico, email: "invalid-email" },
      endpoint: "/auth/register",
    },
    {
      name: "Password muy corto",
      data: { ...testData.medico, password: "short" },
      endpoint: "/auth/register",
    },
    {
      name: "Nombre muy corto",
      data: { ...testData.medico, nombre: "Dr" },
      endpoint: "/auth/register",
    },
    {
      name: "Role inválido",
      data: { ...testData.medico, role: "admin" },
      endpoint: "/auth/register",
    },
    {
      name: "Fecha inválida (paciente)",
      data: { ...testData.paciente, fechaNacimiento: "15/05/2000" },
      endpoint: "/auth/register/patient",
    },
  ];

  for (const testCase of invalidCases) {
    try {
      info(`Validando: ${testCase.name}`);
      await axios.post(`${API_URL}${testCase.endpoint}`, testCase.data);
      warn(`  ⚠️ No debería pasar: ${testCase.name}`);
    } catch (err) {
      if (err.response?.status === 400) {
        success(`  Validación correcta: ${testCase.name}`);
      } else {
        warn(`  Error inesperado: ${err.response?.data?.message || err.message}`);
      }
    }
  }

  // Resumen
  log("\n" + "═".repeat(80), "blue");
  log("📊 RESUMEN DE PRUEBAS", "blue");
  log("═".repeat(80), "blue");

  if (medicoData) {
    success("✅ Registro de Médico funcionando");
  } else {
    error("❌ Registro de Médico con problemas");
  }

  if (pacienteData) {
    success("✅ Registro de Paciente funcionando");
  } else {
    error("❌ Registro de Paciente con problemas");
  }

  log("\n" + "═".repeat(80) + "\n", "blue");
}

testAPI().catch((err) => {
  error(`Error fatal: ${err.message}`);
  process.exit(1);
});
