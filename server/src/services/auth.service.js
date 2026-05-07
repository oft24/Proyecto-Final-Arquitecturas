import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

export async function registerUser(payload) {
  const hash = await bcrypt.hash(payload.password, 10);
  const role = payload.role === "doctor" ? "DOCTOR" : "PATIENT";

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: hash,
      role,
      doctor: role === "DOCTOR" ? { create: { specialty: "General", experience: 5, location: "Consultorio 1" } } : undefined,
      patient: role === "PATIENT" ? { create: {} } : undefined,
    },
  });

  return issueTokens(user);
}

export async function loginUser(payload) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) throw { status: 401, message: "Credenciales invalidas" };

  const valid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!valid) throw { status: 401, message: "Credenciales invalidas" };

  return issueTokens(user);
}

function issueTokens(user) {
  const tokenPayload = { sub: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  };
}
