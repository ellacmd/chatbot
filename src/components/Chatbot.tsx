import { FaRobot } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { FaArrowUp, FaMicrophone } from 'react-icons/fa6';
import { FaRegStopCircle } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { HiSpeakerWave } from 'react-icons/hi2';
import { predefinedResponses, fallbackResponses } from '../constants';
import Fuse from 'fuse.js';

interface ChatBotProps {
    closeChatBot: () => void;
}
interface Message {
    sender: 'user' | 'ai';
    text: string;
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

    const lastMessageRef = useRef<HTMLDivElement | null>(null);
    const recognitionRef = useRef<any>(null);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    useEffect(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        } else {
            setMessages([
                {
                    sender: 'ai',
                    text: "Hello! I'm  your personal assistant. Feel free to ask me about Emmanuella's work or programming tips. What can I help you with today?",
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

        const formattedInput =
            userInput.charAt(0).toUpperCase() +
            userInput.slice(1).toLowerCase();

        setUserInput('');
        setIsLoading(true);

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'user', text: formattedInput },
        ]);

        const answer = findAnswer(userInput);
        if (answer) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'ai', text: answer },
            ]);
            setIsLoading(false);
            return;
        }

        const conversationHistory = messages.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
        }));
        conversationHistory.push({
            role: 'user',
            content: formattedInput,
        });

        try {
            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: `You are an AI assistant that provides detailed answers about Emmanuella and programming.Emmanuella is a skilled frontend developer specializing in React, Angular, TypeScript, and modern web technologies. She has built projects like an admin panel in Angular and a React-based portfolio.She loves to play chess and CODM in her spare time. she has worked with startups around the globe
                                When answering, provide clear, structured, and informative responses. If a question is unrelated, politely redirect to relevant topics.`,
                            },
                            ...conversationHistory,

                            { role: 'user', content: userInput },
                        ],
                        max_tokens: 150,
                    }),
                }
            );
            const data = await response.json();
            const aiMessage = data.choices[0].message.content.trim();

            const isOffTopic =
                !aiMessage || aiMessage.toLowerCase().includes("i'm sorry");
            const finalResponse = isOffTopic
                ? fallbackResponses[
                      Math.floor(Math.random() * fallbackResponses.length)
                  ]
                : aiMessage;

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: 'ai', text: finalResponse },
            ]);
        } catch (error) {
            setError(`Error fetching AI response, ${error}`);
        } finally {
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

    return (
        <div className='right-6 w-100 h-[90vh] rounded-b-xl  shadow-lg flex flex-col relative '>
            <div className='flex justify-between bg-[#FF4081] text-white p-6 rounded-t-xl'>
                <FaRobot />

                <h1>EllaGPT</h1>

                <button onClick={closeChatBot} className='cursor-pointer'>
                    {' '}
                    <IoMdClose />
                </button>
            </div>
            <div className='  p-6 bg-[#F3E5F5] overflow-scroll flex-1 rounded-b-xl  space-y-4 mb-14'>
                {messages.map((message, index) => (
                    <div key={index} className='flex flex-col'>
                        <div
                            className={`chat-bubble-${message.sender} ${
                                message.sender === 'user'
                                    ? 'bg-[#FF4081] text-white self-end'
                                    : 'bg-[#aaaaaa] text-white self-start'
                            } px-2 py-1 rounded-xl max-w-[90%]`}>
                            <p>{message.text}</p>
                            {message.sender !== 'user' && (
                                <button
                                    className='cursor-pointer'
                                    onClick={() =>
                                        handleSpeaking(message.text, index)
                                    }>
                                    {currentlySpeakingId === index ? (
                                        <FaRegStopCircle fill='#FF4081' />
                                    ) : (
                                        <HiSpeakerWave fill='#FF4081' />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className='chat-bubble-bot bg-[#aaaaaa] text-white px-2 py-1 rounded-xl max-w-[70%] self-start'>
                        <div className='animate-pulse'>
                            <span className=' w-2 h-2 bg-white rounded-full inline-block mr-1'></span>
                            <span className=' w-2 h-2 bg-white rounded-full inline-block mr-1'></span>
                            <span className=' w-2 h-2 bg-white rounded-full inline-block'></span>
                        </div>
                    </div>
                )}{' '}
                {error && <code className='text-red-400'>{error}</code>}
                <div ref={lastMessageRef} />
            </div>
            <div className='flex items-center space-x-3 mt-4  fixed bottom-6 bg-[#aaaaaa] w-100 py-2 px-4'>
                <input
                    type='text'
                    placeholder='Ask me anything!'
                    className=' w-full bg-[#F3E5F5] p-3 rounded-xl border border-gray-300 text-sm focus:outline-none'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setUserInput(e.target.value);
                    }}
                    value={userInput}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />{' '}
                <button
                    className={`p-3 rounded-full text-white ${
                        isListening ? 'bg-green-500' : 'bg-gray-500'
                    } cursor-pointer`}
                    onClick={handleListening}>
                    <FaMicrophone />
                </button>
                <button
                    className='bg-[#FF4081] rounded-full p-3 text-white cursor-pointer disabled:cursor-not-allowed disabled:bg-[#ff85ae]'
                    disabled={!userInput || isLoading}
                    onClick={handleSendMessage}>
                    <FaArrowUp />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
