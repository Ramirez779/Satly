import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/satly';
const QUIZ_TIME_LIMIT = 10;
const MIN_CORRECT_FOR_REWARD = 20;

const QuizSession = ({ quizId, onQuizFinish }) => {
    // ... (Estados y lógica se mantienen iguales)
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [sessionStatus, setSessionStatus] = useState('loading');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const [timer, setTimer] = useState(QUIZ_TIME_LIMIT);
    const [isFrozen, setIsFrozen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const [invoice, setInvoice] = useState('');
    const [rewardStatus, setRewardStatus] = useState('');
    const [rewardHash, setRewardHash] = useState(null);

    const currentQuestion = questions[currentQIndex];

    // 1. Cargar las 20 preguntas al iniciar
    useEffect(() => {
        const fetchQuizQuestions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/quiz/${quizId}`);
                setQuestions(response.data.quiz.questions);
                setSessionStatus('active');
            } catch (error) {
                setSessionStatus('error');
                console.error("Error al cargar las preguntas:", error);
            }
        };
        fetchQuizQuestions();
    }, [quizId]);

    // 2. Manejar Respuesta (Validación con Backend)
    const handleAnswer = useCallback(async (answer) => {
        if (isFrozen && answer !== null) return;

        setIsFrozen(true);
        setSelectedOption(answer);

        let isCorrect = false;
        let correctAnswer = '';

        if (answer !== null) {
            const response = await axios.post(`${API_BASE_URL}/answer`, {
                quizId: quizId,
                questionId: currentQuestion.id,
                answer: answer
            });
            isCorrect = response.data.isCorrect;
            correctAnswer = response.data.correctAnswer;
        } else {
            correctAnswer = currentQuestion.correctAnswer;
        }

        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
            setFeedback({ isCorrect: true, answer: answer });
        } else {
            setFeedback({ isCorrect: false, answer: correctAnswer });
        }

        setTimeout(() => {
            if (currentQIndex < questions.length - 1) {
                setCurrentQIndex(prevIndex => prevIndex + 1);
                setTimer(QUIZ_TIME_LIMIT);
                setIsFrozen(false);
                setFeedback(null);
                setSelectedOption(null);
            } else {
                setSessionStatus('finished');
            }
        }, 2000);
    }, [quizId, currentQIndex, questions, isFrozen, currentQuestion]);

    // 3. Lógica del Temporizador
    useEffect(() => {
        if (sessionStatus === 'active' && !isFrozen) {
            const countdown = setInterval(() => {
                setTimer((prevTime) => {
                    if (prevTime === 1) {
                        clearInterval(countdown);
                        handleAnswer(null);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [sessionStatus, isFrozen, handleAnswer]);

    // 4. Reclamo de Recompensa (handleRewardClaim)
    const handleRewardClaim = async () => {
        if (!invoice || !invoice.startsWith('lnbc')) {
            setRewardStatus('❌ Por favor, ingresa una factura Lightning válida.');
            return;
        }
        setRewardStatus('Procesando pago...');

        try {
            const response = await axios.post(`${API_BASE_URL}/reward`, { payment_request: invoice });

            setRewardHash(response.data.payment_hash);
            setRewardStatus(`✅ ¡RECOMPENSA PAGADA! Hash: ${response.data.payment_hash.substring(0, 10)}...`);

        } catch (error) {
            console.error("Error al reclamar recompensa:", error);
            const detail = error.response?.data?.detail || error.response?.data?.error || error.message;
            setRewardStatus(`❌ ERROR DE PAGO: ${detail}`);
        }
    };

    // --- RENDERS ---

    if (sessionStatus === 'loading') {
        return <div style={styles.loading}>Cargando {quizId}...</div>;
    }

    if (sessionStatus === 'error') {
        return <div style={styles.error}>Error al iniciar el quiz.</div>;
    }

    if (sessionStatus === 'finished') {
        return (
            <FinishedScreen
                score={score}
                total={questions.length}
                onClaim={handleRewardClaim}
                invoice={invoice}
                setInvoice={setInvoice}
                rewardStatus={rewardStatus}
                rewardHash={rewardHash}
                onGoBack={onQuizFinish}
            />
        );
    }

    // Vista ACTIVA
    return (
        <div style={styles.container}>

            <header style={styles.header}>
                <button onClick={onQuizFinish} style={styles.backButton}>← Menú Principal</button>
                <div style={styles.progress}>
                    Pregunta {currentQIndex + 1} de {questions.length} | Correctas: {score}
                </div>
                <div style={styles.timerBox}>
                    <span style={styles.timerText}>{timer}s</span>
                </div>
            </header>

            <main style={styles.quizContent}>
                {currentQuestion.imageUrl && (
                    <img
                        src={currentQuestion.imageUrl}
                        alt="Imagen del Quiz"
                        style={styles.questionImage}
                    />
                )}
                <h2 style={styles.questionText}>{currentQuestion.question}</h2>

                <div style={styles.optionsGrid}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = option === selectedOption;
                        let optionStyle = { ...styles.optionButton };

                        // Aplicar estilos de feedback si está congelado
                        if (isFrozen && feedback) {
                            if (feedback.isCorrect && option === selectedOption) {
                                optionStyle = { ...optionStyle, backgroundColor: styles.colors.correctAnswer, boxShadow: styles.optionButton.shadowCorrect, color: styles.colors.textPrimary };
                            } else if (!feedback.isCorrect && option === selectedOption) {
                                optionStyle = { ...optionStyle, backgroundColor: styles.colors.incorrectAnswer, boxShadow: styles.optionButton.shadowIncorrect, color: styles.colors.textPrimary };
                            } else if (!feedback.isCorrect && option === feedback.answer) {
                                optionStyle = { ...optionStyle, backgroundColor: styles.colors.correctAnswer, boxShadow: styles.optionButton.shadowCorrect, color: styles.colors.textPrimary };
                            } else {
                                optionStyle = { ...optionStyle, opacity: 0.6, backgroundColor: styles.colors.surface, color: styles.colors.textPrimary };
                            }
                        } else if (isSelected) { // Estilos de selección activa
                            optionStyle = { ...optionStyle, backgroundColor: styles.colors.accent, boxShadow: styles.optionButton.shadowSelected, color: styles.colors.textPrimary }; // AMARILLO en selección
                        }

                        return (
                            <button
                                key={index}
                                style={optionStyle}
                                onClick={() => handleAnswer(option)}
                                disabled={isFrozen}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};


// --- PANTALLA DE RESULTADOS (FINISHEDSCREEN) ---
const FinishedScreen = ({ score, total, onClaim, invoice, setInvoice, rewardStatus, rewardHash, onGoBack }) => {
    const isWinner = score >= MIN_CORRECT_FOR_REWARD;
    return (
        <div style={styles.finishedContainer}>
            <h2 style={styles.finishedTitle}>¡QUIZ TERMINADO!</h2>
            <p style={styles.finalScore}>Tu Puntaje Final: <span style={styles.scoreNumber}>{score} / {total}</span></p>

            {isWinner ? (
                <>
                    <h3 style={styles.rewardTitleWin}>¡Ganaste la Recompensa! 🏆</h3>
                    <p style={styles.rewardDescription}>¡Felicidades! Has respondido correctamente a {score} preguntas. Genera tu factura Lightning (50 sats) para reclamar tu premio.</p>

                    <textarea
                        placeholder="Pega aquí tu factura Lightning (50 sats)"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                        rows="3"
                        style={styles.invoiceInput}
                    />

                    <button
                        onClick={onClaim}
                        style={styles.rewardButton}
                        disabled={rewardHash}
                    >
                        {rewardHash ? 'RECOMPENSA PAGADA' : 'PAGAR 50 SATOSHIS'}
                    </button>

                    <p style={styles.rewardStatusText}>Estado: {rewardStatus}</p>
                    {rewardHash && <p style={styles.rewardHashText}>Hash: {rewardHash.substring(0, 15)}...</p>}
                </>
            ) : (
                <>
                    <h3 style={styles.rewardTitleLose}>Necesitas {MIN_CORRECT_FOR_REWARD} respuestas correctas.</h3>
                    <p style={styles.rewardDescription}>Vuelve a intentarlo para ganar satoshis reales. ¡La práctica hace al maestro!</p>
                </>
            )}

            <button onClick={onGoBack} style={styles.finishedBackButton}>Volver al Menú</button>
        </div>
    );
};


// --- ESTILOS COMPARTIDOS (Negro y Amarillo BOLD) ---
const styles = {
    colors: {
        primary: '#1C1B1F',        // Negro
        primaryLight: '#333333',   // Gris oscuro
        accent: '#FFD700',         // Dorado/Amarillo
        surface: '#FFFFFF',        // Blanco
        textPrimary: '#1C1B1F',
        correctAnswer: '#4CAF50',  // Verde (Se mantiene para corrección)
        incorrectAnswer: '#F44336' // Rojo (Se mantiene para error)
    },
    container: {
        maxWidth: '100%',
        margin: '0 auto',
        padding: '35px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontWeight: 'normal',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        borderBottom: `3px solid ${'#FFD700'}`, // Borde Dorado
        paddingBottom: '15px'
    },
    backButton: {
        padding: '12px 20px',
        backgroundColor: '#1C1B1F', // Negro
        color: '#FFD700', // Dorado
        borderRadius: '24px',
        border: 'none',
        fontWeight: '900', // BOLD
        cursor: 'pointer',
        fontSize: '1em',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
    },
    progress: {
        fontSize: '1.2em',
        fontWeight: '900',
        color: '#616161'
    },
    timerBox: {
        backgroundColor: '#1C1B1F', // Negro
        borderRadius: '50%',
        width: '70px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
    },
    timerText: {
        color: '#FFD700', // Dorado
        fontSize: '2em',
        fontWeight: '900'
    },
    quizContent: {
        flexGrow: 1,
        marginBottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    questionImage: {
        maxWidth: '70%',
        maxHeight: '280px',
        borderRadius: '24px',
        marginBottom: '30px',
        objectFit: 'cover',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    questionText: {
        textAlign: 'center',
        fontSize: '1.9em',
        fontWeight: '900',
        color: '#1C1B1F',
        marginBottom: '40px'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        width: '100%',
        maxWidth: '800px'
    },
    optionButton: {
        padding: '25px',
        borderRadius: '16px',
        fontSize: '1.3em',
        fontWeight: '900',
        border: '3px solid #1C1B1F', // Borde Negro
        transition: 'all 0.3s ease',
        color: '#1C1B1F',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        shadowCorrect: '0 0 10px #4CAF50',
        shadowIncorrect: '0 0 10px #F44336',
        shadowSelected: '0 3px 6px #FFD700',
        '&:hover': {
            backgroundColor: '#FFD700', // Amarillo al pasar el mouse
            color: '#1C1B1F'
        }
    },
    finishedContainer: {
        textAlign: 'center',
        padding: '50px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
        border: '1px solid #E0E0E0'
    },
    finishedTitle: {
        color: '#1C1B1F',
        fontSize: '2.8em',
        fontWeight: '900',
        marginBottom: '20px'
    },
    finalScore: {
        fontSize: '1.6em',
        color: '#333',
        marginBottom: '25px'
    },
    scoreNumber: {
        fontSize: '2.4em',
        fontWeight: '900',
        color: '#FFD700'
    },
    rewardTitleWin: {
        color: '#4CAF50',
        fontWeight: '900',
        fontSize: '2.2em'
    },
    rewardTitleLose: {
        color: '#F44336',
        fontWeight: '900',
        fontSize: '2.2em'
    },
    rewardDescription: {
        color: '#555',
        fontSize: '1.1em',
        marginBottom: '30px'
    },
    invoiceInput: {
        width: '60%',
        padding: '15px',
        borderRadius: '12px',
        border: `2px solid ${'#1C1B1F'}`,
        marginBottom: '15px',
        fontSize: '1em',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
    },
    rewardButton: {
        padding: '15px 35px',
        backgroundColor: '#1C1B1F',
        color: '#FFD700',
        borderRadius: '30px',
        fontWeight: '900',
        fontSize: '1.2em',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    finishedBackButton: {
        marginTop: '30px',
        padding: '12px 25px',
        backgroundColor: '#1C1B1F',
        color: '#FFD700',
        borderRadius: '25px',
        border: 'none',
        fontWeight: '900',
        cursor: 'pointer',
        fontSize: '1.1em',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    rewardStatusText: {
        marginTop: '15px',
        fontWeight: '900',
        color: '#1C1B1F'
    },
    rewardHashText: {
        fontSize: '0.9em',
        color: '#616161'
    },
    loading: {
        textAlign: 'center',
        fontSize: '2em',
        fontWeight: '900',
        color: '#1C1B1F',
        padding: '50px'
    },
    error: {
        textAlign: 'center',
        fontSize: '1.5em',
        fontWeight: '900',
        color: '#F44336',
        padding: '50px'
    }
};

export default QuizSession;