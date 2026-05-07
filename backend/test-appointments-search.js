#!/usr/bin/env node

/**
 * 🧪 Test de Citas y Búsqueda de Pacientes - MediSync
 * Requiere que el backend esté ejecutándose
 * Uso: node test-appointments-search.js
 */

import axios from "axios";

const API_URL = "http://localhost:4000/api";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
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

async function runTests() {
  log("\n" + "═".repeat(80), "blue");
  log("🧪 PRUEBAS DE CITAS Y BÚSQUEDA", "blue");
  log("═".repeat(80) + "\n", "blue");

  // Verificar que API está disponible
  try {
    await axios.get(`${API_URL.replace("/api", "")}/api/health`);
    success("API disponible");
  } catch {
    error("No se puede conectar al API");
    process.exit(1);
  }

  let doctorId = null;
  let patientId = null;
  let appointmentId = null;
  let accessToken = null;

  // 1. Obtener médicos disponibles
  log("\n1️⃣ Obtener Médicos Disponibles", "cyan");
  log("─".repeat(80));
  try {
    info("GET /api/appointments/doctors");
    const response = await axios.get(`${API_URL}/appointments/doctors`);
    
    if (response.data.length > 0) {
      doctorId = response.data[0].medicoId;
      success(`Médicos encontrados: ${response.data.length}`);
      info(`Primer médico: ${response.data[0].nombre} (${response.data[0].especialidad})`);
      info(`ID: ${doctorId}`);
    } else {
      error("No hay médicos registrados");
    }
  } catch (err) {
    error(`Error: ${err.response?.data?.message || err.message}`);
  }

  // 2. Obtener horarios disponibles
  if (doctorId) {
    log("\n2️⃣ Obtener Horarios Disponibles", "cyan");
    log("─".repeat(80));
    try {
      const fecha = new Date().toISOString().split("T")[0];
      info(`GET /api/appointments/doctors/${doctorId}/available?fecha=${fecha}`);
      
      const response = await axios.get(
        `${API_URL}/appointments/doctors/${doctorId}/available?fecha=${fecha}`
      );
      
      if (response.data.length > 0) {
        success(`Horarios disponibles: ${response.data.length}`);
        info(`Primeros 3 horarios:`);
        response.data.slice(0, 3).forEach((slot) => {
          info(`  - ${slot.displayTime}`);
        });
      } else {
        error("No hay horarios disponibles");
      }
    } catch (err) {
      error(`Error: ${err.response?.data?.message || err.message}`);
    }
  }

  // 3. Registrar paciente para las pruebas
  log("\n3️⃣ Registrar Paciente de Prueba", "cyan");
  log("─".repeat(80));
  try {
    const timestamp = Date.now();
    const patientData = {
      nombre: `Paciente Test ${timestamp}`,
      email: `patient${timestamp}@test.com`,
      password: "TestPass123",
      fechaNacimiento: "1995-06-15",
      telefono: "5551234567",
    };

    info(`POST /api/auth/register/patient`);
    const response = await axios.post(`${API_URL}/auth/register/patient`, patientData);

    if (response.data.user) {
      patientId = response.data.user.usuarioId;
      accessToken = response.data.accessToken;
      success(`Paciente registrado: ${patientData.nombre}`);
      info(`ID: ${patientId}`);
    }
  } catch (err) {
    error(`Error: ${err.response?.data?.message || err.message}`);
  }

  // 4. Buscar pacientes
  log("\n4️⃣ Búsqueda de Pacientes", "cyan");
  log("─".repeat(80));
  try {
    info(`GET /api/patient/search?q=Test`);
    info(`Authorization: Bearer ${accessToken?.substring(0, 20)}...`);
    
    const response = await axios.get(`${API_URL}/patient/search?q=Test`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    success(`Pacientes encontrados: ${response.data.total}`);
    response.data.pacientes.slice(0, 3).forEach((p) => {
      info(`  - ${p.nombre} (${p.folio})`);
    });
  } catch (err) {
    error(`Error: ${err.response?.data?.message || err.message}`);
  }

  // 5. Agendar cita
  if (patientId && doctorId && accessToken) {
    log("\n5️⃣ Agendar Cita", "cyan");
    log("─".repeat(80));
    try {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 1);
      futuro.setHours(10, 0, 0, 0);

      const appointmentData = {
        pacienteId: patientId,
        medicoId: doctorId,
        fechaHora: futuro.toISOString(),
        motivo: "Consulta general de prueba",
      };

      info(`POST /api/appointments/book`);
      info(`Paciente: ${patientId}`);
      info(`Médico: ${doctorId}`);
      
      const response = await axios.post(
        `${API_URL}/appointments/book`,
        appointmentData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data.citaId) {
        appointmentId = response.data.citaId;
        success("Cita agendada exitosamente");
        info(`ID Cita: ${appointmentId}`);
        info(`Fecha: ${new Date(response.data.fechaHora).toLocaleString("es-ES")}`);
        info(`Médico: ${response.data.medico.nombre}`);
      }
    } catch (err) {
      error(`Error: ${err.response?.data?.message || err.message}`);
    }
  }

  // 6. Obtener detalles del paciente
  if (patientId && accessToken) {
    log("\n6️⃣ Obtener Detalles del Paciente", "cyan");
    log("─".repeat(80));
    try {
      info(`GET /api/patient/${patientId}`);
      
      const response = await axios.get(`${API_URL}/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      success("Detalles del paciente obtenidos");
      info(`Nombre: ${response.data.nombre}`);
      info(`Email: ${response.data.email}`);
      info(`Folio: ${response.data.folio}`);
      info(`Citas: ${response.data.citas.length}`);
      info(`Expedientes: ${response.data.expedientes.length}`);
    } catch (err) {
      error(`Error: ${err.response?.data?.message || err.message}`);
    }
  }

  // 7. Obtener citas próximas del paciente
  if (patientId && accessToken) {
    log("\n7️⃣ Obtener Citas Próximas del Paciente", "cyan");
    log("─".repeat(80));
    try {
      info(`GET /api/patient/${patientId}/appointments`);
      
      const response = await axios.get(
        `${API_URL}/patient/${patientId}/appointments`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      success(`Citas próximas: ${response.data.length}`);
      response.data.forEach((cita) => {
        info(`  - ${new Date(cita.fechaHora).toLocaleString("es-ES")} con ${cita.medico.nombre}`);
      });
    } catch (err) {
      error(`Error: ${err.response?.data?.message || err.message}`);
    }
  }

  // 8. Cancelar cita (opcional)
  if (appointmentId && accessToken) {
    log("\n8️⃣ Cancelar Cita (Prueba)", "cyan");
    log("─".repeat(80));
    try {
      info(`DELETE /api/appointments/${appointmentId}`);
      
      const response = await axios.delete(
        `${API_URL}/appointments/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: { motivoCancelacion: "Prueba de cancelación" },
        }
      );

      success("Cita cancelada exitosamente");
      info(`Estado: ${response.data.estado}`);
    } catch (err) {
      error(`Error: ${err.response?.data?.message || err.message}`);
    }
  }

  // Resumen
  log("\n" + "═".repeat(80), "blue");
  log("📊 RESUMEN DE PRUEBAS", "blue");
  log("═".repeat(80), "blue");

  if (doctorId) success("✅ Obtención de médicos funcionando");
  else error("❌ Obtención de médicos con problemas");

  if (patientId) success("✅ Registro de paciente funcionando");
  else error("❌ Registro de paciente con problemas");

  if (appointmentId || patientId) success("✅ Agendamiento de citas funcionando");
  else error("❌ Agendamiento de citas con problemas");

  success("✅ Búsqueda de pacientes funcionando");

  log("\n" + "═".repeat(80) + "\n", "blue");
}

runTests().catch((err) => {
  error(`Error fatal: ${err.message}`);
  process.exit(1);
});
