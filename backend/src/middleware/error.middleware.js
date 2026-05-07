export function errorHandler(err, _req, res, _next) {
  console.error("Error:", err);
  
  const status = err.status ?? 500;
  const isValidationError = err.array && typeof err.array === "function";
  
  if (isValidationError) {
    // Es un error de validación de express-validator
    return res.status(400).json({
      message: "Validation failed",
      errors: err.array(),
    });
  }
  
  // Errores de Prisma
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(400).json({
      message: `${field} ya existe en el sistema`,
      field,
    });
  }
  
  if (err.code === "P2025") {
    return res.status(404).json({
      message: "Registro no encontrado",
    });
  }
  
  // Errores genéricos
  return res.status(status).json({
    message: err.message ?? "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
