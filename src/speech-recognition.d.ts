// src/speech-recognition.d.ts

interface Window {
    SpeechRecognition: typeof SpeechRecognition | undefined;
    webkitSpeechRecognition: typeof webkitSpeechRecognition | undefined;
}