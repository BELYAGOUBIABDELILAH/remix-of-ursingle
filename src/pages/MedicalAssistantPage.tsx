import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Bot, MessageCircle, BookOpen, Calendar,
  AlertTriangle, Phone, MapPin, Sparkles, Activity,
  Thermometer, Pill, Heart, Brain, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/components/medical-assistant/ChatMessage";
import { TypingIndicator } from "@/components/medical-assistant/TypingIndicator";
import { EnhancedInput } from "@/components/medical-assistant/EnhancedInput";
import { SuggestedQuestions } from "@/components/medical-assistant/SuggestedQuestions";
import { HealthTipsGrid } from "@/components/medical-assistant/HealthTipsGrid";
import { ReminderCalendar } from "@/components/medical-assistant/ReminderCalendar";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

const EMERGENCY_KEYWORDS = {
  fr: ["urgence", "crise cardiaque", "accident", "hémorragie", "inconscient", "respire plus", "étouffement", "suicide"],
  ar: ["طوارئ", "نوبة قلبية", "حادث", "نزيف", "فاقد الوعي", "اختناق", "انتحار"],
  en: ["emergency", "heart attack", "accident", "bleeding", "unconscious", "not breathing", "choking", "suicide"]
};

const SUGGESTED_CATEGORIES = [
  {
    icon: Thermometer,
    title: { fr: "Symptômes courants", ar: "الأعراض الشائعة", en: "Common symptoms" },
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    questions: {
      fr: ["J'ai mal à la tête depuis ce matin", "J'ai de la fièvre, que faire?", "Je tousse beaucoup"],
      ar: ["عندي صداع منذ الصباح", "عندي حمى، ماذا أفعل؟", "أسعل كثيراً"],
      en: ["I've had a headache since morning", "I have a fever, what to do?", "I'm coughing a lot"]
    }
  },
  {
    icon: Heart,
    title: { fr: "Premiers secours", ar: "الإسعافات الأولية", en: "First aid" },
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    questions: {
      fr: ["Comment traiter une brûlure légère?", "Que faire en cas d'étouffement?", "Comment arrêter un saignement?"],
      ar: ["كيف أعالج حرقاً خفيفاً؟", "ماذا أفعل في حالة الاختناق؟", "كيف أوقف النزيف؟"],
      en: ["How to treat a minor burn?", "What to do if someone is choking?", "How to stop bleeding?"]
    }
  },
  {
    icon: Pill,
    title: { fr: "Médicaments", ar: "الأدوية", en: "Medications" },
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    questions: {
      fr: ["Comment prendre du paracétamol?", "Effets secondaires des antibiotiques?", "Interactions médicamenteuses?"],
      ar: ["كيف آخذ الباراسيتامول؟", "الآثار الجانبية للمضادات الحيوية؟", "التفاعلات الدوائية؟"],
      en: ["How to take paracetamol?", "Antibiotic side effects?", "Drug interactions?"]
    }
  },
  {
    icon: Shield,
    title: { fr: "Prévention", ar: "الوقاية", en: "Prevention" },
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    questions: {
      fr: ["Comment renforcer mon immunité?", "Quand faire un check-up?", "Vaccins recommandés?"],
      ar: ["كيف أقوي مناعتي؟", "متى أجري فحصاً طبياً؟", "اللقاحات الموصى بها؟"],
      en: ["How to boost my immunity?", "When to get a check-up?", "Recommended vaccines?"]
    }
  },
  {
    icon: Brain,
    title: { fr: "Santé mentale", ar: "الصحة النفسية", en: "Mental health" },
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    questions: {
      fr: ["Comment gérer le stress?", "Techniques de relaxation?", "Signes de dépression?"],
      ar: ["كيف أتعامل مع التوتر؟", "تقنيات الاسترخاء؟", "علامات الاكتئاب؟"],
      en: ["How to manage stress?", "Relaxation techniques?", "Signs of depression?"]
    }
  }
];

