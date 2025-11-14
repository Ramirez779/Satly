import React, { useState } from 'react';
import QuizList from './components/QuizList.jsx';
import QuizSession from './components/QuizSession.jsx';

// Componente para el Footer Empresarial (Minimalista BOLD)
const EnterpriseFooter = () => (
    <footer style={appStyles.footer}>
        <p style={appStyles.footerBranding}>Satly © 2025</p>
        <p style={appStyles.footerText}>Impulsado por ⚡ Lightning Network.</p>
    </footer>
);


function App() {
    const [activeQuizId, setActiveQuizId] = useState(null);

    const handleStartQuiz = (quizId) => {
        setActiveQuizId(quizId);
    };

    const handleGoBack = () => {
        setActiveQuizId(null);
    };

    return (
        // Contenedor principal ajustado para Pantalla Completa y BOLD
        <div style={appStyles.fullScreenContainer}>

            {/* HEADER MINIMALISTA: Centrado y con línea de Negro fuerte */}
            <header style={appStyles.header}>
                <h1 style={appStyles.headerTitle}>Satly ⚡</h1>
            </header>

            <main style={appStyles.mainContent}>

                {activeQuizId ? (
                    // Vista 2: Sesión del Quiz
                    <QuizSession quizId={activeQuizId} onQuizFinish={handleGoBack} />
                ) : (
                    // Vista 1: Lista de Quizzes (Menú)
                    <QuizList onStartQuiz={handleStartQuiz} />
                )}

            </main>

            <EnterpriseFooter />

        </div>
    );
}

const appStyles = {
    // Estilos CRÍTICOS para Pantalla Completa
    fullScreenContainer: {
        width: '100vw',
        minHeight: '100vh',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        backgroundColor: '#FAFAFA', // Fondo muy claro
        fontFamily: 'Roboto, Arial, sans-serif',
        fontWeight: 'normal',
        display: 'flex',
        flexDirection: 'column',
    },
    // HEADER MINIMALISTA BOLD
    header: {
        backgroundColor: '#1C1B1F', // Negro Primario
        padding: '25px 40px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        borderBottom: '5px solid #FFD700', // Dorado de acento
    },
    headerTitle: {
        color: '#FFD700', // Dorado en texto
        fontWeight: '900', // BOLD
        fontSize: '2.5em',
        margin: 0,
        letterSpacing: '-1px',
    },
    mainContent: {
        flexGrow: 1,
        padding: '32px 30px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
    },
    // FOOTER MINIMALISTA BOLD
    footer: {
        backgroundColor: '#1C1B1F', // Negro Primario
        padding: '15px 30px',
        textAlign: 'center',
        borderTop: '3px solid #FFD700', // Dorado de acento
        color: '#FFFFFF',
        fontWeight: '900',
    },
    footerBranding: {
        fontSize: '1.2em',
        color: '#FFD700', // Dorado
        marginBottom: '5px',
    },
    footerText: {
        margin: 0,
        fontSize: '0.8em',
        color: '#AAAAAA',
        fontWeight: '700',
    }
};

export default App;