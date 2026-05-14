export function getMe(req, res) {
  res.json({ user: req.user });
}

export async function getPersonal(req, res) {
  try {
    const { prisma } = await import("../config/prisma.js");

    const [medicos, recepcionistas] = await Promise.all([
      prisma.medico.findMany({
        select: {
          medicoId: true,
          nombre: true,
          email: true,
          especialidad: true,
          costoConsulta: true,
          activo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.usuario.findMany({
        where: { rol: "recepcionista" },
        select: {
          usuarioId: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({ medicos, recepcionistas });
  } catch (error) {
    console.error("Error en getPersonal:", error);
    res.status(500).json({ message: "Error al obtener personal" });
  }
}

export async function deletePersonal(req, res) {
  try {
    const { prisma } = await import("../config/prisma.js");
    const { tipo, id } = req.params;

    if (tipo === "medico") {
      const medico = await prisma.medico.findUnique({ where: { medicoId: id } });
      if (!medico) return res.status(404).json({ message: "Médico no encontrado" });

      await prisma.medico.delete({ where: { medicoId: id } });
      return res.json({ message: `Médico ${medico.nombre} eliminado exitosamente` });
    }

    if (tipo === "recepcionista") {
      const usuario = await prisma.usuario.findUnique({ where: { usuarioId: id } });
      if (!usuario) return res.status(404).json({ message: "Recepcionista no encontrada" });
      if (usuario.rol !== "recepcionista") return res.status(400).json({ message: "El usuario no es recepcionista" });

      await prisma.usuario.delete({ where: { usuarioId: id } });
      return res.json({ message: `Recepcionista ${usuario.nombre} eliminada exitosamente` });
    }

    return res.status(400).json({ message: "Tipo inválido. Use 'medico' o 'recepcionista'" });
  } catch (error) {
    console.error("Error en deletePersonal:", error);
    res.status(500).json({ message: "Error al eliminar personal" });
  }
}
