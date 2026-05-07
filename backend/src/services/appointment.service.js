import { prisma } from "../config/prisma.js";

/**
 * Obtener todos los médicos activos con sus especialidades
 */
export async function getAllDoctors() {
  return prisma.medico.findMany({
    where: { activo: true },
    select: {
      medicoId: true,
      nombre: true,
      especialidad: true,
      horario: true,
      costoConsulta: true,
      fotoUrl: true,
    },
    orderBy: { especialidad: "asc" },
  });
}

/**
 * Obtener médico por ID con sus citas
 */
export async function getDoctorById(medicoId) {
  return prisma.medico.findUnique({
    where: { medicoId },
    include: {
      citas: {
        where: { estado: "programada" },
        orderBy: { fechaHora: "asc" },
        include: {
          paciente: {
            select: { pacienteId: true, nombre: true, email: true },
          },
        },
      },
    },
  });
}

/**
 * Obtener horarios disponibles de un médico para una fecha específica
 * Asume que el médico tiene bloques de 30 minutos
 */
export async function getAvailableSlots(medicoId, fecha) {
  const medico = await prisma.medico.findUnique({
    where: { medicoId },
    select: { horario: true },
  });

  if (!medico) {
    throw { status: 404, message: "Médico no encontrado" };
  }

  // Obtener citas existentes para ese día
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  const citasExistentes = await prisma.cita.findMany({
    where: {
      medicoId,
      fechaHora: {
        gte: startOfDay,
        lte: endOfDay,
      },
      estado: { in: ["programada", "completada"] },
    },
    select: { fechaHora: true, duracionMin: true },
  });

  // Generar slots disponibles (asumiendo horario 09:00 - 18:00, bloques de 30 min)
  const disponibles = [];
  const horaInicio = 9;
  const horaFin = 18;

  for (let hora = horaInicio; hora < horaFin; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      const slotTime = new Date(fecha);
      slotTime.setHours(hora, minuto, 0, 0);

      // Verificar si el slot está disponible
      const ocupado = citasExistentes.some((cita) => {
        const citaStart = new Date(cita.fechaHora);
        const citaEnd = new Date(citaStart.getTime() + cita.duracionMin * 60000);
        return slotTime >= citaStart && slotTime < citaEnd;
      });

      if (!ocupado) {
        disponibles.push({
          hora: slotTime.toISOString(),
          displayTime: slotTime.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }
  }

  return disponibles;
}

/**
 * Agendar una nueva cita
 */
export async function crearCita(payload) {
  const { pacienteId, medicoId, fechaHora, motivo } = payload;

  // Validar que paciente y médico existan
  const [paciente, medico] = await Promise.all([
    prisma.paciente.findUnique({ where: { pacienteId } }),
    prisma.medico.findUnique({ where: { medicoId } }),
  ]);

  if (!paciente) {
    throw { status: 404, message: "Paciente no encontrado" };
  }

  if (!medico) {
    throw { status: 404, message: "Médico no encontrado" };
  }

  // Validar que no exista otra cita en el mismo horario
  const citaExistente = await prisma.cita.findFirst({
    where: {
      medicoId,
      fechaHora: new Date(fechaHora),
      estado: { in: ["programada", "completada"] },
    },
  });

  if (citaExistente) {
    throw { status: 400, message: "Ese horario ya está ocupado" };
  }

  // Crear la cita
  const cita = await prisma.cita.create({
    data: {
      pacienteId,
      medicoId,
      fechaHora: new Date(fechaHora),
      motivo,
      estado: "programada",
      duracionMin: 30,
    },
    include: {
      paciente: { select: { nombre: true, email: true } },
      medico: { select: { nombre: true, especialidad: true } },
    },
  });

  return cita;
}

/**
 * Obtener citas de un paciente
 */
export async function getCitasByPaciente(pacienteId, estado = null) {
  const where = { pacienteId };
  if (estado) where.estado = estado;

  return prisma.cita.findMany({
    where,
    include: {
      medico: {
        select: { nombre: true, especialidad: true, costoConsulta: true },
      },
    },
    orderBy: { fechaHora: "desc" },
  });
}

/**
 * Obtener citas de un médico
 */
export async function getCitasByMedico(medicoId, estado = null) {
  const where = { medicoId };
  if (estado) where.estado = estado;

  return prisma.cita.findMany({
    where,
    include: {
      paciente: {
        select: {
          pacienteId: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      },
    },
    orderBy: { fechaHora: "asc" },
  });
}

/**
 * Cancelar una cita
 */
export async function cancelarCita(citaId, motivoCancelacion) {
  const cita = await prisma.cita.findUnique({ where: { citaId } });

  if (!cita) {
    throw { status: 404, message: "Cita no encontrada" };
  }

  if (cita.estado !== "programada") {
    throw { status: 400, message: "Solo se pueden cancelar citas programadas" };
  }

  return prisma.cita.update({
    where: { citaId },
    data: {
      estado: "cancelada",
      motivoCancelacion,
    },
  });
}

/**
 * Completar una cita
 */
export async function completarCita(citaId) {
  return prisma.cita.update({
    where: { citaId },
    data: { estado: "completada" },
  });
}
