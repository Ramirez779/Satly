# Satly – Plataforma Educativa Gamificada con Recompensas en Satoshis

---
# Grupo 42
## conformado por:

- Manrique Antonio Portillo Ramirez
- Leonardo Daniel Perez Borja
- Jonathan Daniel Penado Sanchez

Satly es una app web que enseña conceptos de **Bitcoin** y **Lightning Network** mediante quizzes interactivos.  
Cuando el usuario responde correctamente, puede reclamar una recompensa en **satoshis** que se paga a través de **LNBits** usando una factura Lightning (BOLT11).
---

## 🎯 Objetivo

Transformar el aprendizaje de Bitcoin en una experiencia:

- Sencilla y guiada
- Basada en preguntas y respuestas
- Con límite de tiempo para cada pregunta
- Motivada por recompensas reales en satoshis

---

## ⚙️ Stack tecnológico

### Backend

- **Node.js + Express**
  - `server.js` inicializa la app Express, configura CORS, JSON, rutas y sirve el frontend compilado.
- **Rutas y controladores**
  - `routes/satlyRoutes.js` define las rutas bajo `/api/satly`.
  - `controllers/satlyController.js` contiene:
    - El banco de quizzes (`QUIZZES`) con preguntas, opciones, respuesta correcta e imagen.
    - La lógica para listar quizzes, iniciar un quiz y validar respuestas.
    - La integración con LNBits para enviar la recompensa.
- **Dependencias clave**
  - `axios` para hacer requests HTTP hacia la API de LNBits.
  - `dotenv` para manejar variables de entorno desde `.env`.

### Frontend

- **React + Vite**
  - Punto de entrada: `frontend/src/main.jsx`.
  - La app se monta en el elemento `#root` usando `createRoot` y `StrictMode`.
- **Componentes principales**
  - `SatlyApp.jsx`
    - Modo de quiz rápido: carga una pregunta desde el backend, maneja un contador regresivo y permite reclamar 50 sats si la respuesta es correcta.
  - `QuizSession.jsx`
    - Maneja una sesión completa de **20 preguntas**:
      - Temporizador por pregunta (`QUIZ_TIME_LIMIT`).
      - Puntaje acumulado.
      - Feedback visual (correcto/incorrecto) y bloqueo entre preguntas.
      - Pantalla final que permite reclamar la recompensa si se llega al mínimo requerido (`MIN_CORRECT_FOR_REWARD`).
  - `QuizList.jsx`
    - Pide al backend la lista de quizzes disponibles (`GET /api/satly/quizzes`).
    - Muestra las “rutas de aprendizaje” en tarjetas y permite iniciar un quiz por `quizId`.
- **Estilo**
  - Estilos inline en los componentes (botones, tarjetas, contenedores, etc.).
  - Paleta basada en negro + dorado/amarillo para resaltar el branding de sats.

---

## 🗂️ Estructura del proyecto

```text
Satly/
├─ controllers/
│  └─ satlyController.js     # Lógica de quizzes y envío de recompensas vía LNBits
├─ routes/
│  └─ satlyRoutes.js         # Rutas /api/satly (quizzes, respuestas, recompensa)
├─ frontend/
│  ├─ src/
│  │  ├─ main.jsx            # Punto de entrada de React
│  │  └─ components/
│  │     ├─ SatlyApp.jsx     # Quiz simple con recompensa inmediata
│  │     ├─ QuizSession.jsx  # Sesión de 20 preguntas con puntaje y recompensa
│  │     └─ QuizList.jsx     # Lista de quizzes / rutas de aprendizaje
│  ├─ eslint.config.js       # Configuración de ESLint (React, hooks, refresh)
│  ├─ .gitignore             # Ignora logs, dist, node_modules, etc.
│  └─ vite.config.js         # Configuración de Vite
├─ server.js                 # Servidor Express + static frontend
├─ .env                      # Variables de entorno (NO subir al repo público)
├─ package.json
├─ package-lock.json
└─ readme.md                 # Documentación del proyecto
```

