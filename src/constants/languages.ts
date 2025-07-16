export interface Language {
    code: string;
    name: string;
    flag: string;
}

export const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
];

export const translations = {
    en: {
        welcome:
            "Hello! I'm your personal assistant. Feel free to ask me about Emmanuella's work or programming tips. What can I help you with today?",
        typeMessage: 'Type your message...',
        suggestedQuestions: 'Suggested Questions:',
        send: 'Send',
        listening: 'Listening...',
        stopListening: 'Stop Listening',
        feedback: 'Was this response helpful?',
        yes: 'Yes',
        no: 'No',
        thanks: 'Thank you for your feedback!',
        error: 'Error',
        loading: 'Loading...',
    },
    es: {
        welcome:
            '¡Hola! Soy tu asistente personal. Pregúntame sobre el trabajo de Emmanuella o consejos de programación. ¿En qué puedo ayudarte hoy?',
        typeMessage: 'Escribe tu mensaje...',
        suggestedQuestions: 'Preguntas Sugeridas:',
        send: 'Enviar',
        listening: 'Escuchando...',
        stopListening: 'Detener Escucha',
        feedback: '¿Fue útil esta respuesta?',
        yes: 'Sí',
        no: 'No',
        thanks: '¡Gracias por tu comentario!',
        error: 'Error',
        loading: 'Cargando...',
    },
    // Add more languages as needed
};
