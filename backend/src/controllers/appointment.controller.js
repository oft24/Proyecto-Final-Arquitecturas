import { validationResult } from "express-validator";
import {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  crearCita,
  getCitasByPaciente,
  getCitasByMedico,
  cancelarCita,
  completarCita,
} from "../services/appointment.service.js";
import { prisma } from "../config/prisma.js";

/**
 * Obtener todos los médicos disponibles
 */
export async function getDoctors(req, res, next) {
  try {
    const doctores = await getAllDoctors();
    res.json(doctores);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener detalles de un médico
 */
export async function getDoctorDetails(req, res, next) {
  try {
    const { medicoId } = req.params;
    const medico = await getDoctorById(medicoId);

    if (!medico) {
      return res.status(404).json({ message: "Médico no encontrado" });
    }

    res.json(medico);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener horarios disponibles de un médico
 */
export async function getAvailableTimes(req, res, next) {
  try {
    const { medicoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: "Fecha requerida en query: ?fecha=YYYY-MM-DD" });
    }

    const slots = await getAvailableSlots(medicoId, new Date(fecha));
    res.json(slots);
  } catch (error) {
    next(error);
  }
}

/**
 * Agendar una cita (paciente)
 */
export async function bookAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const cita = await crearCita(req.body);
    res.status(201).json(cita);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener citas del paciente autenticado
 */
export async function getMyAppointments(req, res, next) {
  try {
    const { estado } = req.query;
    const pacienteId = req.user.sub;

    const citas = await getCitasByPaciente(pacienteId, estado);
    res.json(citas);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener citas de un médico (genérico)
 */
export async function getAppointments(req, res, next) {
  try {
    const usuarioId = req.user.sub;
    const rol = req.user.role;

    let citas;

    if (rol === "medico") {
      // En el JWT, para un medico, sub === medicoId (ver auth.service.js > issueTokens)
      const medico = await prisma.medico.findUnique({
        where: { medicoId: usuarioId },
      });

      if (!medico) {
        return res.status(404).json({ message: "Perfil de medico no encontrado" });
      }

      citas = await getCitasByMedico(medico.medicoId);
    } else {
      // Recepcionistas y directores ven todas las citas
      citas = await prisma.cita.findMany({
        include: {
          paciente: true,
          medico: true,
        },
        orderBy: { fechaHora: "desc" },
        take: 500,
      });
    }

    res.json(
      citas.map((c) => ({
        citaId: c.citaId,
        pacienteId: c.paciente?.pacienteId,
        medicoId: c.medico?.medicoId,
        paciente: c.paciente?.nombre,
        medico: c.medico?.nombre,
        especialidad: c.medico?.especialidad,
        fecha: c.fechaHora,
        duracion: c.duracionMin,
        estado: c.estado,
        motivo: c.motivo,
      }))
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener citas de un médico específico
 */
export async function getDoctorAppointments(req, res, next) {
  try {
    const { estado } = req.query;
    const medicoId = req.user.sub;

    const citas = await getCitasByMedico(medicoId, estado);
    res.json(citas);
  } catch (error) {
    next(error);
  }
}

/**
 * Cancelar una cita
 */
export async function cancelAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const { citaId } = req.params;
    const { motivoCancelacion } = req.body;

    const cita = await cancelarCita(citaId, motivoCancelacion);
    res.json(cita);
  } catch (error) {
    next(error);
  }
}

/**
 * Completar una cita (solo médico)
 */
export async function markComplete(req, res, next) {
  try {
    const { citaId } = req.params;
    const cita = await completarCita(citaId);
    res.json(cita);
  } catch (error) {
    next(error);
  }
}

/**
 * Modificar una cita — recepcionista/director pueden cambiar fecha, médico y/o motivo
 */
export async function updateAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { citaId } = req.params;
    const { fechaHora, medicoId, motivo } = req.body;

    const cita = await prisma.cita.findUnique({ where: { citaId } });
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
    if (cita.estado !== "programada") {
      return res.status(400).json({ message: "Solo se pueden modificar citas programadas" });
    }

    const nuevoMedicoId = medicoId || cita.medicoId;
    
    // CORRECCIÓN: Parseo correcto de ISO8601 sin conversión errada
    // Si recibimos "2026-05-14T14:30:00.000Z", debe guardarse EXACTAMENTE así
    let nuevaFecha = cita.fechaHora;
    if (fechaHora) {
      nuevaFecha = new Date(fechaHora);
      // Validar que sea una fecha válida
      if (isNaN(nuevaFecha.getTime())) {
        return res.status(400).json({ message: "Formato de fecha inválido" });
      }
    }

    // Verificar conflicto de horario si cambia fecha o médico
    if (fechaHora || medicoId) {
      // Búsqueda exacta: mismo médico, mismo horario (ISO string exacto)
      const conflicto = await prisma.cita.findFirst({
        where: {
          citaId: { not: citaId },
          medicoId: nuevoMedicoId,
          fechaHora: nuevaFecha,
          estado: { in: ["programada", "completada"] },
        },
      });
      if (conflicto) {
        return res.status(400).json({ message: "Ese horario ya está ocupado para el médico seleccionado" });
      }
    }

    const data = {};
    if (fechaHora) data.fechaHora = nuevaFecha;
    if (medicoId) data.medicoId = medicoId;
    if (motivo !== undefined) data.motivo = motivo;

    const citaActualizada = await prisma.cita.update({
      where: { citaId },
      data,
      include: {
        paciente: { select: { nombre: true } },
        medico: { select: { nombre: true, especialidad: true } },
      },
    });

    res.json({
      message: "Cita actualizada exitosamente",
      cita: {
        citaId: citaActualizada.citaId,
        pacienteId: citaActualizada.pacienteId,
        medicoId: citaActualizada.medicoId,
        paciente: citaActualizada.paciente?.nombre,
        medico: citaActualizada.medico?.nombre,
        especialidad: citaActualizada.medico?.especialidad,
        fecha: citaActualizada.fechaHora,
        estado: citaActualizada.estado,
        motivo: citaActualizada.motivo,
      },
    });
  } catch (error) {
    next(error);
  }
}
