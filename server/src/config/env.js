import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "refresh_secret",
};
