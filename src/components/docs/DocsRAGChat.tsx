import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  BookOpen, 
  Loader2,
  Bot,
  User,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: { title: string; link: string }[];
}

const SUGGESTED_QUESTIONS = [
  "Comment rechercher un médecin ?",
  "Comment fonctionne la vérification ?",
  "Quels sont les numéros d'urgence ?",
  "Comment s'inscrire comme professionnel ?",
];

// Placeholder responses - will be replaced with RAG
const getPlaceholderResponse = (question: string): { content: string; sources: { title: string; link: string }[] } => {
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('médecin') || lowerQ.includes('recherche')) {
    return {
      content: "Pour rechercher un médecin sur CityHealth :\n\n1. Utilisez la **barre de recherche** sur la page d'accueil\n2. Tapez une spécialité, un nom ou un symptôme\n3. Filtrez par **disponibilité**, **distance** ou **vérification**\n4. Consultez les profils et prenez rendez-vous\n\n💡 Activez la géolocalisation pour des résultats plus précis !",
      sources: [
        { title: "Rechercher un médecin", link: "/docs/citizens/search-provider" },
        { title: "Utiliser la carte", link: "/docs/citizens/use-map" }
      ]
    };
  }
  
  if (lowerQ.includes('vérification') || lowerQ.includes('badge')) {
    return {
      content: "Le **badge de vérification** ✅ garantit que le professionnel a été validé par notre équipe.\n\n**Processus de vérification :**\n- Vérification des diplômes\n- Contrôle du numéro d'ordre\n- Validation de l'identité\n\nLes praticiens vérifiés apparaissent en priorité dans les recherches.",
      sources: [
        { title: "Système de vérification", link: "/docs/providers/verification" }
      ]
    };
  }
  
  if (lowerQ.includes('urgence') || lowerQ.includes('numéro')) {
    return {
      content: "**Numéros d'urgence en Algérie :**\n\n| Service | Numéro |\n|---------|--------|\n| SAMU | 14 |\n| Police | 17 |\n| Protection Civile | 14 |\n| Gendarmerie | 1055 |\n\nSur CityHealth, accédez à la **carte des urgences** pour trouver l'établissement le plus proche.",
      sources: [
        { title: "Services d'urgence", link: "/docs/citizens/emergency" }
      ]
    };
  }
  
  if (lowerQ.includes('inscrire') || lowerQ.includes('professionnel')) {
    return {
      content: "Pour vous inscrire comme professionnel :\n\n1. Cliquez sur **\"Inscription Prestataire\"**\n2. Remplissez vos informations de base\n3. Téléchargez vos documents (diplômes, pièce d'identité)\n4. Attendez la validation (48h max)\n\nUne fois vérifié, vous obtenez le badge ✅ et votre profil devient visible.",
      sources: [
        { title: "S'inscrire comme professionnel", link: "/docs/providers/registration" },
        { title: "Compléter son profil", link: "/docs/providers/profile-setup" }
      ]
    };
  }
  
  return {
    content: "Je suis l'assistant documentation de CityHealth. Je peux vous aider à trouver des informations sur :\n\n- 🔍 La recherche de professionnels\n- 👨‍⚕️ L'inscription des praticiens\n- 🗺️ L'utilisation de la carte\n- 🚨 Les services d'urgence\n- ⚙️ Les paramètres du compte\n\n*Cette fonctionnalité RAG sera bientôt disponible pour des réponses plus précises !*",
    sources: [
      { title: "Documentation complète", link: "/docs" }
    ]
  };
};

export const DocsRAGChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const response = getPlaceholderResponse(messageText);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      sources: response.sources,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl",
          "bg-gradient-to-br from-primary via-primary to-primary/80",
          "text-primary-foreground",
          "hover:scale-105 active:scale-95 transition-transform",
          "hidden xl:flex items-center gap-2",
          isOpen && "opacity-0 pointer-events-none"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">Aide IA</span>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] rounded-2xl shadow-2xl border border-border overflow-hidden bg-background flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Assistant Documentation</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>En ligne</span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">
                        Beta
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-2xl bg-primary/10 mb-4"
                  >
                    <Sparkles className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h4 className="font-semibold mb-2">Comment puis-je vous aider ?</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Posez une question sur la documentation CityHealth
                  </p>
                  
                  {/* Suggested Questions */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-3 w-3" />
                      Questions suggérées
                    </p>
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSend(q)}
                        className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm group flex items-center justify-between"
                      >
                        <span>{q}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={cn(
                        "flex-1 max-w-[85%]",
                        message.role === 'user' && "flex flex-col items-end"
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 text-sm",
                          message.role === 'user'
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        
                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {message.sources.map((source, si) => (
                              <a
                                key={si}
                                href={source.link}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                              >
                                <BookOpen className="h-3 w-3" />
                                {source.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-background"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Propulsé par CityHealth AI • RAG bientôt disponible
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
