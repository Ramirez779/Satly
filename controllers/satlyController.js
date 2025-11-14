import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const LNBITS_BASE_URL = process.env.LNBITS_BASE_URL || "http://chirilicas.com:5000";
const ADMIN_KEY = process.env.BUS_ADMIN_KEY || "f55682d14a044ba88060411fadd61023";
const REWARD_AMOUNT_SATS = 50;
const QUESTIONS_PER_QUIZ = 20;

const QUIZZES = [
  {
    id: 'basic_bitcoin',
    title: 'Fundamentos de Bitcoin (20 preguntas)',
    questions: [
      { id: 1, question: "¿Cuál es el nombre del creador seudónimo de Bitcoin?", options: ["Hal Finney", "Craig Wright", "Nick Szabo", "Satoshi Nakamoto"], correctAnswer: "Satoshi Nakamoto", imageUrl: "https://i.imgur.com/example-satoshi.png" },
      { id: 2, question: "¿Qué tecnología subyacente permite a Bitcoin funcionar sin una autoridad central?", options: ["Inteligencia Artificial", "Base de Datos Centralizada", "Blockchain", "Servidores Web"], correctAnswer: "Blockchain", imageUrl: "https://i.imgur.com/example-blockchain.png" },
      { id: 3, question: "¿Qué evento ocurre aproximadamente cada cuatro años y reduce a la mitad la recompensa por minar un bloque de Bitcoin?", options: ["Hard Fork", "Soft Fork", "Halving", "Bull Run"], correctAnswer: "Halving", imageUrl: "https://i.imgur.com/example-halving.png" },
      { id: 4, question: "¿Cuál es la unidad más pequeña de Bitcoin?", options: ["Bit", "Finney", "Satoshi", "MilliBit"], correctAnswer: "Satoshi", imageUrl: "https://i.imgur.com/example-satoshi-unit.png" },
      { id: 5, question: "¿Qué es una 'clave privada' en Bitcoin?", options: ["Una contraseña para tu cuenta de email", "Un código secreto que te permite gastar tus bitcoins", "Tu dirección de Bitcoin pública", "El nombre de usuario de tu wallet"], correctAnswer: "Un código secreto que te permite gastar tus bitcoins", imageUrl: "https://i.imgur.com/example-privatekey.png" },
      { id: 6, question: "¿Qué tipo de ataque se previene con el mecanismo de 'Prueba de Trabajo' (Proof of Work)?", options: ["Ataques DDoS", "Ataques de Doble Gasto", "Ataques de Phishing", "Ataques de Fuerza Bruta"], correctAnswer: "Ataques de Doble Gasto", imageUrl: "https://i.imgur.com/example-pow.png" },
      { id: 7, question: "¿Qué es la Red Lightning?", options: ["Una red social para traders de Bitcoin", "Una solución de capa 2 para transacciones instantáneas y baratas de Bitcoin", "La blockchain principal de Bitcoin", "Un protocolo de minería de Bitcoin"], correctAnswer: "Una solución de capa 2 para transacciones instantáneas y baratas de Bitcoin", imageUrl: "https://i.imgur.com/example-lightning.png" },
      { id: 8, question: "¿Cuál es el suministro máximo de Bitcoins que existirán?", options: ["Infinito", "1 millón", "21 millones", "100 millones"], correctAnswer: "21 millones", imageUrl: "https://i.imgur.com/example-21million.png" },
      { id: 9, question: "¿Qué es una 'dirección de Bitcoin'?", options: ["Tu número de cuenta bancaria", "Una secuencia de caracteres que representa un destino para los Bitcoins", "El nombre de tu wallet", "Tu clave privada"], correctAnswer: "Una secuencia de caracteres que representa un destino para los Bitcoins", imageUrl: "https://i.imgur.com/example-address.png" },
      { id: 10, question: "¿Qué término se usa para describir el proceso de validar transacciones y añadirlas a la blockchain?", options: ["Staking", "Trading", "Minar", "Fauceting"], correctAnswer: "Minar", imageUrl: "https://i.imgur.com/example-mining.png" },
      { id: 11, question: "¿Qué es un 'nodo' en la red Bitcoin?", options: ["Un banco", "Una computadora que mantiene una copia de la blockchain y valida transacciones", "Un tipo de wallet móvil", "Una empresa de intercambio"], correctAnswer: "Una computadora que mantiene una copia de la blockchain y valida transacciones", imageUrl: "https://i.imgur.com/example-node.png" },
      { id: 12, question: "¿Cuál es el propósito principal de una 'factura Lightning' (BOLT11)?", options: ["Pagar impuestos", "Solicitar un pago en la Red Lightning", "Firmar un contrato inteligente", "Crear una nueva clave privada"], correctAnswer: "Solicitar un pago en la Red Lightning", imageUrl: "https://i.imgur.com/example-invoice.png" },
      { id: 13, question: "¿Qué significa 'KYC' en el contexto de exchanges de criptomonedas?", options: ["Keep Your Crypto", "Know Your Customer", "Key Yield Code", "Krypton Yield Curve"], correctAnswer: "Know Your Customer", imageUrl: "https://i.imgur.com/example-kyc.png" },
      { id: 14, question: "¿Cómo se llama el proceso de enviar Bitcoin de una dirección a otra?", options: ["Depósito", "Retiro", "Transacción", "Minería"], correctAnswer: "Transacción", imageUrl: "https://i.imgur.com/example-transaction.png" },
      { id: 15, question: "¿Qué es un 'Hard Fork' en Bitcoin?", options: ["Una mejora de software compatible con versiones anteriores", "Un cambio radical en el protocolo que crea una nueva cadena de bloques", "Una herramienta de minería", "Un tipo de wallet"], correctAnswer: "Un cambio radical en el protocolo que crea una nueva cadena de bloques", imageUrl: "https://i.imgur.com/example-hardfork.png" },
      { id: 16, question: "¿Qué es 'HODL'?", options: ["Vender rápidamente para obtener ganancias", "Comprar y vender a menudo", "Mantener tus bitcoins a largo plazo, sin vender", "Una criptomoneda alternativa"], correctAnswer: "Mantener tus bitcoins a largo plazo, sin vender", imageUrl: "https://i.imgur.com/example-hodl.png" },
      { id: 17, question: "¿Cuál es la principal ventaja de la Red Lightning sobre la blockchain de Bitcoin para transacciones pequeñas?", options: ["Mayor seguridad", "Transacciones más lentas", "Costos más altos", "Transacciones instantáneas y de bajo costo"], correctAnswer: "Transacciones instantáneas y de bajo costo", imageUrl: "https://i.imgur.com/example-lightning-advantage.png" },
      { id: 18, question: "¿Qué es un 'pool de minería'?", options: ["Un lugar donde se almacenan bitcoins", "Un grupo de mineros que combinan su poder computacional para encontrar bloques más rápido", "Un tipo de contrato inteligente", "Una plataforma de trading"], correctAnswer: "Un grupo de mineros que combinan su poder computacional para encontrar bloques más rápido", imageUrl: "https://i.imgur.com/example-miningpool.png" },
      { id: 19, question: "¿Qué significa 'DCA' (Dollar-Cost Averaging)?", options: ["Comprar una gran cantidad de Bitcoin de una sola vez", "Invertir una cantidad fija de dinero regularmente, independientemente del precio", "Vender todo tu Bitcoin en picos de precio", "Usar Bitcoin para comprar dólares"], correctAnswer: "Invertir una cantidad fija de dinero regularmente, independientemente del precio", imageUrl: "https://i.imgur.com/example-dca.png" },
      { id: 20, question: "¿Qué es una 'wallet de hardware'?", options: ["Una aplicación de wallet en tu teléfono", "Una wallet que se ejecuta en la nube", "Un dispositivo físico que almacena tus claves privadas offline", "Una hoja de papel con tu dirección de Bitcoin"], correctAnswer: "Un dispositivo físico que almacena tus claves privadas offline", imageUrl: "https://i.imgur.com/example-hardwarewallet.png" },
    ]
  },
  {
    id: 'lightning_advanced',
    title: 'Adopción y Lightning (20 preguntas)',
    questions: [
      { id: 1, question: "¿Cómo se llama el protocolo que permite pagos en Lightning Network?", options: ["TCP/IP", "HTTP", "BOLT", "FTP"], correctAnswer: "BOLT", imageUrl: "https://i.imgur.com/example-bolt.png" },
      { id: 2, question: "¿Cuál es una ventaja clave de los pagos Lightning sobre los pagos on-chain para comerciantes?", options: ["Mayor confirmación de bloque", "Menor liquidez", "Finalidad instantánea y menores comisiones", "Requiere más datos"], correctAnswer: "Finalidad instantánea y menores comisiones", imageUrl: "https://i.imgur.com/example-lightning-commerce.png" },
      { id: 3, question: "¿Qué significa 'HTLC' en Lightning Network?", options: ["High-Throughput Lightning Channel", "Hashed Timelock Contract", "Hypertext Transfer Lightning Client", "Hybrid Transaction Load Control"], correctAnswer: "Hashed Timelock Contract", imageUrl: "https://i.imgur.com/example-htlc.png" },
      { id: 4, question: "¿Cuál es el principal desafío al escalar Bitcoin sin Lightning Network?", options: ["Costos de energía", "Baja seguridad", "Congestión de la red y altas comisiones", "Falta de mineros"], correctAnswer: "Congestión de la red y altas comisiones", imageUrl: "https://i.imgur.com/example-scalability.png" }
    ]
  }
];

