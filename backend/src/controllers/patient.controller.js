import { validationResult } from "express-validator";
import {
  searchPacientes,
  getPacienteById,
  getAllPacientes,
  getCitasProximas,
  getExpedientesByPaciente,
  getPacienteStats,
} from "../services/patient.service.js";
import { prisma } from "../config/prisma.js";/**
 * Buscar pacientes por nombre, email, folio o teléfono
 */
export async function searchPatients(req, res, next) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Parámetro q (búsqueda) requerido" });
    }

    const pacientes = await searchPacientes(q);
    res.json({
      total: pacientes.length,
      pacientes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener detalles completos de un paciente
 */
export async function getPatientDetails(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const paciente = await getPacienteById(pacienteId);

    res.json(paciente);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener lista de todos los pacientes (con paginación)
 */
export async function listPatients(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "page y limit deben ser positivos, limit máximo 100",
      });
    }

    const result = await getAllPacientes(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener historial completo de citas de un paciente (todas, pasadas y futuras)
 */
export async function getPatientAppointmentHistory(req, res, next) {
  try {
    const { pacienteId } = req.params;

    const paciente = await prisma.paciente.findUnique({ where: { pacienteId } });
    if (!paciente) return res.status(404).json({ message: "Paciente no encontrado" });

    const citas = await prisma.cita.findMany({
      where: { pacienteId },
      include: {
        medico: {
          select: { nombre: true, especialidad: true, costoConsulta: true },
        },
      },
      orderBy: { fechaHora: "desc" },
    });

    res.json(citas.map((c) => ({
      citaId: c.citaId,
      fechaHora: c.fechaHora,
      estado: c.estado,
      motivo: c.motivo,
      motivoCancelacion: c.motivoCancelacion,
      duracionMin: c.duracionMin,
      medico: c.medico?.nombre,
      especialidad: c.medico?.especialidad,
      costoConsulta: c.medico?.costoConsulta,
    })));
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener citas próximas de un paciente
 */
export async function getUpcomingAppointments(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const citas = await getCitasProximas(pacienteId);

    res.json(citas);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener expedientes de un paciente
 */
export async function getPatientRecords(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const expedientes = await getExpedientesByPaciente(pacienteId);

    res.json(expedientes);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estadísticas de un paciente
 */
export async function getPatientStats(req, res, next) {
  try {
    const { pacienteId } = req.params;
    const stats = await getPacienteStats(pacienteId);

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * Dashboard de pacientes (para recepcionista/director)
 */
export async function getPatientDashboard(req, res, next) {
  try {
    // Obtener todos los pacientes con sus próximas citas
    const pacientes = await prisma.paciente.findMany({
      include: {
        citas: {
          where: {
            fechaHora: { gte: new Date() },
            estado: { in: ["programada", "completada"] },
          },
          include: {
            medico: true,
          },
          orderBy: { fechaHora: "asc" },
          take: 1,
        },
      },
      take: 10,
    });

    // Estadísticas generales
    const [totalPacientes, citasHoy, citasPendientes] = await Promise.all([
      prisma.paciente.count(),
      prisma.cita.count({
        where: {
          fechaHora: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.cita.count({
        where: {
          estado: "programada",
          fechaHora: { gte: new Date() },
        },
      }),
    ]);

    res.json({
      stats: {
        totalPacientes,
        citasHoy,
        citasPendientes,
      },
      pacientes: pacientes.map((p) => ({
        pacienteId: p.pacienteId,
        nombre: p.nombre,
        email: p.email,
        folio: p.folio,
        proximaCita: p.citas[0]
          ? {
              fecha: p.citas[0].fechaHora,
              medico: p.citas[0].medico.nombre,
              especialidad: p.citas[0].medico.especialidad,
            }
          : null,
      })),
    });
  } catch (error) {
    next(error);
  }
}
