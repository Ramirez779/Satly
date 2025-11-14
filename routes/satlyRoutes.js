// Rutas de la API para Satly
import express from "express";
import {
    sendReward,
    getQuizList,
    startQuiz,
    validateAnswer,
} from "./../controllers/satlyController.js";

const router = express.Router();

// Lista todos los quizzes disponibles
router.get("/quizzes", getQuizList);

// Devuelve los datos de un quiz específico
router.get("/quiz/:quizId", startQuiz);

// Valida la respuesta enviada por el usuario
router.post("/answer", validateAnswer);

// Envía la recompensa (sats) al usuario
router.post("/reward", sendReward);

export default router;
