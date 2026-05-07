/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "rol_usuario" AS ENUM ('recepcionista', 'medico', 'director');

-- CreateEnum
CREATE TYPE "estado_cita" AS ENUM ('programada', 'completada', 'cancelada');

-- CreateEnum
CREATE TYPE "tipo_notificacion" AS ENUM ('confirmacion', 'recordatorio', 'cancelacion');

-- CreateEnum
CREATE TYPE "canal_notificacion" AS ENUM ('email', 'push');

-- CreateEnum
CREATE TYPE "estado_notificacion" AS ENUM ('enviada', 'fallida', 'reintentando');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_userId_fkey";

-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_userId_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "MedicalRecord";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cognito_sub" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "rol" "rol_usuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "paciente_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cognito_sub" VARCHAR(255),
    "nombre" VARCHAR(255) NOT NULL,
    "fecha_nacimiento" DATE NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "folio" VARCHAR(50) NOT NULL,
    "device_token" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("paciente_id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "medico_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "especialidad" VARCHAR(255) NOT NULL,
    "horario" JSONB NOT NULL,
    "costo_consulta" DECIMAL(10,2) NOT NULL,
    "foto_url" VARCHAR(500),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("medico_id")
);

-- CreateTable
CREATE TABLE "citas" (
    "cita_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "duracion_min" INTEGER NOT NULL DEFAULT 30,
    "estado" "estado_cita" NOT NULL,
    "motivo" TEXT,
    "motivo_cancelacion" TEXT,
    "creado_por" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("cita_id")
);

-- CreateTable
CREATE TABLE "expedientes" (
    "expediente_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "medico_id" UUID NOT NULL,
    "cita_id" UUID,
    "motivo_consulta" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,
    "observaciones" TEXT,
    "archivos_s3" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expedientes_pkey" PRIMARY KEY ("expediente_id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "notificacion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "cita_id" UUID,
    "tipo" "tipo_notificacion" NOT NULL,
    "canal" "canal_notificacion" NOT NULL,
    "estado" "estado_notificacion" NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "enviado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("notificacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cognito_sub_key" ON "usuarios"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_cognito_sub_key" ON "pacientes"("cognito_sub");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_email_key" ON "pacientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_folio_key" ON "pacientes"("folio");

-- CreateIndex
CREATE INDEX "idx_pacientes_email" ON "pacientes"("email");

-- CreateIndex
CREATE INDEX "idx_pacientes_folio" ON "pacientes"("folio");

-- CreateIndex
CREATE INDEX "idx_medicos_especialidad" ON "medicos"("especialidad");

-- CreateIndex
CREATE INDEX "idx_citas_medico_fecha" ON "citas"("medico_id", "fecha_hora");

-- CreateIndex
CREATE INDEX "idx_citas_paciente" ON "citas"("paciente_id");

-- CreateIndex
CREATE INDEX "idx_expedientes_paciente" ON "expedientes"("paciente_id");

-- CreateIndex
CREATE INDEX "idx_notificaciones_paciente" ON "notificaciones"("paciente_id");

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("paciente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("medico_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("paciente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("medico_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("cita_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("paciente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_cita_id_fkey" FOREIGN KEY ("cita_id") REFERENCES "citas"("cita_id") ON DELETE SET NULL ON UPDATE CASCADE;
