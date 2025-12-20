import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bot, Send, Loader2, Sparkles, Heart, Activity, Brain, Lightbulb, 
  MessageCircle, ArrowLeft, AlertTriangle, Phone, MapPin, Calendar,
  Pill, Thermometer, Stethoscope, BookOpen, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
}

// Emergency keywords detection
const EMERGENCY_KEYWORDS = {
  fr: ['douleur thoracique', 'poitrine', 'respirer', 'saignement', 'inconscient', 'crise cardiaque', 'avc', 'accident vasculaire', 'étouffer', 'empoisonnement', 'overdose', 'suicide', 'hémorragie'],
  ar: ['ألم في الصدر', 'نزيف', 'إغماء', 'نوبة قلبية', 'سكتة دماغية', 'تسمم', 'انتحار'],
  en: ['chest pain', 'breathing', 'bleeding', 'unconscious', 'heart attack', 'stroke', 'choking', 'poisoning', 'overdose', 'suicide', 'hemorrhage']
};

const SUGGESTED_CATEGORIES = [
  {
    id: 'symptoms',
    icon: Thermometer,
    title: { fr: 'Symptômes', ar: 'الأعراض', en: 'Symptoms' },
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    questions: {
      fr: [
        "J'ai mal à la tête depuis ce matin",
        "Quels sont les symptômes de la grippe?",
        "J'ai de la fièvre, que faire?"
      ],
      ar: [
        "أعاني من صداع منذ الصباح",
        "ما هي أعراض الإنفلونزا؟",
        "لدي حمى، ماذا أفعل؟"
      ],
      en: [
        "I've had a headache since this morning",
        "What are the symptoms of the flu?",
        "I have a fever, what should I do?"
      ]
    }
  },
  {
    id: 'firstaid',
    icon: Activity,
    title: { fr: 'Premiers secours', ar: 'الإسعافات الأولية', en: 'First Aid' },
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    questions: {
      fr: [
        "Comment traiter une brûlure légère?",
        "Que faire en cas de coupure?",
        "Comment réagir face à un évanouissement?"
      ],
      ar: [
        "كيفية علاج الحروق الخفيفة؟",
        "ماذا أفعل في حالة الجرح؟",
        "كيف أتصرف أمام الإغماء؟"
      ],
      en: [
        "How to treat a minor burn?",
        "What to do for a cut?",
        "How to react to fainting?"
      ]
    }
  },
  {
    id: 'medication',
    icon: Pill,
    title: { fr: 'Médicaments', ar: 'الأدوية', en: 'Medication' },
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    questions: {
      fr: [
        "Quand prendre du paracétamol?",
        "Effets secondaires des antibiotiques",
        "Peut-on mélanger certains médicaments?"
      ],
      ar: [
        "متى يجب تناول الباراسيتامول؟",
        "الآثار الجانبية للمضادات الحيوية",
        "هل يمكن خلط بعض الأدوية؟"
      ],
      en: [
        "When to take paracetamol?",
        "Antibiotic side effects",
        "Can certain medications be mixed?"
      ]
    }
  },
  {
    id: 'prevention',
    icon: Shield,
    title: { fr: 'Prévention', ar: 'الوقاية', en: 'Prevention' },
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    questions: {
      fr: [
        "Comment renforcer mon immunité?",
        "Vaccinations recommandées",
        "Conseils pour bien dormir"
      ],
      ar: [
        "كيف أقوي مناعتي؟",
        "التطعيمات الموصى بها",
        "نصائح للنوم الجيد"
      ],
      en: [
        "How to boost my immunity?",
        "Recommended vaccinations",
        "Tips for better sleep"
      ]
    }
  }
];

const HEALTH_TIPS = [
  {
    icon: Heart,
    title: { fr: 'Santé cardiaque', ar: 'صحة القلب', en: 'Heart Health' },
    tip: { 
      fr: '30 minutes d\'activité par jour réduisent les risques cardiovasculaires.',
      ar: '30 دقيقة من النشاط يوميًا تقلل من مخاطر القلب والأوعية الدموية.',
      en: '30 minutes of activity per day reduces cardiovascular risks.'
    }
  },
  {
    icon: Brain,
    title: { fr: 'Bien-être mental', ar: 'الصحة النفسية', en: 'Mental Wellness' },
    tip: {
      fr: 'La méditation et la respiration profonde aident à réduire le stress.',
      ar: 'التأمل والتنفس العميق يساعدان في تقليل التوتر.',
      en: 'Meditation and deep breathing help reduce stress.'
    }
  }
];

