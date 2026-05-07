export function getAppointments(_req, res) {
  res.json([
    { id: "a1", doctor: "Dra. Maria Gonzalez", date: "2026-05-09", time: "10:00", status: "CONFIRMED" },
    { id: "a2", doctor: "Dr. Jose Ramirez", date: "2026-05-11", time: "09:00", status: "PENDING" },
  ]);
}
