import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { ChatDialog } from './ChatDialog';
import { cn } from '@/lib/utils';

export const FloatingChatButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={cn(
                        'h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out',
                        'bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90',
                        'hover:scale-110 hover:shadow-xl',
                        'relative overflow-hidden group',
                        isOpen && 'scale-95'
                    )}
                    size="icon"
                >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Icon with animation */}
                    <div className="relative z-10 transition-transform duration-300">
                        {isOpen ? (
                            <X className="h-6 w-6 text-primary-foreground" />
                        ) : (
                            <MessageCircle className="h-6 w-6 text-primary-foreground" />
                        )}
                    </div>

                    {/* Pulse effect */}
                    {!isOpen && (
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    )}

                    {/* Sparkle indicator */}
                    <div className={cn(
                        'absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background',
                        'flex items-center justify-center transition-all duration-300',
                        isHovered && 'scale-110'
                    )}>
                        <Sparkles className="h-2.5 w-2.5 text-white" />
                    </div>
                </Button>

                {/* Tooltip */}
                <div
                    className={cn(
                        'absolute bottom-full right-0 mb-2 px-3 py-2 bg-popover text-popover-foreground',
                        'rounded-lg shadow-lg text-sm font-medium whitespace-nowrap',
                        'transition-all duration-200 pointer-events-none',
                        'border border-border',
                        isHovered && !isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    )}
                >
                    Need help? Ask Alpever AI
                    <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-popover" />
                </div>
            </div>

            {/* Chat Dialog */}
            <ChatDialog open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
};