const getQuizList = async (req, res) => {
  const list = QUIZZES.map(q => ({ id: q.id, title: q.title, totalQuestions: q.questions.length }));
  return res.json({ success: true, quizzes: list });
};

const startQuiz = async (req, res) => {
  const { quizId } = req.params;
  const quiz = QUIZZES.find(q => q.id === quizId);

  if (!quiz) {
    return res.status(404).json({ success: false, error: "Quiz no encontrado." });
  }

  return res.json({ success: true, quiz: quiz });
};

const validateAnswer = async (req, res) => {
  const { quizId, questionId, answer } = req.body;
  const quiz = QUIZZES.find(q => q.id === quizId);

  if (!quiz) return res.status(404).json({ success: false, message: "Quiz no encontrado." });

  const question = quiz.questions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ success: false, message: "Pregunta no encontrada." });

  const isCorrect = answer === question.correctAnswer;

  return res.json({
    success: true,
    isCorrect: isCorrect,
    correctAnswer: question.correctAnswer
  });
};

const sendReward = async (req, res) => {
  const { payment_request } = req.body;

  if (!payment_request) {
    return res.status(400).json({ success: false, error: "Falta la factura Lightning." });
  }

  try {
    const resp = await axios.post(
      `${LNBITS_BASE_URL}/api/v1/payments`,
      {
        out: true,
        bolt11: payment_request,
        memo: `Recompensa Satly por completar actividad`
      },
      {
        headers: { "X-Api-Key": ADMIN_KEY, "Content-Type": "application/json" }
      }
    );

    return res.json({
      success: true,
      message: `¡${REWARD_AMOUNT_SATS} satoshis enviados al usuario!`,
      payment_hash: resp.data.payment_hash
    });

  } catch (err) {
    console.error("sendReward error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: "Error al enviar la recompensa",
      detail: err.response?.data?.detail || err.response?.data?.detail?.detail || err.message
    });
  }
};

export { sendReward, getQuizList, startQuiz, validateAnswer };
