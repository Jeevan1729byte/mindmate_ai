import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Sparkles, User, AlertTriangle, Phone, ExternalLink } from "lucide-react";
import { ChatMessage, JournalEntry, CareerGoal } from "../types";

interface CompanionProps {
  journals: JournalEntry[];
  goal: CareerGoal;
}

export default function Companion({ journals, goal }: CompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      text: `Hello! I am your empathetic MindMate companion, here for you 24/7. Preparing for high-pressure exams like ${goal.targetExam} is easily one of the most intellectually and emotionally challenging phases. Rest assured, I remember your journal thoughts. How is your head feeling right now? Let's talk it out.`,
      date: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const userText = inputText;
    setInputText("");
    setSending(true);

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: userText,
      date: new Date().toISOString()
    };

    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);

    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMsgs,
          journals: journals,
          goal: goal
        })
      });

      if (!response.ok) {
        throw new Error("Chat companion request failed");
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.reply || "I am right here listening. What is on your mind?",
        date: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      // Resilient offline/simulation fallback
      setTimeout(() => {
        const fallbacks = [
          `No challenge during your ${goal.targetExam} preparation defines your worth as a person. I understand today felt tough, but your goal of ${goal.aspiration} is still completely within reach. Let's make sure you rest well tonight, and tomorrow is a brand new start.`,
          `I am right here. Academic guilt is highly feedback-driven, but remember that the strongest engineers, civil servants, and doctors had setbacks, too. Give yourself permission to take a 10-minute deep breathing session.`,
          `Setbacks are just diagnostic indicators. Your latest thoughts indicate you're working very hard. What is one tiny 15-minute concept you can cover now without putting too much pressure on yourself?`
        ];
        const r = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        const failMsg: ChatMessage = {
          id: "ai-" + Date.now(),
          sender: "ai",
          text: r,
          date: new Date().toISOString()
        };
        setMessages((prev) => [...prev, failMsg]);
      }, 1000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-1">
      {/* LEFT: Conversation Space */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-xl">
        <div className="bg-slate-950/40 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h2 className="text-sm font-medium text-white flex items-center gap-1.5 font-sans">
                MindMate AI Companion
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                EMPATHETIC AGENT • TARGET: {goal.targetExam}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#a5b4fc] bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full uppercase">
            Context Aware
          </span>
        </div>

        {/* Message feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${
                  m.sender === "user" 
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/20" 
                    : "bg-purple-600/30 text-purple-300 border border-purple-500/20"
                }`}
              >
                {m.sender === "user" ? <User size={14} /> : <Sparkles size={14} />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed border ${
                  m.sender === "user"
                    ? "bg-indigo-600/20 text-indigo-50 border-indigo-500/10 rounded-tr-none"
                    : "bg-slate-950/40 text-slate-100 border-white/5 rounded-tl-none whitespace-pre-wrap"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              MindMate is typing an empathetic response...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/30 border-t border-white/10 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="I wasted today, didn't do any mcqs..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-sans"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-45 text-white p-3 rounded-xl transition-all shadow-md flex items-center justify-center"
            aria-label="Send message to Companion Chat"
          >
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* RIGHT: Supportive Guidelines and Helplines */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
            Empathetic Safe Harbor
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our AI companion is fully tuned to de-escalate toxic academic guilt. If you feel overwhelmed by JEE mock rankings, UPSC revision blocks, or NEET scoring pressure, write down your feelings openly here.
          </p>
        </div>

        {/* Helplines widget */}
        <div id="helplines-card" className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-[32px] p-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-red-400 flex items-center gap-1.5 mb-3 font-semibold">
            <Phone className="w-4 h-4 text-red-400" />
            24/7 Professional Support
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            If you or a student colleague is having harmful thoughts, please disconnect from exam desks immediately and contact professional supporters. Live is precious and exams are just pathways.
          </p>

          <div className="space-y-3.5">
            {/* Tele-MANAS (Govt of India initiative) */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Tele-MANAS</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">14416 (India)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Government of India's free, confidential mental health helpline.</p>
            </div>

            {/* Vandrevala Foundation */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white">Vandrevala Foundation</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">+91 9999 666 555</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Mental wellness advisors offering free counseling across India.</p>
            </div>

            <div className="text-center pt-2">
              <a
                href="https://www.vandrevalafoundation.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Visit Help Website
                <ExternalLink size={8} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