---

## 🔐 Variables de entorno (`.env`)

Ejemplo de configuración mínima para el backend:

```env
PORT=3000

# LNBits
LNBITS_BASE_URL=http://chirilicas.com:5000
BUS_ADMIN_KEY=TU_API_KEY_DE_LNBITS
```

> ⚠️ **Importante:**  
> - Añade `.env` a tu `.gitignore` para que **no se suba a GitHub**.  
> - Usa claves reales solo en entornos seguros (local o servidor).

---

## 🌐 Endpoints principales del backend

Todas las rutas están montadas bajo el prefijo `/api/satly` en `server.js`:

```js
app.use("/api/satly", satlyRoutes);
```

### `GET /api/satly/quizzes`

Devuelve la lista de quizzes disponibles.

- **Lógica en**: `getQuizList` (dentro de `satlyController.js`).
- Respuesta de ejemplo:

```json
{
  "success": true,
  "quizzes": [
    {
      "id": "basic_bitcoin",
      "title": "Fundamentos de Bitcoin (20 preguntas)",
      "totalQuestions": 20
    },
    {
      "id": "lightning_advanced",
      "title": "Adopción y Lightning (20 preguntas)",
      "totalQuestions": 4
    }
  ]
}
```

Usado por el componente `QuizList.jsx` para construir las tarjetas de rutas de aprendizaje.

---

### `GET /api/satly/quiz/:quizId`

Devuelve el contenido completo de un quiz específico (preguntas, opciones, imágenes).

- **Lógica en**: `startQuiz`.
- Parámetros:
  - `quizId`: identificador del quiz (por ejemplo, `basic_bitcoin`).
- Respuesta de ejemplo (estructura general):

```json
{
  "success": true,
  "quiz": {
    "id": "basic_bitcoin",
    "title": "Fundamentos de Bitcoin (20 preguntas)",
    "questions": [
      {
        "id": 1,
        "question": "¿Cuál es el nombre del creador seudónimo de Bitcoin?",
        "options": ["Hal Finney", "Craig Wright", "Nick Szabo", "Satoshi Nakamoto"],
        "correctAnswer": "Satoshi Nakamoto",
        "imageUrl": "https://i.imgur.com/example-satoshi.png"
      }
      // ...
    ]
  }
}
```

Usado por `QuizSession.jsx` para cargar las 20 preguntas al iniciar la sesión.

---

### `POST /api/satly/answer`

Valida la respuesta enviada para una pregunta de un quiz.

- **Lógica en**: `validateAnswer`.
- Body esperado:

```json
{
  "quizId": "basic_bitcoin",
  "questionId": 1,
  "answer": "Satoshi Nakamoto"
}
```

- Respuesta de ejemplo:

```json
{
  "success": true,
  "isCorrect": true,
  "correctAnswer": "Satoshi Nakamoto"
}
```

Usado por `QuizSession.jsx` para actualizar el puntaje y mostrar feedback visual.

> En el modo simple (`SatlyApp.jsx`) también se usa `/answer`, aunque allí se envía solo `answer` y el backend puede interpretar la lógica acorde al quiz actual.

---

### `POST /api/satly/reward`

Envía la recompensa de satoshis usando la API de pagos de LNBits.

- **Lógica en**: `sendReward`.
- Body esperado:

```json
{
  "payment_request": "lnbc1..."
}
```

- El backend realiza un `POST` a:

```text
{LNBITS_BASE_URL}/api/v1/payments
```

con los headers:

```http
X-Api-Key: {BUS_ADMIN_KEY}
Content-Type: application/json
```

- Respuesta de ejemplo:

```json
{
  "success": true,
  "message": "¡50 satoshis enviados al usuario!",
  "payment_hash": "abc123..."
}
```

Usado por:

- `SatlyApp.jsx` (quiz rápido).
- Pantalla final de `QuizSession.jsx` (`FinishedScreen`) cuando el usuario supera el mínimo de aciertos.

