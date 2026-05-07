export function getPatientDashboard(_req, res) {
  res.json({
    nextAppointment: {
      doctor: "Dra. Maria Gonzalez",
      date: "2026-05-09T10:00:00.000Z",
      location: "Consultorio 1 - Clinica San Angel",
    },
    stats: { completed: 12, upcoming: 2, reminders: 3, doctorsVisited: 4 },
  });
}
