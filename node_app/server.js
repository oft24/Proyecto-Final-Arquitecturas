const express = require("express");
const path = require("path");

const app = express();
const htmlPath = path.resolve(__dirname, "../dyas-portal.html");

app.get("/", (_req, res) => {
  res.sendFile(htmlPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});
