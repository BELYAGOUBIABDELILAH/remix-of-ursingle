import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    text: "Hi! I’m the CityHealth assistant. Ask me about providers, services, or emergencies. This doesn’t replace professional consultation.",
    sender: "ai",
    timestamp: new Date(),
  }]);

  useEffect(() => {
    if (open) document.title = "CityHealth – AI Assistant";
  }, [open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), text: input.trim(), sender: "user", timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: "Thanks! I’ll help route you to the right care. For emergencies, call 14 immediately.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const FloatingButton = useMemo(() => (
    <DialogTrigger asChild>
      <Button size="lg" className="fixed bottom-6 right-6 rounded-full shadow-lg glass-card px-5 py-6" aria-label="Open CityHealth AI Assistant">
        <MessageCircle className="mr-2" /> Ask our health AI
      </Button>
    </DialogTrigger>
  ), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {FloatingButton}
      <DialogContent className="sm:max-w-lg max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>CityHealth AI Assistant</span>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-2">This tool provides information and does not replace professional medical advice.</div>
        <div className="h-80 overflow-y-auto rounded-md border p-3 bg-muted/30">
          {messages.map((m) => (
            <div key={m.id} className={`mb-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${m.sender === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}>
                <div className="text-xs opacity-70 mb-1">{m.sender === "user" ? "You" : "AI"}</div>
                <div className="whitespace-pre-wrap text-sm">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="Type your question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            aria-label="Message input"
          />
          <Button onClick={handleSend} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatWidget;
