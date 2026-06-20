import React, { useState, useEffect } from "react";
import { Sparkles, Award, Goal, Book, RefreshCw, Star } from "lucide-react";
import { CareerGoal } from "../types";

interface MotivationProps {
  goal: CareerGoal;
  setGoal: (goal: CareerGoal) => void;
  recentJournalText?: string;
}

export default function Motivation({ goal, setGoal, recentJournalText }: MotivationProps) {
  const [quote, setQuote] = useState<{ text: string; author: string }>({
    text: "Your preparation is a journey of endurance, not just scores. Give yourself permission to rest.",
    author: "MindMate Wellness"
  });
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [tempAsper, setTempAsper] = useState(goal.aspiration);
  const [tempExam, setTempExam] = useState<CareerGoal["targetExam"]>(goal.targetExam);

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/motivation");
      if (res.ok) {
        const data = await res.json();
        setQuote(data);
      }
    } catch (e) {
      console.log("Error loading quote:", e);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal({
      aspiration: tempAsper || "Succeed",
      targetExam: tempExam
    });
  };

  const topperAdvice: Record<CareerGoal["targetExam"], string[]> = {
    UPSC: [
      "Revision holds the ultimate code of rank selection, not just covering new books.",
      "The answer is in writing! Dedicate 1 hour daily to practice answer framing.",
      "Maintain perspective: Indian democracy needs empathetic leaders. Study to serve, not just clear the exam."
    ],
    NEET: [
      "NCERT must be on your fingertips. Prioritize physics concept maps.",
      "Speed is as critical as accuracy. Mimic real exam bio blocks in 30-minute intervals.",
      "Mistake registers are golden. Look at yesterday's incorrect NEET mock questions today."
    ],
    JEE: [
      "Focus on concepts depth over bulk problem sheets. Derive formulas from scratch.",
      "Mock test mapping: Mark questions which took over 3 minutes and analyze the mathematical bottleneck.",
      "Patience is your biggest asset. It is better to master 10 key organic mechanics than memorize 100 reactions."
    ],
    CAT: [
      "Uncover hidden shortcuts in quantitative ability blocks early.",
      "VARC holds the maximum score acceleration. Spend 30 minutes reading complex editorial journals every day.",
      "DILR setup is about speed profiling. If a puzzle isn't shaping in 5 minutes, mark and skip intentionally."
    ],
    CUET: [
      "Map your board syllabus thoroughly. General tests are all about systematic practice.",
      "General awareness benefits from high-yield, quick summary sheets.",
      "Don't worry about standard deviation. Core speed beats complex calculations."
    ],
    GATE: [
      "Dedicate major blocks to rigorous mathematical derivations.",
      "Virtual calculators demand muscle memory. Run GATE-adapted diagnostic mocks to build fluid speed.",
      "Master core computer/domain principles before touching miscellaneous sections."
    ]
  };

  const tips = topperAdvice[goal.targetExam] || topperAdvice["UPSC"];

  return (
    <div className="space-y-8 px-1">
      {/* Target Exam & Aspirational Hub - FUTURE SELF AI CONFIGURATOR */}
      <div 
        id="future-self-config"
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Goal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white tracking-tight">Future Self Settings</h2>
            <p className="text-xs text-slate-300">Set your competitive aspirations. MindMate will feed this into your AI Companion dialogues.</p>
          </div>
        </div>

        <form onSubmit={handleSaveGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="exam-selector" className="block text-xs font-mono text-slate-300 uppercase mb-2">Target Exam</label>
            <select
              id="exam-selector"
              value={tempExam}
              onChange={(e) => setTempExam(e.target.value as CareerGoal["targetExam"])}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
            >
              <option value="NEET">NEET (Medical Aspirants)</option>
              <option value="JEE">JEE (IIT/Engineering)</option>
              <option value="UPSC">UPSC (Civil Services)</option>
              <option value="CAT">CAT (IIM/Management)</option>
              <option value="CUET">CUET (Undergrad Admissions)</option>
              <option value="GATE">GATE (Engineering Postgrad)</option>
            </select>
          </div>

          <div>
            <label htmlFor="ambition-input" className="block text-xs font-mono text-slate-300 uppercase mb-2">Life Ambition (Future Self Target)</label>
            <input
              id="ambition-input"
              type="text"
              value={tempAsper}
              onChange={(e) => setTempAsper(e.target.value)}
              placeholder="e.g. become an IAS officer / get into IIT Bombay"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
          >
            Update Future Self Target
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SECTION 1: Dynamic Quote Generator (with Server API integration) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Star className="w-32 h-32 text-indigo-400 rotate-12" />
          </div>

          <div className="z-10">
            <span className="text-[9px] tracking-widest font-mono text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Daily Anchor
            </span>
            <div className="my-6">
              <p className="text-lg font-medium text-slate-200 leading-relaxed italic">
                "{quote.text}"
              </p>
              <p className="text-xs text-slate-400 mt-3 font-mono">
                — {quote.author || "MindMate Guide"}
              </p>
            </div>
          </div>

          <button
            onClick={fetchQuote}
            disabled={loadingQuote}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2.5 rounded-xl border border-slate-500/20 transition-all font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 z-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loadingQuote ? "animate-spin" : ""}`} />
            {loadingQuote ? "Syncing..." : "Sync Motivation Anchor"}
          </button>
        </div>

        {/* SECTION 2: Customized Exam Strategy Blueprint */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
            <div>
              <h3 className="text-md font-medium text-white tracking-tight">Topper Tactics: {goal.targetExam}</h3>
              <p className="text-xs text-slate-400">Customized preparation guidelines for your dynamic goal.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {tips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 bg-slate-950/25 p-3.5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 w-6 h-6 flex items-center justify-center rounded-lg border border-emerald-500/20 shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Encouragement Centre */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/10 backdrop-blur-xl border border-white/5 rounded-[32px] p-6">
        <h3 className="text-md font-medium text-white flex items-center gap-1.5 mb-2">
          <Book className="w-4 h-4 text-purple-400" />
          Aspirant Weekly Manifesto
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Remember: every national competitive exam (be it NEET containing 20+ lakh students or UPSC containing rigorous answer framing processes) is designed to filter. You are not a mere statistic. Build a bulletproof state of mind. Today's syllabus pressure belongs to today alone; tomorrow, we begin again with clean clarity.
        </p>
      </div>
    </div>
  );
}
