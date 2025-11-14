import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/satly';

const QuizList = ({ onStartQuiz }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/quizzes`);
                setQuizzes(response.data.quizzes);
            } catch (error) {
                console.error("Error fetching quiz list:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    if (loading) {
        return <div style={styles.loading}>Cargando rutas de aprendizaje...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Elige tu Aventura de Sats 🚀</h2>

            <div style={styles.listGrid}>
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        style={styles.quizCard}
                    >
                        <h3 style={styles.cardTitle}>{quiz.title}</h3>
                        <p style={styles.cardDetail}>{quiz.totalQuestions} Preguntas - ¡Gana {quiz.totalQuestions * 50 / 20} Sats!</p>
                        <button
                            onClick={() => onStartQuiz(quiz.id)}
                            style={styles.startButton}
                        >
                            Empezar Desafío
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        border: '1px solid #E6E0E9'
    },
    title: {
        color: '#1C1B1F', // Negro
        fontWeight: '900',
        marginBottom: '40px',
        fontSize: '2.5em',
        textAlign: 'center'
    },
    listGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        padding: '20px'
    },
    quizCard: {
        backgroundColor: '#FFFBEB', // Amarillo muy claro
        borderRadius: '24px',
        padding: '30px',
        border: '3px solid #FFD700', // Borde Dorado
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    cardTitle: {
        fontWeight: '900',
        fontSize: '1.6em',
        color: '#1C1B1F', // Texto oscuro
        marginBottom: '15px'
    },
    cardDetail: {
        color: '#49454F',
        marginBottom: '25px',
        fontWeight: '600',
        fontSize: '1.1em'
    },
    startButton: {
        padding: '15px 30px',
        backgroundColor: '#1C1B1F', // Negro Primario
        color: '#FFD700', // Dorado en texto
        borderRadius: '30px', // Botón "Pill"
        fontWeight: '900',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2em',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#333333'
        }
    },
    loading: {
        textAlign: 'center',
        fontSize: '1.8em',
        color: '#1C1B1F',
        fontWeight: 'bold'
    }
};

export default QuizList;