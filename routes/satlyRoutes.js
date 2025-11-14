import express from "express";
import { sendReward, getQuizList, startQuiz, validateAnswer } from "./../controllers/satlyController.js";
const router = express.Router();

router.get("/quizzes", getQuizList);

router.get("/quiz/:quizId", startQuiz);

router.post("/answer", validateAnswer);

router.post("/reward", sendReward);

export default router;