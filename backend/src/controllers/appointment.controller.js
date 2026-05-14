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
  editarCita,
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

    // Agregar quién creó la cita (recepcionista o paciente)
    const body = {
      ...req.body,
      creadoPor: req.user.role === "recepcionista" || req.user.role === "director" 
        ? req.user.sub 
        : null,
    };

    const cita = await crearCita(body);
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
      // Obtener el medicoId del usuario
      const medico = await prisma.medico.findFirst({
        where: { usuarioId },
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
        take: 50,
      });
    }

    res.json(
      citas.map((c) => ({
        citaId: c.citaId,
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
 * Editar una cita (recepcionista/medico)
 */
export async function editAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.array = () => errors.array();
      return next(err);
    }

    const { citaId } = req.params;
    const { fechaHora, medicoId, motivo } = req.body;

    const cita = await editarCita(citaId, {
      fechaHora,
      medicoId,
      motivo,
    });
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