export default function MedicalAssistantPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = useMemo(() => {
    const translations = {
      fr: {
        title: "Assistant Médical IA",
        subtitle: "Votre compagnon santé 24/7",
        online: "En ligne",
        stats: "10k+ réponses",
        disclaimer: "Important : Cet assistant ne remplace pas un professionnel de santé. En cas d'urgence, appelez le 15 (SAMU).",
        emergencyTitle: "Urgence détectée",
        emergencyDesc: "Si vous êtes en situation d'urgence, contactez immédiatement les secours.",
        callEmergency: "Appeler le 15",
        findFacility: "Trouver un hôpital",
        tabs: { chat: "Discussion", tips: "Conseils", reminders: "Rappels" },
        categories: "Questions fréquentes",
        welcome: "Bonjour ! 👋 Je suis votre assistant santé virtuel. Je peux vous aider à comprendre vos symptômes, obtenir des conseils de premiers secours et trouver des informations médicales. Comment puis-je vous aider ?",
        placeholder: "Décrivez vos symptômes ou posez une question..."
      },
      ar: {
        title: "المساعد الطبي الذكي",
        subtitle: "رفيقك الصحي 24/7",
        online: "متصل",
        stats: "+10k إجابة",
        disclaimer: "هام: هذا المساعد لا يحل محل المتخصص الصحي. في حالة الطوارئ، اتصل بالإسعاف.",
        emergencyTitle: "تم اكتشاف حالة طوارئ",
        emergencyDesc: "إذا كنت في حالة طوارئ، اتصل بالإسعاف فوراً.",
        callEmergency: "اتصل بالإسعاف",
        findFacility: "ابحث عن مستشفى",
        tabs: { chat: "المحادثة", tips: "النصائح", reminders: "التذكيرات" },
        categories: "الأسئلة الشائعة",
        welcome: "مرحباً! 👋 أنا مساعدك الصحي الافتراضي. يمكنني مساعدتك في فهم أعراضك والحصول على نصائح الإسعافات الأولية. كيف يمكنني مساعدتك؟",
        placeholder: "صف أعراضك أو اطرح سؤالاً..."
      },
      en: {
        title: "AI Medical Assistant",
        subtitle: "Your 24/7 health companion",
        online: "Online",
        stats: "10k+ answers",
        disclaimer: "Important: This assistant does not replace a healthcare professional. In case of emergency, call emergency services.",
        emergencyTitle: "Emergency detected",
        emergencyDesc: "If you are in an emergency, contact emergency services immediately.",
        callEmergency: "Call Emergency",
        findFacility: "Find hospital",
        tabs: { chat: "Chat", tips: "Tips", reminders: "Reminders" },
        categories: "Frequently Asked",
        welcome: "Hello! 👋 I'm your virtual health assistant. I can help you understand your symptoms, get first aid advice, and find medical information. How can I help you?",
        placeholder: "Describe your symptoms or ask a question..."
      }
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: t.welcome,
        timestamp: new Date()
      }]);
    }
  }, [t.welcome]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const checkForEmergency = useCallback((text: string): boolean => {
    const keywords = EMERGENCY_KEYWORDS[language as keyof typeof EMERGENCY_KEYWORDS] || EMERGENCY_KEYWORDS.fr;
    return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  }, [language]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const isEmergency = checkForEmergency(textToSend);
    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
      isEmergency
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { streamChat } = await import("@/services/aiChatService");
      
      const systemPrompt = language === "ar" 
        ? "أنت مساعد صحي افتراضي. قدم معلومات دقيقة ومفيدة ولكن ذكّر دائماً المستخدم باستشارة طبيب."
        : language === "en"
        ? "You are a virtual health assistant. Provide accurate information but always remind users to consult a doctor."
        : "Tu es un assistant santé virtuel. Fournis des informations précises mais rappelle toujours de consulter un médecin.";

      let assistantContent = "";
      setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: new Date() }]);

      await streamChat({
        messages: [
          { role: "assistant", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: textToSend }
        ],
        onDelta: (delta) => {
          assistantContent += delta;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent
            };
            return updated;
          });
        },
        onDone: () => setIsLoading(false),
        onError: () => setIsLoading(false)
      });
    } catch {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, language, checkForEmergency]);

  const lastUserMessage = messages.filter(m => m.role === "user").pop();
  const showEmergencyAlert = lastUserMessage?.isEmergency;

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-background dark:from-teal-950/20 dark:via-cyan-950/10 dark:to-background",
      language === "ar" && "rtl"
    )}>
      {/* Animated Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className={cn("h-5 w-5", language === "ar" && "rotate-180")} />
              </Button>

              <div className="flex items-center gap-3">
                {/* Animated Bot Icon */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                  />
                </motion.div>

                <div>
                  <h1 className="font-bold text-lg flex items-center gap-2">
                    {t.title}
                    <Sparkles className="w-4 h-4 text-teal-500" />
                  </h1>
                  <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="hidden sm:flex items-center gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {t.online}
              </Badge>
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {t.stats}
              </Badge>
              <Button 
                variant="destructive" 
                size="sm"
                className="gap-1.5"
                onClick={() => window.location.href = "tel:15"}
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">15</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Disclaimer Banner */}
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            {t.disclaimer}
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.chat}</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.tips}</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.reminders}</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Accordion Categories */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="lg:col-span-1 order-2 lg:order-1"
              >
                <div className="sticky top-32 space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 px-1">
                    <Sparkles className="w-4 h-4 text-teal-500" />
                    {t.categories}
                  </h3>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {SUGGESTED_CATEGORIES.map((category, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`category-${index}`}
                        className="border rounded-xl px-3 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-transform",
                              category.bgColor
                            )}>
                              <category.icon className={cn("w-4 h-4", category.color)} />
                            </div>
                            <span className="text-sm font-medium">
                              {category.title[language as keyof typeof category.title] || category.title.fr}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1.5 pb-2">
                            {(category.questions[language as keyof typeof category.questions] || category.questions.fr).map((question, qIndex) => (
                              <motion.button
                                key={qIndex}
                                whileHover={{ x: 4 }}
                                onClick={() => sendMessage(question)}
                                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {question}
                              </motion.button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.aside>

              {/* Chat Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="lg:col-span-3 order-1 lg:order-2"
              >
                <div className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl shadow-teal-500/5">
                  {/* Emergency Alert */}
                  <AnimatePresence>
                    {showEmergencyAlert && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{t.emergencyTitle}</AlertTitle>
                          <AlertDescription className="mt-2">
                            {t.emergencyDesc}
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => window.location.href = "tel:15"}
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                {t.callEmergency}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate("/emergency")}
                              >
                                <MapPin className="w-4 h-4 mr-1" />
                                {t.findFacility}
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Messages Area */}
                  <ScrollArea className="h-[500px] p-6" ref={scrollRef as any}>
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {messages.map((message, index) => (
                          <ChatMessage
                            key={index}
                            role={message.role}
                            content={message.content}
                            timestamp={message.timestamp}
                            isEmergency={message.isEmergency}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Typing Indicator */}
                      {isLoading && messages[messages.length - 1]?.content === "" && (
                        <TypingIndicator />
                      )}

                      {/* Suggested Follow-ups */}
                      {messages.length > 1 && 
                       messages[messages.length - 1]?.role === "assistant" && 
                       messages[messages.length - 1]?.content && 
                       !isLoading && (
                        <SuggestedQuestions
                          questions={
                            SUGGESTED_CATEGORIES[0].questions[language as keyof typeof SUGGESTED_CATEGORIES[0]["questions"]] || 
                            SUGGESTED_CATEGORIES[0].questions.fr
                          }
                          onSelect={sendMessage}
                        />
                      )}
                    </div>
                  </ScrollArea>

                  {/* Enhanced Input */}
                  <div className="p-4 border-t bg-muted/30">
                    <EnhancedInput
                      value={input}
                      onChange={setInput}
                      onSend={() => sendMessage()}
                      isLoading={isLoading}
                      placeholder={t.placeholder}
                    />
                    <p className="text-[11px] text-center text-muted-foreground/60 mt-3">
                      ⚕️ Les informations fournies ne remplacent pas un avis médical professionnel
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <HealthTipsGrid language={language} />
            </motion.div>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ReminderCalendar language={language} isLoggedIn={false} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
