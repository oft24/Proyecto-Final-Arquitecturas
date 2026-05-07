export function getDoctorDashboard(_req, res) {
  res.json({
    stats: { patientsToday: 12, pendingAppointments: 3, cancelled: 2 },
    alerts: [
      { title: "3 citas sin confirmar", description: "Requieren llamada de confirmacion" },
      { title: "2 expedientes incompletos", description: "Pendientes de actualizar" },
    ],
  });
}
