/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `medicos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `pacientes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "medicos" DROP CONSTRAINT "medicos_usuario_id_fkey";

-- AlterTable
ALTER TABLE "medicos" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "password_hash" VARCHAR(255) NOT NULL,
ALTER COLUMN "usuario_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pacientes" ADD COLUMN     "password_hash" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "medicos_email_key" ON "medicos"("email");

-- CreateIndex
CREATE INDEX "idx_medicos_email" ON "medicos"("email");

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;