---

## 🖥️ Flujo general de la aplicación

1. El usuario accede a la app (frontend servido por Express desde `frontend/dist`).
2. `QuizList.jsx` llama a `GET /api/satly/quizzes` y muestra las rutas de aprendizaje.
3. Al elegir una ruta:
   - `QuizSession.jsx` llama a `GET /api/satly/quiz/:quizId` y carga las preguntas.
4. Por cada pregunta:
   - Se muestra un **temporizador** (`QUIZ_TIME_LIMIT`).
   - El usuario selecciona una opción.
   - Se envía la respuesta a `POST /api/satly/answer`.
   - Se muestra feedback (correcto/incorrecto) y se avanza a la siguiente.
5. Al finalizar el quiz:
   - Se calcula el puntaje (`score`).
   - Si el puntaje ≥ `MIN_CORRECT_FOR_REWARD`, se muestra la sección para pegar una factura Lightning (50 sats).
   - `POST /api/satly/reward` procesa el pago vía LNBits.
6. El usuario ve el **estado del pago** (`rewardStatus`) y el `payment_hash` de la transacción.

---

## 🚀 Cómo ejecutar el proyecto

> Asumiendo que ya tienes **Node.js** instalado.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/satly.git
cd Satly
```

### 2. Instalar dependencias del backend

```bash
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Configurar `.env` en la raíz

Crear un archivo `.env` con tu configuración real de LNBits:

```env
PORT=3000
LNBITS_BASE_URL=http://chirilicas.com:5000
BUS_ADMIN_KEY=TU_API_KEY_DE_LNBITS
```

### 5. Ejecutar backend

```bash
node server.js
```

### 6. Ejecutar frontend

```bash
cd frontend
npm run dev
```
y deja que `server.js` sirva el contenido desde `frontend/dist` (ya está configurado con `express.static`).
---

## 🧩 Mejoras futuras

- Guardar progreso por usuario en una base de datos.
- Sistema de login (por ejemplo, LNURL-auth para login con Lightning).
- Panel admin para crear/editar quizzes desde una interfaz web.
- Internacionalización (ES/EN).
- Métricas de uso: número de intentos, aciertos por pregunta, etc.

---

# Cómo realizar pruebas

Para probar el proyecto solo es necesario configurar correctamente las credenciales en el archivo `.env`.  
Una vez actualizado, el sistema queda listo para ejecutar los quizzes y procesar las recompensas en satoshis.

---

## 🌱 Potencial futuro de Satly

Satly no es solo un prototipo técnico, sino una base sólida para una plataforma educativa con mucho futuro.  
Al combinar contenido sobre Bitcoin y Lightning Network con recompensas reales en satoshis, el proyecto puede:

- Escalar a más escuelas, comunidades y países que quieran enseñar Bitcoin de forma práctica.
- Integrar nuevos módulos de aprendizaje (seguridad, wallets, uso cotidiano, comercios, etc.).
- Conectarse con otras herramientas del ecosistema Lightning (LNURL-auth, tiendas, juegos, etc.).
- Servir como laboratorio para probar dinámicas de incentivos con micropagos.
- Adaptarse a distintos niveles educativos y perfiles de usuario.

Satly no es solo un proyecto; es una **propuesta de futuro**.  
Plantea una forma distinta de enseñar Bitcoin: no solo desde la teoría, sino desde la experiencia, el juego y las recompensas en satoshis.  
Más que una app, Satly puede convertirse en una **plataforma de referencia** para que estudiantes, docentes y comunidades aprendan a usar Bitcoin de verdad, paso a paso, mientras se divierten y reciben incentivos que conectan el aprendizaje con la economía digital del mundo real.

Con una buena estrategia de contenido, métricas de uso y mejoras en la experiencia de usuario, Satly puede evolucionar de demo educativa a una solución estable para aprender Bitcoin jugando y ganando sats.

---

## Hecho con todo amor y cariño por **grupo 42** ❤️
