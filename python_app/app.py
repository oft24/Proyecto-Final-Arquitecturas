from flask import Flask, render_template

app = Flask(__name__)

APPOINTMENTS = [
    {"time": "09:00 AM", "room": "Consultorio 1", "patient": "Ana Martinez", "type": "Consulta General", "status": "Confirmada"},
    {"time": "10:30 AM", "room": "Consultorio 1", "patient": "Carlos Rodriguez", "type": "Control Cardiologico", "status": "Confirmada"},
    {"time": "11:00 AM", "room": "Consultorio 1", "patient": "Laura Sanchez", "type": "Primera Cita", "status": "Pendiente"},
    {"time": "02:00 PM", "room": "Consultorio 1", "patient": "Miguel Torres", "type": "Seguimiento", "status": "Confirmada"},
    {"time": "03:30 PM", "room": "Consultorio 1", "patient": "Patricia Gomez", "type": "Consulta General", "status": "Confirmada"},
]

PATIENTS = [
    {"initials": "AM", "name": "Ana Martinez Garcia", "meta": "34 anos · Femenino · Tipo de sangre: O+", "last_visit": "15 Abr 2026", "conditions": 2},
    {"initials": "CR", "name": "Carlos Rodriguez Lopez", "meta": "45 anos · Masculino · Tipo de sangre: A+", "last_visit": "20 Abr 2026", "conditions": 1},
    {"initials": "LS", "name": "Laura Sanchez Perez", "meta": "28 anos · Femenino · Tipo de sangre: B+", "last_visit": "22 Abr 2026", "conditions": 0},
    {"initials": "MT", "name": "Miguel Torres Hernandez", "meta": "52 anos · Masculino · Tipo de sangre: O-", "last_visit": "25 Abr 2026", "conditions": 1},
]

PATIENT_NOTIFICATIONS = [
    {"title": "Recordatorio de Cita", "text": "Tu cita con la Dra. Gonzalez es en 6 dias. Recuerda llegar 10 minutos antes.", "time": "Hace 2 horas", "tone": "blue"},
    {"title": "Resultados Disponibles", "text": "Los resultados de tu analisis de sangre estan listos para consultar.", "time": "Hace 1 dia", "tone": "green"},
    {"title": "Cita Confirmada", "text": "Tu cita del 9 de mayo ha sido confirmada exitosamente.", "time": "Hace 3 dias", "tone": "gray"},
]

PATIENT_APPOINTMENTS = [
    {"doctor": "Dra. Maria Gonzalez", "specialty": "Cardiologia", "date": "9 May 2026", "time": "10:00 AM", "location": "Consultorio 1 - Clinica San Angel", "type": "Control Cardiologico", "cost": "$800", "status": "proxima"},
    {"doctor": "Dra. Maria Gonzalez", "specialty": "Cardiologia", "date": "12 May 2026", "time": "03:00 PM", "location": "Consultorio 1 - Clinica San Angel", "type": "Seguimiento", "cost": "$800", "status": "proxima"},
]

DOCTORS = [
    {"name": "Dra. Maria Gonzalez", "specialty": "Cardiologia", "rating": "4.9", "reviews": 127, "university": "UNAM", "desc": "Especialista en cardiologia preventiva con enfoque en enfermedades cardiovasculares y hipertension.", "exp": "15 anos", "cost": "$800", "location": "Consultorio 1", "slots": ["9 May 10:00 AM", "9 May 11:30 AM", "10 May 03:00 PM", "12 May 09:00 AM"]},
    {"name": "Dr. Jose Ramirez", "specialty": "Medicina General", "rating": "4.8", "reviews": 203, "university": "ITESM", "desc": "Medico general con amplia experiencia en atencion primaria y prevencion de enfermedades.", "exp": "20 anos", "cost": "$500", "location": "Consultorio 2", "slots": ["9 May 09:00 AM", "9 May 02:00 PM", "10 May 04:00 PM", "11 May 10:00 AM"]},
    {"name": "Dra. Carmen Flores", "specialty": "Dermatologia", "rating": "4.7", "reviews": 89, "university": "UAdC", "desc": "Especialista en dermatologia estetica y clinica, tratamiento de acne y enfermedades de la piel.", "exp": "10 anos", "cost": "$700", "location": "Consultorio 3", "slots": ["9 May 11:00 AM", "10 May 01:00 PM", "12 May 05:00 PM", "13 May 09:30 AM"]},
    {"name": "Dr. Roberto Silva", "specialty": "Traumatologia", "rating": "4.9", "reviews": 156, "university": "UANL", "desc": "Traumatologo especializado en lesiones deportivas y cirugia ortopedica.", "exp": "18 anos", "cost": "$850", "location": "Consultorio 1", "slots": ["10 May 08:00 AM", "10 May 12:00 PM", "11 May 03:30 PM", "13 May 10:30 AM"]},
]


@app.get("/")
def landing():
    return render_template("landing.html")


@app.get("/doctor")
def doctor_home():
    return render_template("doctor_home.html", active_page="inicio", appointments=APPOINTMENTS)


@app.get("/doctor/agenda")
def doctor_agenda():
    return render_template("doctor_agenda.html", active_page="agenda", appointments=APPOINTMENTS)


@app.get("/doctor/pacientes")
def doctor_patients():
    return render_template("doctor_pacientes.html", active_page="pacientes", patients=PATIENTS)


@app.get("/paciente")
def patient_home():
    return render_template("patient_home.html", active_page="inicio", notifications=PATIENT_NOTIFICATIONS)


@app.get("/paciente/citas")
def patient_citas():
    return render_template("patient_citas.html", active_page="citas", appointments=PATIENT_APPOINTMENTS)


@app.get("/paciente/expediente")
def patient_expediente():
    return render_template("patient_expediente.html", active_page="expediente")


@app.get("/paciente/agendar")
def patient_agendar():
    return render_template("patient_agendar.html", active_page="agendar", doctors=DOCTORS)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
