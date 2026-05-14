import { prisma } from "../config/prisma.js";
import { validationResult } from "express-validator";

export async function getDoctorDashboard(req, res) {
  try {
    const medicoId = req.user.sub;

    // Obtener el perfil del médico
    const medico = await prisma.medico.findUnique({
      where: { medicoId },
      include: {
        usuario: true,
      },
    });

    if (!medico) {
      return res.status(404).json({ message: "Perfil de medico no encontrado" });
    }

    // Obtener estadísticas de citas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [citasHoy, citasPendientes, citasCanceladas] = await Promise.all([
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          fechaHora: { gte: hoy, lt: manana },
        },
      }),
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          estado: "programada",
          fechaHora: { gte: new Date() },
        },
      }),
      prisma.cita.count({
        where: {
          medicoId: medico.medicoId,
          estado: "cancelada",
        },
      }),
    ]);

    // Obtener próximas citas
    const proximasCitas = await prisma.cita.findMany({
      where: {
        medicoId: medico.medicoId,
        fechaHora: { gte: new Date() },
        estado: "programada",
      },
      include: {
        paciente: true,
      },
      orderBy: { fechaHora: "asc" },
      take: 5,
    });

    res.json({
      medico: {
        nombre: medico.nombre,
        especialidad: medico.especialidad,
        costoConsulta: medico.costoConsulta,
      },
      stats: {
        patientsToday: citasHoy,
        pendingAppointments: citasPendientes,
        cancelled: citasCanceladas,
      },
      proximasCitas: proximasCitas.map((c) => ({
        citaId: c.citaId,
        paciente: c.paciente.nombre,
        fechaHora: c.fechaHora,
        motivo: c.motivo,
      })),
      alerts: citasPendientes > 5
        ? [{ title: `${citasPendientes} citas pendientes`, description: "Revisa tu agenda" }]
        : [],
    });
  } catch (error) {
    console.error("Error en getDoctorDashboard:", error);
    res.status(500).json({ message: "Error al obtener dashboard" });
  }
}

/**
 * Obtener todas las citas asignadas al médico autenticado
 */
export async function getDoctorCitas(req, res) {
  try {
    const medicoId = req.user.sub;
    const { estado } = req.query;

    const where = { medicoId };
    if (estado) where.estado = estado;

    const citas = await prisma.cita.findMany({
      where,
      include: {
        paciente: {
          select: {
            pacienteId: true,
            nombre: true,
            email: true,
            telefono: true,
            fechaNacimiento: true,
            folio: true,
          },
        },
      },
      orderBy: { fechaHora: "asc" },
    });

    res.json(citas);
  } catch (error) {
    console.error("Error en getDoctorCitas:", error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
}

/**
 * Listar pacientes UNICOS que han tenido al menos una cita con el medico autenticado.
 * Garantiza aislamiento: el medico solo ve pacientes propios.
 */
export async function getDoctorPacientes(req, res) {
  try {
    const medicoId = req.user.sub;
    const { q } = req.query;

    const citas = await prisma.cita.findMany({
      where: { medicoId },
      select: {
        pacienteId: true,
        fechaHora: true,
        estado: true,
        paciente: {
          select: {
            pacienteId: true,
            nombre: true,
            email: true,
            telefono: true,
            folio: true,
            fechaNacimiento: true,
          },
        },
      },
      orderBy: { fechaHora: "desc" },
    });

    // Deduplicar por pacienteId y guardar la cita mas reciente
    const map = new Map();
    for (const c of citas) {
      if (!map.has(c.pacienteId)) {
        map.set(c.pacienteId, {
          ...c.paciente,
          ultimaCita: c.fechaHora,
          totalCitas: 1,
        });
      } else {
        map.get(c.pacienteId).totalCitas += 1;
      }
    }

    let pacientes = Array.from(map.values());

    // Filtro opcional de busqueda
    if (q && q.trim().length > 0) {
      const term = q.toLowerCase().trim();
      pacientes = pacientes.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.folio.toLowerCase().includes(term) ||
          (p.telefono ?? "").toLowerCase().includes(term)
      );
    }

    res.json({ total: pacientes.length, pacientes });
  } catch (error) {
    console.error("Error en getDoctorPacientes:", error);
    res.status(500).json({ message: "Error al obtener pacientes" });
  }
}

/**
 * Historial completo de un paciente (solo si el medico lo ha atendido).
 * Devuelve: datos del paciente, todas sus citas con este medico y expedientes del medico.
 */
export async function getPacienteHistorial(req, res) {
  try {
    const medicoId = req.user.sub;
    const { pacienteId } = req.params;

    // Verificar relacion paciente-medico via citas
    const relacion = await prisma.cita.findFirst({
      where: { medicoId, pacienteId },
      select: { citaId: true },
    });

    if (!relacion) {
      return res.status(403).json({
        message: "No tienes acceso al historial de este paciente",
      });
    }

    const [paciente, citas, expedientes] = await Promise.all([
      prisma.paciente.findUnique({
        where: { pacienteId },
        select: {
          pacienteId: true,
          nombre: true,
          email: true,
          telefono: true,
          folio: true,
          fechaNacimiento: true,
        },
      }),
      prisma.cita.findMany({
        where: { medicoId, pacienteId },
        orderBy: { fechaHora: "desc" },
        select: {
          citaId: true,
          fechaHora: true,
          estado: true,
          motivo: true,
          motivoCancelacion: true,
          duracionMin: true,
        },
      }),
      prisma.expediente.findMany({
        where: { medicoId, pacienteId },
        orderBy: { createdAt: "desc" },
        select: {
          expedienteId: true,
          citaId: true,
          motivoConsulta: true,
          diagnostico: true,
          tratamiento: true,
          observaciones: true,
          createdAt: true,
        },
      }),
    ]);

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json({ paciente, citas, expedientes });
  } catch (error) {
    console.error("Error en getPacienteHistorial:", error);
    res.status(500).json({ message: "Error al obtener historial" });
  }
}

/**
 * Atender una cita: crea el expediente y marca la cita como completada
 */
export async function atenderCita(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicoId = req.user.sub;
    const { citaId } = req.params;
    const { motivoConsulta, diagnostico, tratamiento, observaciones } = req.body;

    // Verificar que la cita existe y pertenece al médico
    const cita = await prisma.cita.findUnique({
      where: { citaId },
      include: { paciente: true },
    });

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    if (cita.medicoId !== medicoId) {
      return res.status(403).json({ message: "No tienes permiso para atender esta cita" });
    }

    if (cita.estado !== "programada") {
      return res.status(400).json({ message: "Solo se pueden atender citas programadas" });
    }

    // Transacción: crear expediente + marcar cita como completada
    const [expediente] = await prisma.$transaction([
      prisma.expediente.create({
        data: {
          pacienteId: cita.pacienteId,
          medicoId,
          citaId,
          motivoConsulta,
          diagnostico,
          tratamiento,
          observaciones: observaciones || null,
          archivosS3: [],
        },
        include: {
          paciente: { select: { nombre: true, folio: true } },
          medico: { select: { nombre: true, especialidad: true } },
        },
      }),
      prisma.cita.update({
        where: { citaId },
        data: { estado: "completada" },
      }),
    ]);

    res.status(201).json({
      message: "Cita atendida y expediente creado exitosamente",
      expediente,
    });
  } catch (error) {
    console.error("Error en atenderCita:", error);
    res.status(500).json({ message: "Error al atender la cita" });
  }
}
