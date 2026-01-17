import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Loader2, Bot, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Comment prendre rendez-vous?",
  "Trouver un cardiologue",
  "Symptômes de la grippe",
  "Pharmacies de garde"
];

export const AIHealthAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour! Je suis votre assistant santé virtuel CityHealth. Je peux vous aider à trouver des médecins, comprendre vos symptômes, ou répondre à vos questions sur la santé. Comment puis-je vous aider?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const { streamChat } = await import('@/services/aiChatService');
      
      await streamChat({
        messages: messages.concat(userMessage).map(m => ({
          role: m.role,
          content: m.content,
        })),
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === 'assistant') {
              return prev.map((m, i) => 
                i === prev.length - 1 
                  ? { ...m, content: assistantContent }
                  : m
              );
            }
            return [...prev, {
              role: 'assistant',
              content: assistantContent,
              timestamp: new Date(),
            }];
          });
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          toast.error(error.message);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error('Erreur lors de l\'envoi du message');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-16 px-6 rounded-full shadow-2xl z-50 bg-gradient-to-r from-primary to-secondary hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group"
        aria-label="Ouvrir l'assistant santé IA"
      >
        <div className="relative">
          <Bot className="h-6 w-6 mr-2" />
          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </div>
        <span className="font-semibold">Assistant IA</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 shadow-2xl z-50 flex flex-col transition-all duration-300",
      isMinimized ? "w-80 h-16" : "w-[420px] h-[650px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary text-primary-foreground cursor-pointer"
           onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              Assistant Santé IA
              <Sparkles className="h-4 w-4 text-yellow-300" />
            </h3>
            <p className="text-xs opacity-90">Toujours disponible pour vous aider</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform", isMinimized && "rotate-180")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl p-4 shadow-sm",
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    )}
                  >
                    {message.role === 'assistant' && index > 0 && (
                      <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                        <Bot className="h-3 w-3" />
                        <span>Assistant IA</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-muted rounded-2xl rounded-bl-sm p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">L'assistant réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Questions suggérées:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    className="text-xs h-auto py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question santé..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Assistant virtuel - Consultez toujours un professionnel
            </p>
          </div>
        </>
      )}
    </Card>
  );
};
