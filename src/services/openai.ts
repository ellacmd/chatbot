interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatResponse {
    message: string;
    isOffTopic: boolean;
}

export class OpenAIService {
    private apiKey: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    }

    async sendMessage(
        conversationHistory: ChatMessage[],
        userInput: string
    ): Promise<ChatResponse> {
        try {
            const response = await fetch(
                'https://api.openai.com/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: `You are an AI assistant that provides detailed answers about Emmanuella and programming. Emmanuella is a skilled frontend developer specializing in React, Angular, TypeScript, and modern web technologies. She has built projects like an admin panel in Angular and a React-based portfolio. She loves to play chess and CODM in her spare time. She has worked with startups around the globe. When answering, provide clear, structured, and informative responses. If a question is unrelated, politely redirect to relevant topics.`,
                            },
                            ...conversationHistory,
                            { role: 'user', content: userInput },
                        ],
                        max_tokens: 150,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content.trim();

            const isOffTopic =
                !aiMessage || aiMessage.toLowerCase().includes("i'm sorry");

            return {
                message: aiMessage,
                isOffTopic,
            };
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error(`Error fetching AI response: ${error}`);
        }
    }
}

export default new OpenAIService();
