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
 * IMPORTANTE: La fecha viene como "YYYY-MM-DD" en la ZONA HORARIA LOCAL (UTC-6)
 * Se genera slots 09:00-18:00 en UTC-6 y se devuelven en ISO8601 UTC
 */
export async function getAvailableSlots(medicoId, fecha) {
  const medico = await prisma.medico.findUnique({
    where: { medicoId },
    select: { horario: true },
  });

  if (!medico) {
    throw { status: 404, message: "Médico no encontrado" };
  }

  // CORRECCIÓN IMPORTANTE: La fecha viene en zona horaria LOCAL (UTC-6)
  // "2026-05-14" significa: 14 de mayo de 2026 00:00 en UTC-6
  // En UTC: 2026-05-14 06:00:00Z (porque UTC-6 está 6 horas atrás de UTC)
  const TIMEZONE_OFFSET_HOURS = 6; // México/Centroamérica = UTC-6

  let year, month, day;
  
  if (typeof fecha === "string") {
    const [y, m, d] = fecha.split("T")[0].split("-").map(Number);
    year = y;
    month = m;
    day = d;
  } else if (fecha instanceof Date) {
    year = fecha.getUTCFullYear();
    month = fecha.getUTCMonth() + 1;
    day = fecha.getUTCDate();
  } else {
    throw { status: 400, message: "Formato de fecha inválido" };
  }

  // Crear rango para buscar citas: desde las 00:00 UTC-6 hasta 23:59:59 UTC-6
  // Convertir a UTC: 00:00 UTC-6 = 06:00 UTC, y 23:59:59 UTC-6 = 05:59:59 UTC del siguiente día
  const startOfDayLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)); // 00:00 local
  const startOfDayUTC = new Date(startOfDayLocal.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000); // Convertir a UTC
  
  const endOfDayLocal = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)); // 23:59:59 local
  const endOfDayUTC = new Date(endOfDayLocal.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000); // Convertir a UTC

  const citasExistentes = await prisma.cita.findMany({
    where: {
      medicoId,
      fechaHora: {
        gte: startOfDayUTC,
        lte: endOfDayUTC,
      },
      estado: { in: ["programada", "completada"] },
    },
    select: { fechaHora: true, duracionMin: true },
  });

  // Generar slots disponibles: 09:00 - 18:00 en ZONA HORARIA LOCAL (UTC-6)
  const disponibles = [];
  const horaInicio = 9;
  const horaFin = 18;

  for (let hora = horaInicio; hora < horaFin; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 30) {
      // Crear slot como si fuera "hora:minuto en UTC-6"
      // Primero lo creamos como UTC (para poder manipularlo fácilmente)
      // Luego convertimos a UTC real
      const slotTimeLocal = new Date(Date.UTC(year, month - 1, day, hora, minuto, 0, 0));
      // Ahora convertir de UTC-6 a UTC: sumar 6 horas
      const slotTimeUTC = new Date(slotTimeLocal.getTime() + TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000);

      // Verificar si el slot está disponible
      const ocupado = citasExistentes.some((cita) => {
        const citaStart = new Date(cita.fechaHora);
        const citaEnd = new Date(citaStart.getTime() + cita.duracionMin * 60000);
        return slotTimeUTC >= citaStart && slotTimeUTC < citaEnd;
      });

      if (!ocupado) {
        disponibles.push({
          // Devolver en ISO8601 UTC (convertido correctamente)
          hora: slotTimeUTC.toISOString(),
          // Mostrar en zona horaria local (UTC-6)
          displayTime: slotTimeLocal.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",  // UTC-6
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