export default function MedicalAssistantPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language || 'fr';
  const isRTL = lang === 'ar';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Translations
  const t = useMemo(() => ({
    title: { fr: 'Assistant Médical IA', ar: 'المساعد الطبي الذكي', en: 'AI Medical Assistant' },
    subtitle: { fr: 'Votre compagnon santé disponible 24/7', ar: 'رفيقك الصحي متاح على مدار الساعة', en: 'Your health companion available 24/7' },
    disclaimer1: { fr: 'Cet assistant ne remplace pas un professionnel de santé.', ar: 'هذا المساعد لا يغني عن استشارة طبيب.', en: 'This assistant does not replace a healthcare professional.' },
    disclaimer2: { fr: 'Pour les urgences, contactez immédiatement le 14 (SAMU) ou le 1021.', ar: 'للطوارئ، اتصل فوراً بـ 14 (سامو) أو 1021.', en: 'For emergencies, contact 14 (SAMU) or 1021 immediately.' },
    placeholder: { fr: 'Décrivez vos symptômes ou posez une question...', ar: 'صف أعراضك أو اطرح سؤالاً...', en: 'Describe your symptoms or ask a question...' },
    chat: { fr: 'Discussion', ar: 'محادثة', en: 'Chat' },
    tips: { fr: 'Conseils', ar: 'نصائح', en: 'Tips' },
    calendar: { fr: 'Rappels', ar: 'تذكيرات', en: 'Reminders' },
    emergencyTitle: { fr: 'Urgence détectée', ar: 'تم الكشف عن حالة طوارئ', en: 'Emergency Detected' },
    emergencyDesc: { fr: 'Si vous êtes en situation d\'urgence, appelez immédiatement les secours.', ar: 'إذا كنت في حالة طوارئ، اتصل بالإسعاف فوراً.', en: 'If you are in an emergency, call for help immediately.' },
    callEmergency: { fr: 'Appeler le SAMU (14)', ar: 'اتصل بالإسعاف (14)', en: 'Call SAMU (14)' },
    findNearby: { fr: 'Trouver les urgences proches', ar: 'العثور على أقرب طوارئ', en: 'Find nearby emergency' },
    welcome: { 
      fr: 'Bonjour! 👋 Je suis votre assistant santé virtuel CityHealth. Je peux vous aider à:\n\n• Comprendre vos symptômes\n• Obtenir des conseils de premiers secours\n• Trouver des informations sur les médicaments\n• Vous orienter vers les bons professionnels\n\nComment puis-je vous aider?',
      ar: 'مرحباً! 👋 أنا مساعدك الصحي الافتراضي CityHealth. يمكنني مساعدتك في:\n\n• فهم أعراضك\n• الحصول على نصائح الإسعافات الأولية\n• العثور على معلومات حول الأدوية\n• توجيهك إلى المهنيين المناسبين\n\nكيف يمكنني مساعدتك؟',
      en: 'Hello! 👋 I am your virtual CityHealth health assistant. I can help you:\n\n• Understand your symptoms\n• Get first aid advice\n• Find medication information\n• Guide you to the right professionals\n\nHow can I help you?'
    }
  }), []);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t.welcome[lang as keyof typeof t.welcome] || t.welcome.fr,
        timestamp: new Date()
      }]);
    }
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkForEmergency = (text: string): boolean => {
    const keywords = EMERGENCY_KEYWORDS[lang as keyof typeof EMERGENCY_KEYWORDS] || EMERGENCY_KEYWORDS.fr;
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const isEmergency = checkForEmergency(textToSend);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      isEmergency
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // If emergency, add warning first
    if (isEmergency) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'emergency',
        timestamp: new Date(),
        isEmergency: true
      }]);
    }

    let assistantContent = '';

    try {
      const { streamChat } = await import('@/services/aiChatService');
      
      // Add health context to the system prompt
      const systemContext = lang === 'ar' 
        ? 'أنت مساعد صحي افتراضي. قدم معلومات دقيقة ومفيدة ولكن ذكّر دائماً المستخدم باستشارة طبيب للتشخيص.'
        : lang === 'en'
        ? 'You are a virtual health assistant. Provide accurate and helpful information but always remind users to consult a doctor for diagnosis.'
        : 'Tu es un assistant santé virtuel. Fournis des informations précises et utiles mais rappelle toujours à l\'utilisateur de consulter un médecin pour un diagnostic.';

      await streamChat({
        messages: [
          { role: 'assistant' as const, content: systemContext },
          ...messages.filter(m => m.role !== 'system').concat(userMessage).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        ],
        onDelta: (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg?.role === 'assistant' && !lastMsg.isEmergency) {
              return prev.map((m, i) => 
                i === prev.length - 1 
                  ? { ...m, content: assistantContent }
                  : m
              );
            }
            return [...prev, {
              id: crypto.randomUUID(),
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
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      console.error('Chat error:', error);
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
    <div className={cn("min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900", isRTL && "rtl")}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    {t.title[lang as keyof typeof t.title] || t.title.fr}
                    <Sparkles className="h-5 w-5 text-teal-500" />
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t.subtitle[lang as keyof typeof t.subtitle] || t.subtitle.fr}
                  </p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              En ligne
            </Badge>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimers */}
      <div className="container mx-auto px-4 py-2">
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            <strong>{t.disclaimer1[lang as keyof typeof t.disclaimer1] || t.disclaimer1.fr}</strong>{' '}
            {t.disclaimer2[lang as keyof typeof t.disclaimer2] || t.disclaimer2.fr}
          </AlertDescription>
        </Alert>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t.chat[lang as keyof typeof t.chat] || t.chat.fr}
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t.tips[lang as keyof typeof t.tips] || t.tips.fr}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t.calendar[lang as keyof typeof t.calendar] || t.calendar.fr}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sidebar - Categories */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="border-teal-200 dark:border-teal-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-teal-500" />
                      Questions fréquentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SUGGESTED_CATEGORIES.map((category) => (
                      <div key={category.id} className="space-y-1">
                        <Button
                          variant="ghost"
                          className={cn("w-full justify-start gap-2", category.bg)}
                        >
                          <category.icon className={cn("h-4 w-4", category.color)} />
                          {category.title[lang as keyof typeof category.title] || category.title.fr}
                        </Button>
                        <div className="pl-6 space-y-1">
                          {(category.questions[lang as keyof typeof category.questions] || category.questions.fr).map((q, i) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs h-auto py-2 text-muted-foreground hover:text-foreground"
                              onClick={() => sendMessage(q)}
                            >
                              {q}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col border-teal-200 dark:border-teal-800">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => {
                        // Render emergency warning
                        if (message.role === 'system' && message.isEmergency) {
                          return (
                            <Alert key={message.id} variant="destructive" className="bg-red-50 border-red-300 dark:bg-red-950">
                              <AlertTriangle className="h-5 w-5" />
                              <AlertTitle>{t.emergencyTitle[lang as keyof typeof t.emergencyTitle] || t.emergencyTitle.fr}</AlertTitle>
                              <AlertDescription className="mt-2">
                                <p className="mb-3">{t.emergencyDesc[lang as keyof typeof t.emergencyDesc] || t.emergencyDesc.fr}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => window.location.href = 'tel:14'}
                                  >
                                    <Phone className="h-4 w-4 mr-2" />
                                    {t.callEmergency[lang as keyof typeof t.callEmergency] || t.callEmergency.fr}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate('/providers-map?type=hospital')}
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {t.findNearby[lang as keyof typeof t.findNearby] || t.findNearby.fr}
                                  </Button>
                                </div>
                              </AlertDescription>
                            </Alert>
                          );
                        }

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-3",
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl p-4 shadow-sm",
                                message.role === 'user'
                                  ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-br-sm'
                                  : 'bg-white dark:bg-slate-800 rounded-bl-sm border border-teal-100 dark:border-teal-900'
                              )}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              <p className={cn(
                                "text-xs mt-2",
                                message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                              )}>
                                {message.timestamp.toLocaleTimeString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm p-4 shadow-sm border border-teal-100">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                              <span className="text-sm text-muted-foreground">Analyse en cours...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t bg-teal-50/50 dark:bg-slate-800/50">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t.placeholder[lang as keyof typeof t.placeholder] || t.placeholder.fr}
                        disabled={isLoading}
                        className="flex-1 bg-white dark:bg-slate-900"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <Button 
                        onClick={() => sendMessage()} 
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      >
                        <Send className={cn("h-4 w-4", isRTL && "rotate-180")} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HEALTH_TIPS.map((tip, i) => (
                <Card key={i} className="border-teal-200 dark:border-teal-800">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <tip.icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <h3 className="font-semibold">
                        {tip.title[lang as keyof typeof tip.title] || tip.title.fr}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tip.tip[lang as keyof typeof tip.tip] || tip.tip.fr}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="border-teal-200 dark:border-teal-800">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-teal-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Rappels de santé</h3>
                <p className="text-muted-foreground mb-4">
                  Connectez-vous pour configurer vos rappels de vaccination et check-up.
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Se connecter
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
