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

    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const recognitionRef = useRef<any>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    const analyticsService = AnalyticsService.getInstance();

    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
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
                    text: "Hello! I'm your personal assistant. Feel free to ask me about Emmanuella's work or programming tips. What can I help you with today?",
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
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load voices when component mounts
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log(
                'Available voices:',
                voices.map((v) => v.name)
            );
        };

        // Load voices immediately if available
        loadVoices();

        // Also listen for voiceschanged event
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener(
                'voiceschanged',
                loadVoices
            );
        };
    }, []);

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
            recognitionRef.current.lang = 'en-US';
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
    }, []);

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
                analyticsService.recordMessage('en', Date.now() - startTime);
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
                analyticsService.recordMessage('en', Date.now() - startTime);
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
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        utterance.volume = 1;

        const getFemaleVoice = () => {
            const voices = window.speechSynthesis.getVoices();

            // More comprehensive female voice detection
            return voices.find(
                (voice) =>
                    voice.name.includes('Samantha') ||
                    voice.name.includes('Victoria') ||
                    voice.name.includes('Karen') ||
                    voice.name.includes('Tessa') ||
                    voice.name.includes('Google UK English Female') ||
                    voice.name.includes('Google US English Female') ||
                    voice.name.includes('Microsoft Zira') ||
                    voice.name.includes('Microsoft Eva') ||
                    voice.name.includes('Microsoft Aria') ||
                    voice.name.includes('Female') ||
                    voice.name.toLowerCase().includes('woman') ||
                    voice.name.toLowerCase().includes('girl') ||
                    (voice.name.includes('Alex') &&
                        voice.name.includes('Female')) ||
                    voice.name.includes('Siri') ||
                    voice.name.includes('Cortana')
            );
        };

        const femaleVoice = getFemaleVoice();

        if (femaleVoice) {
            utterance.voice = femaleVoice;
            console.log('Using female voice:', femaleVoice.name);
        } else {
            // If no female voice found, try to use a higher pitch to simulate female voice
            utterance.pitch = 1.4;
            console.log('No female voice found, using higher pitch');
        }

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
            language: 'en',
        });
    };

    return (
        <div className='fixed bottom-4 right-4 left-4 md:left-auto md:w-96 md:right-8 h-[80vh] md:h-[600px] bg-white rounded-lg shadow-lg flex flex-col z-50'>
            <div className='bg-[#FF4081] text-white p-3 md:p-4 rounded-t-lg flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <FaRobot className='w-5 h-5 md:w-6 md:h-6' />
                    <h2 className='text-base md:text-lg font-semibold'>
                        Portfolio Assistant
                    </h2>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={closeChatBot}
                        className='hover:opacity-80 p-1'>
                        <IoMdClose className='w-5 h-5 md:w-6 md:h-6' />
                    </button>
                </div>
            </div>

            <div className='flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4'>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.sender === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        }`}>
                        <div
                            className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
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
                                <span className='text-xs'>
                                    {formatTimestamp(message.timestamp)}
                                </span>
                                {message.sender === 'ai' && (
                                    <button
                                        onClick={() =>
                                            handleSpeaking(message.text, index)
                                        }
                                        className='ml-2 hover:opacity-80 p-1'>
                                        {currentlySpeakingId === index ? (
                                            <FaRegStopCircle className='w-3 h-3 md:w-4 md:h-4' />
                                        ) : (
                                            <HiSpeakerWave className='w-3 h-3 md:w-4 md:h-4' />
                                        )}
                                    </button>
                                )}
                            </div>
                            {message.sender === 'ai' && (
                                <Feedback
                                    messageId={index}
                                    onFeedback={handleFeedback}
                                />
                            )}
                        </div>
                    </div>
                ))}
                {showTypingIndicator && (
                    <div className='flex justify-start'>
                        <div className='bg-gray-100 rounded-lg p-2 md:p-3'>
                            <div className='flex space-x-1 md:space-x-2'>
                                <div className='w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce' />
                                <div className='w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce delay-100' />
                                <div className='w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce delay-200' />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={lastMessageRef} />
            </div>

            {messages.length === 1 && (
                <div className='p-3 md:p-4 border-t'>
                    <h3 className='text-xs md:text-sm font-semibold mb-2'>
                        Suggested Questions:
                    </h3>
                    <div className='flex flex-wrap gap-1 md:gap-2'>
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    handleSuggestedQuestion(question)
                                }
                                className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 md:px-3 rounded-full transition-colors'>
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className='p-3 md:p-4 border-t'>
                <div className='flex items-center gap-2'>
                    <input
                        type='text'
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' && handleSendMessage()
                        }
                        placeholder='Type your message...'
                        className='flex-1 p-2 md:p-2 text-sm md:text-base border rounded-lg focus:outline-none focus:border-[#FF4081]'
                    />
                    <button
                        onClick={handleListening}
                        className={`p-2 rounded-lg ${
                            isListening
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isListening ? (
                            <FaRegStopCircle className='w-4 h-4 md:w-5 md:h-5' />
                        ) : (
                            <FaMicrophone className='w-4 h-4 md:w-5 md:h-5' />
                        )}
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className='p-2 bg-[#FF4081] text-white rounded-lg hover:opacity-90 disabled:opacity-50'>
                        <FaArrowUp className='w-4 h-4 md:w-5 md:h-5' />
                    </button>
                </div>
                {error && (
                    <p className='text-red-500 text-xs md:text-sm mt-2'>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Chatbot;
