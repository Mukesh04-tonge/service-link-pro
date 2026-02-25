import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

interface ChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ open, onOpenChange }) => {
    const { messages, isLoading, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue('');
        await sendMessage(message);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Sparkles className="h-6 w-6 text-primary" />
                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-semibold">Alpever AI</DialogTitle>
                                <p className="text-xs text-muted-foreground">Your Service Link Pro Assistant</p>
                            </div>
                        </div>

                    </div>
                </DialogHeader>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <MessageBubble key={index} message={message} />
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Alpever AI is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="px-6 py-4 border-t bg-background">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about Service Link Pro..."
                                className="pr-4 resize-none rounded-xl border-2 focus-visible:ring-primary/20"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Alpever AI can make mistakes. Verify important information.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
            {/* Avatar */}
            <div
                className={cn(
                    'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                )}
            >
                {isUser ? 'You' : <Sparkles className="h-4 w-4" />}
            </div>

            {/* Message Content */}
            <div className={cn('flex-1 max-w-[80%]', isUser && 'flex flex-col items-end')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3 shadow-sm',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                    )}
                >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </div>
    );
};
