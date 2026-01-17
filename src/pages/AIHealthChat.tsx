import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, Heart, Activity, Brain, Lightbulb, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import AnimatedTransition from '@/components/AnimatedTransition';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedCategories = [
  {
    icon: Heart,
    title: "Symptômes",
    color: "text-red-500",
    bg: "bg-red-500/10",
    questions: [
      "J'ai mal à la tête depuis ce matin",
      "Qu'est-ce que la fièvre signifie?",
      "Symptômes de la grippe"
    ]
  },
  {
    icon: Activity,
    title: "Rendez-vous",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    questions: [
      "Comment prendre rendez-vous?",
      "Trouver un cardiologue",
      "Médecin disponible aujourd'hui"
    ]
  },
  {
    icon: Brain,
    title: "Prévention",
    color: "text-green-500",
    bg: "bg-green-500/10",
    questions: [
      "Comment rester en bonne santé?",
      "Vaccination recommandée",
      "Conseils nutrition"
    ]
  },
  {
    icon: Lightbulb,
    title: "Informations",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    questions: [
      "Pharmacies de garde",
      "Urgences médicales",
      "Services disponibles"
    ]
  }
];

export default function AIHealthChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Bonjour! 👋 Je suis votre assistant santé virtuel CityHealth. Je peux vous aider avec:\n\n• Comprendre vos symptômes\n• Trouver des médecins spécialisés\n• Prendre des rendez-vous\n• Répondre à vos questions santé\n• Vous orienter vers les services adaptés\n\nComment puis-je vous aider aujourd\'hui?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-panel border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
                    <Bot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    Assistant Santé IA
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </h1>
                  <p className="text-sm text-muted-foreground">Toujours disponible pour vous aider</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En ligne
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatedTransition show={true} animation="fade">
              <Card className="glass-panel sticky top-24">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Questions fréquentes
                  </h2>
                  <div className="space-y-3">
                    {suggestedCategories.map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <Button
                          variant={selectedCategory === idx ? "default" : "outline"}
                          className={cn(
                            "w-full justify-start gap-2 transition-all duration-300",
                            selectedCategory === idx && "shadow-lg"
                          )}
                          onClick={() => setSelectedCategory(selectedCategory === idx ? null : idx)}
                        >
                          <category.icon className={cn("h-4 w-4", category.color)} />
                          {category.title}
                        </Button>
                        {selectedCategory === idx && (
                          <AnimatedTransition show={true} animation="fade">
                            <div className="pl-4 space-y-1">
                              {category.questions.map((question, qIdx) => (
                                <Button
                                  key={qIdx}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs hover:bg-primary/10 text-left h-auto py-2"
                                  onClick={() => {
                                    sendMessage(question);
                                    setSelectedCategory(null);
                                  }}
                                >
                                  {question}
                                </Button>
                              ))}
                            </div>
                          </AnimatedTransition>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>

            {/* Info Card */}
            <AnimatedTransition show={true} animation="fade">
              <Card className="glass-panel bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">À propos</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cet assistant utilise l'intelligence artificielle pour vous fournir des informations de santé fiables et vous orienter vers les bons professionnels.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Consultez toujours un médecin pour un diagnostic</span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedTransition>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="glass-panel h-[calc(100vh-200px)] flex flex-col">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <AnimatedTransition
                      key={index}
                      show={true}
                      animation="fade"
                    >
                      <div
                        className={cn(
                          "flex gap-3",
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md",
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
                              : 'bg-muted/50 rounded-bl-sm'
                          )}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          <p className={cn(
                            "text-xs mt-2",
                            message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {message.timestamp.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">Vous</span>
                          </div>
                        )}
                      </div>
                    </AnimatedTransition>
                  ))}
                  {isLoading && (
                    <AnimatedTransition show={true} animation="fade">
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted/50 rounded-2xl rounded-bl-sm p-4 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">L'assistant réfléchit...</span>
                          </div>
                        </div>
                      </div>
                    </AnimatedTransition>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question santé..."
                    disabled={isLoading}
                    className="flex-1 bg-background"
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Assistant virtuel - Consultez toujours un professionnel de santé
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
