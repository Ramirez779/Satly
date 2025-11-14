// Dependencias principales del backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import satlyRoutes from "./routes/satlyRoutes.js";

// Carga variables de entorno (.env)
dotenv.config();

// Crea la app de Express
const app = express();

// Middleware básicos
app.use(cors());           // Permite peticiones desde otros orígenes
app.use(express.json());   // Permite leer JSON en req.body

// Reconstruye __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sirve el frontend ya compilado (Vite/React en /frontend/dist)
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

// Rutas de la API de Satly (ej: /api/satly/...)
app.use("/api/satly", satlyRoutes);

// Cualquier otra ruta devuelve el index.html del frontend (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
});

// Arranca el servidor en el puerto definido o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
