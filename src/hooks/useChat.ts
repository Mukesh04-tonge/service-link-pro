import { useState } from 'react';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: "Hi! I'm Alpever AI, your assistant for Service Link Pro. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (message: string) => {
        if (!message.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Prepare conversation history (exclude the welcome message)
            const conversationHistory = messages
                .filter(msg => msg.role === 'user' || msg.content !== "Hi! I'm Alpever AI, your assistant for Service Link Pro. How can I help you today?")
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    conversationHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            const data = await response.json();

            // Add AI response
            const aiMessage: ChatMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
            setError(errorMessage);

            // Add error message to chat
            const errorMsg: ChatMessage = {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${errorMessage}. Please try again or contact support@alpever.space.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([
            {
                role: 'assistant',
                content: "Hi! I'm Alpever AI, your assistant for Service Link Pro. How can I help you today?",
                timestamp: new Date()
            }
        ]);
        setError(null);
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages
    };
};
