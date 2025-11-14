// Componente principal del quiz de Satly
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// URL base del backend de Satly
const API_BASE_URL = 'http://localhost:3000/api/satly';
// Tiempo límite para responder (segundos)
const QUIZ_TIME_LIMIT = 20;

const SatlyApp = () => {
    // Datos del quiz (pregunta y opciones)
    const [quizData, setQuizData] = useState(null);
    // Respuesta seleccionada por el usuario
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    // Estado del quiz: loading | active | answered | reward | error
    const [quizStatus, setQuizStatus] = useState('loading');
    // Mensaje final del resultado (correcto / incorrecto / error)
    const [quizResult, setQuizResult] = useState('');
    // Contador regresivo en segundos
    const [timer, setTimer] = useState(QUIZ_TIME_LIMIT);

    // Factura Lightning que pega el usuario
    const [invoice, setInvoice] = useState('');
    // Mensaje sobre el estado del pago de la recompensa
    const [rewardStatus, setRewardStatus] = useState('');
    // Hash del pago realizado
    const [rewardHash, setRewardHash] = useState(null);

    // Enviar respuesta del quiz al backend
    const handleAnswerSubmission = async (answer) => {
        if (quizStatus !== 'active') return;

        setQuizStatus('answered');
        setSelectedAnswer(answer);

        try {
            const response = await axios.post(`${API_BASE_URL}/answer`, { answer });

            if (response.data.isCorrect) {
                setQuizResult('¡CORRECTO! Reclama tus 50 satoshis.');
                setQuizStatus('reward');
            } else {
                setQuizResult(`INCORRECTO. La respuesta correcta era: ${response.data.message.split(': ')[1]}`);
            }

        } catch (err) {
            setQuizResult('ERROR de conexión. Inténtalo de nuevo.');
            console.error(err);
        }
    };

    // Reclamar recompensa enviando la factura Lightning al backend
    const handleRewardClaim = async () => {
        // Validación rápida de formato de invoice
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

    // Cargar un quiz desde el backend al montar el componente
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/quiz`);
                setQuizData(response.data.quiz);
                setQuizStatus('active');
            } catch (err) {
                setQuizStatus('error');
                console.error("Error al cargar el quiz:", err);
            }
        };
        fetchQuiz();
    }, []);

    // Manejar el temporizador del quiz
    useEffect(() => {
        if (quizStatus === 'active') {
            const countdown = setInterval(() => {
                setTimer((prevTime) => {
                    if (prevTime === 1) {
                        clearInterval(countdown);
                        // Si se acaba el tiempo, se envía respuesta nula
                        handleAnswerSubmission(null);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            // Limpiar intervalo cuando cambie el estado o se desmonte
            return () => clearInterval(countdown);
        }
    }, [quizStatus]);

    // Estados simples de carga y error
    if (quizStatus === 'loading') {
        return <div style={styles.loading}>Cargando Quiz...</div>;
    }

    if (quizStatus === 'error') {
        return <div style={styles.error}>Error al cargar el quiz. Verifica la conexión del servidor.</div>;
    }

    return (
        <div style={styles.container}>
            {/* Encabezado con contador y título */}
            <header style={styles.header}>
                <div style={styles.timerBox}>
                    <span style={styles.timerText}>{timer}s</span>
                </div>
                <h1 style={styles.questionTitle}>Pregunta de Satoshis</h1>
            </header>

            {/* Contenido principal del quiz */}
            <main style={styles.quizContent}>
                <h2 style={styles.questionText}>{quizData.question}</h2>

                <div style={styles.optionsGrid}>
                    {quizData.options.map((option, index) => (
                        <button
                            key={index}
                            style={{
                                ...styles.optionButton,
                                backgroundColor:
                                    selectedAnswer === option
                                        ? styles.optionButton.selectedBg
                                        : styles.optionButton.defaultBg,
                                opacity: quizStatus === 'answered' || quizStatus === 'reward' ? 0.6 : 1,
                                cursor: quizStatus === 'active' ? 'pointer' : 'default',
                            }}
                            onClick={() => quizStatus === 'active' && handleAnswerSubmission(option)}
                            disabled={quizStatus !== 'active'}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                {(quizStatus === 'answered' || quizStatus === 'reward') && (
                    <p style={styles.resultText.incorrect}>{quizResult}</p>
                )}
            </main>

            {/* Sección para reclamar sats cuando la respuesta fue correcta */}
            {quizStatus === 'reward' && (
                <div style={styles.rewardBox}>
                    <h3 style={styles.rewardTitle}>🎉 Reclama tus Sats!</h3>
                    <p style={styles.rewardDescription}>
                        Genera una factura Lightning de **50 satoshis** en tu wallet y pégala aquí.
                    </p>

                    <textarea
                        placeholder="Pega aquí tu factura Lightning (lnbc...)"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                        rows="3"
                        style={styles.invoiceInput}
                    />

                    <button
                        onClick={handleRewardClaim}
                        style={styles.rewardButton}
                    >
                        PAGAR 50 SATOSHIS
                    </button>

                    <p style={styles.rewardStatusText}>Estado: {rewardStatus}</p>
                    {rewardHash && (
                        <p style={styles.rewardHashText}>
                            Hash: {rewardHash.substring(0, 15)}...
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// Estilos inline para el layout del quiz
const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '25px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontWeight: 'bold',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        borderBottom: '4px solid #FF9900',
        paddingBottom: '15px'
    },
    questionTitle: {
        color: '#333',
        fontSize: '1.5em',
        fontWeight: '900',
        margin: 0
    },
    timerBox: {
        backgroundColor: '#6750A4',
        borderRadius: '50%',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    },
    timerText: {
        color: 'white',
        fontSize: '2.5em',
        fontWeight: '900'
    },
    quizContent: {
        flexGrow: 1,
        marginBottom: '30px'
    },
    questionText: {
        textAlign: 'center',
        fontSize: '1.8em',
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: '40px'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    optionButton: {
        padding: '25px',
        borderRadius: '12px',
        fontSize: '1.2em',
        fontWeight: '900',
        border: 'none',
        transition: 'background-color 0.2s',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        defaultBg: '#007bff',
        selectedBg: '#FF9900'
    },
    resultText: {
        incorrect: {
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '1.4em',
            fontWeight: '900',
            color: '#DC3545'
        }
    },
    rewardBox: {
        borderTop: '3px solid #6750A4',
        paddingTop: '20px',
        marginTop: '20px',
        textAlign: 'center'
    },
    rewardTitle: {
        color: '#6750A4',
        fontSize: '1.6em',
        fontWeight: '900'
    },
    rewardDescription: {
        color: '#555',
        fontSize: '1em',
        marginBottom: '15px'
    },
    invoiceInput: {
        width: '90%',
        padding: '12px',
        borderRadius: '8px',
        border: '2px solid #FF9900',
        marginBottom: '15px',
        fontSize: '1em'
    },
    rewardButton: {
        padding: '12px 30px',
        backgroundColor: '#FF9900',
        color: 'white',
        borderRadius: '30px',
        fontWeight: '900',
        fontSize: '1.1em',
        border: 'none',
        cursor: 'pointer'
    },
    rewardStatusText: {
        marginTop: '15px',
        fontWeight: '900',
        color: '#1a1a1a'
    },
    rewardHashText: {
        fontSize: '0.8em',
        color: '#555'
    },
    loading: {
        textAlign: 'center',
        fontSize: '2em',
        fontWeight: '900',
        color: '#FF9900'
    },
    error: {
        textAlign: 'center',
        fontSize: '1.5em',
        fontWeight: '900',
        color: '#DC3545'
    }
};

export default SatlyApp;
