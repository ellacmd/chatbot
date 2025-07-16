import { FaRobot } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { FaArrowUp, FaMicrophone } from 'react-icons/fa6';
import { FaRegStopCircle } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { HiSpeakerWave } from 'react-icons/hi2';
import {
    predefinedResponses,
    fallbackResponses,
    suggestedQuestions,
} from '../constants';
import { languages, translations } from '../constants/languages';
import Fuse from 'fuse.js';
import ReactMarkdown from 'react-markdown';
import Feedback from './Feedback';
import AnalyticsService from '../services/analytics';
import openAIService from '../services/openai';

interface ChatBotProps {
    closeChatBot: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    feedback?: boolean;
}

const Chatbot: React.FC<ChatBotProps> = ({ closeChatBot }) => {
    const [userInput, setUserInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isListening, setIsListening] = useState<boolean>(false);
    const [currentlySpeakingId, setCurrentlySpeakingId] = useState<
        number | null
    >(null);
    const [showTypingIndicator, setShowTypingIndicator] =
        useState<boolean>(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [showLanguageSelector, setShowLanguageSelector] =
        useState<boolean>(false);

    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    const analyticsService = AnalyticsService.getInstance();

    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) {
            setSelectedLanguage(savedLanguage);
        }
        if (savedMessages) {
            // Convert string dates back to Date objects
            const parsedMessages = JSON.parse(savedMessages).map(
                (msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                })
            );
            setMessages(parsedMessages);
        } else {
            setMessages([
                {
                    sender: 'ai',
                    text: translations[
                        selectedLanguage as keyof typeof translations
                    ].welcome,
                    timestamp: new Date(),
                },
            ]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('selectedLanguage', selectedLanguage);
    }, [selectedLanguage]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (
            !('webkitSpeechRecognition' in window) &&
            !('SpeechRecognition' in window)
        ) {
            alert('Your browser does not support speech recognition.');
            return;
        }

        recognitionRef.current = new (window.SpeechRecognition ||
            window.webkitSpeechRecognition)();

        if (recognitionRef.current) {
            recognitionRef.current.lang = selectedLanguage;
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, [selectedLanguage]);

    const fuse = new Fuse(
        Object.keys(predefinedResponses).map((question) => ({
            question: question,
            response: predefinedResponses[question],
        })),
        { includeScore: true, keys: ['question'] }
    );

    const findAnswer = (userInput: string): string | null => {
        const result = fuse.search(userInput.toLowerCase());
        return result.length && result[0].score! < 0.3
            ? result[0].item.response
            : null;
    };

    const handleSendMessage = async (): Promise<void> => {
        if (!userInput.trim()) return;
        setError('');

        const startTime = Date.now();
        const formattedInput =
            userInput.charAt(0).toUpperCase() +
            userInput.slice(1).toLowerCase();
        setUserInput('');
        setIsLoading(true);
        setShowTypingIndicator(true);

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text: formattedInput, timestamp: new Date() },
        ]);

        const answer = findAnswer(userInput);
        if (answer) {
            // Simulate typing delay
            typingTimeoutRef.current = setTimeout(() => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'ai', text: answer, timestamp: new Date() },
                ]);
                setShowTypingIndicator(false);
                setIsLoading(false);
                analyticsService.recordMessage(
                    selectedLanguage,
                    Date.now() - startTime
                );
            }, 1000);
            return;
        }

        const conversationHistory = messages.map((msg) => ({
            role: (msg.sender === 'user' ? 'user' : 'assistant') as
                | 'user'
                | 'assistant',
            content: msg.text,
        }));
        conversationHistory.push({
            role: 'user',
            content: formattedInput,
        });

        try {
            const { message: aiMessage, isOffTopic } =
                await openAIService.sendMessage(conversationHistory, userInput);

            const finalResponse = isOffTopic
                ? fallbackResponses[
                      Math.floor(Math.random() * fallbackResponses.length)
                  ]
                : aiMessage;

            // Simulate typing delay
            typingTimeoutRef.current = setTimeout(() => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: 'ai',
                        text: finalResponse,
                        timestamp: new Date(),
                    },
                ]);
                setShowTypingIndicator(false);
                setIsLoading(false);
                analyticsService.recordMessage(
                    selectedLanguage,
                    Date.now() - startTime
                );
            }, 1000);
        } catch (error) {
            setError(`Error fetching AI response, ${error}`);
            setShowTypingIndicator(false);
            setIsLoading(false);
        }
    };

    const handleListening = (): void => {
        if (recognitionRef.current) {
            if (isListening) {
                recognitionRef.current.stop();
                setIsListening(false);
            } else {
                recognitionRef.current.start();
            }
        }
    };

    const handleSpeaking = (text: string, messageId: number): void => {
        if (!('speechSynthesis' in window)) {
            alert('Your browser does not support text-to-speech.');
        }

        if (currentlySpeakingId === messageId) {
            window.speechSynthesis.cancel();
            setCurrentlySpeakingId(null);
            return;
        }

        if (currentlySpeakingId !== null) {
            window.speechSynthesis.cancel();
            setCurrentlySpeakingId(null);
            setTimeout(() => {
                speakText(text, messageId);
            }, 100);
            return;
        }

        speakText(text, messageId);
    };

    const speakText = (text: string, messageId: number) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(
            (voice) =>
                voice.name.includes('Female') ||
                voice.name.includes('Google US English')
        );
        utterance.voice = femaleVoice || voices[0];

        utterance.onend = () => {
            setCurrentlySpeakingId(null);
        };

        utterance.onerror = () => {
            setCurrentlySpeakingId(null);
        };

        window.speechSynthesis.speak(utterance);
        setCurrentlySpeakingId(messageId);
    };

    const formatTimestamp = (date: Date): string => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            }).format(new Date(date));
        } catch (error) {
            console.error('Error formatting timestamp:', error);
            return '';
        }
    };

    const handleSuggestedQuestion = (question: string): void => {
        setUserInput(question);
        handleSendMessage();
    };

    const handleFeedback = (messageId: number, isHelpful: boolean) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg, index) =>
                index === messageId ? { ...msg, feedback: isHelpful } : msg
            )
        );

        analyticsService.recordFeedback({
            messageId,
            isHelpful,
            timestamp: new Date(),
            language: selectedLanguage,
        });
    };

    const handleLanguageChange = (languageCode: string) => {
        setSelectedLanguage(languageCode);
        setShowLanguageSelector(false);
    };

    return (
        <div className='fixed bottom-6 right-8 w-96 h-[600px] bg-white rounded-lg shadow-lg flex flex-col'>
            <div className='bg-[#FF4081] text-white p-4 rounded-t-lg flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <FaRobot className='w-6 h-6' />
                    <h2 className='text-lg font-semibold'>
                        Portfolio Assistant
                    </h2>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() =>
                            setShowLanguageSelector(!showLanguageSelector)
                        }
                        className='hover:opacity-80'>
                        {
                            languages.find(
                                (lang) => lang.code === selectedLanguage
                            )?.flag
                        }
                    </button>
                    <button onClick={closeChatBot} className='hover:opacity-80'>
                        <IoMdClose className='w-6 h-6' />
                    </button>
                </div>
            </div>

            {showLanguageSelector && (
                <div className='absolute top-12 right-4 bg-white rounded-lg shadow-lg p-2 z-10'>
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageChange(language.code)}
                            className={`flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100 ${
                                selectedLanguage === language.code
                                    ? 'bg-gray-100'
                                    : ''
                            }`}>
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.sender === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        }`}>
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender === 'user'
                                    ? 'bg-[#FF4081] text-white'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => (
                                        <p
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h1: ({ node, ...props }) => (
                                        <h1
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h5: ({ node, ...props }) => (
                                        <h5
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    h6: ({ node, ...props }) => (
                                        <h6
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, ...props }) => (
                                        <code
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                    pre: ({ node, ...props }) => (
                                        <pre
                                            className='prose prose-sm'
                                            {...props}
                                        />
                                    ),
                                }}>
                                {message.text}
                            </ReactMarkdown>
                            <div className='flex items-center justify-between mt-2 text-xs opacity-70'>
                                <span>
                                    {formatTimestamp(message.timestamp)}
                                </span>
                                {message.sender === 'ai' && (
                                    <button
                                        onClick={() =>
                                            handleSpeaking(message.text, index)
                                        }
                                        className='ml-2 hover:opacity-80'>
                                        {currentlySpeakingId === index ? (
                                            <FaRegStopCircle className='w-4 h-4' />
                                        ) : (
                                            <HiSpeakerWave className='w-4 h-4' />
                                        )}
                                    </button>
                                )}
                            </div>
                            {message.sender === 'ai' && (
                                <Feedback
                                    messageId={index}
                                    onFeedback={handleFeedback}
                                    language={selectedLanguage}
                                />
                            )}
                        </div>
                    </div>
                ))}
                {showTypingIndicator && (
                    <div className='flex justify-start'>
                        <div className='bg-gray-100 rounded-lg p-3'>
                            <div className='flex space-x-2'>
                                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100' />
                                <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200' />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={lastMessageRef} />
            </div>

            {messages.length === 1 && (
                <div className='p-4 border-t'>
                    <h3 className='text-sm font-semibold mb-2'>
                        {
                            translations[
                                selectedLanguage as keyof typeof translations
                            ].suggestedQuestions
                        }
                        :
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    handleSuggestedQuestion(question)
                                }
                                className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors'>
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className='p-4 border-t'>
                <div className='flex items-center gap-2'>
                    <input
                        type='text'
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' && handleSendMessage()
                        }
                        placeholder={
                            translations[
                                selectedLanguage as keyof typeof translations
                            ].typeMessage
                        }
                        className='flex-1 p-2 border rounded-lg focus:outline-none focus:border-[#FF4081]'
                    />
                    <button
                        onClick={handleListening}
                        className={`p-2 rounded-lg ${
                            isListening
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isListening ? (
                            <FaRegStopCircle className='w-5 h-5' />
                        ) : (
                            <FaMicrophone className='w-5 h-5' />
                        )}
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className='p-2 bg-[#FF4081] text-white rounded-lg hover:opacity-90 disabled:opacity-50'>
                        <FaArrowUp className='w-5 h-5' />
                    </button>
                </div>
                {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
            </div>
        </div>
    );
};

export default Chatbot;
