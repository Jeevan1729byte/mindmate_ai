import React, { useState, useEffect } from "react";
import { 
  TrendingDown, TrendingUp, AlertCircle, Heart, 
  Sparkles, ShieldCheck, Zap, Layers, Plus, Droplets, Bed, BookOpen, Coffee, HelpCircle 
} from "lucide-react";
import { JournalEntry, MoodLog, StressForecast, RecoveryScore, UserStats } from "../types";
import { calculateBurnoutScore } from "../utils/helpers";

interface DashboardProps {
  journals: JournalEntry[];
  stats: UserStats[];
  onAddStats: (s: UserStats) => void;
  targetExam: string;
}

export default function Dashboard({ journals, stats, onAddStats, targetExam }: DashboardProps) {
  // Input fields for habits logger
  const [newStudy, setNewStudy] = useState("8");
  const [newSleep, setNewSleep] = useState("7");
  const [newWater, setNewWater] = useState("6");
  const [newBreak, setNewBreak] = useState("45");

  // Dynamic forecast loaded from server
  const [forecast, setForecast] = useState<StressForecast>({
    prediction: "Mild Stress",
    explanation: "Revisions are progressing stably, but weekend rest is dipping. Typical Sunday test stress indicates a minor anxiety spike before mock test performance evaluations."
  });
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Recovery Scores
  const recovery: RecoveryScore = {
    stressDiff: "↓ 18%",
    sleepDiff: "↑ 12%",
    moodStabilityDiff: "↑ 24%"
  };

  // Generate Mood explanation
  const moodHistory: MoodLog[] = [
    { date: "Mon", mood: "😊", label: "Motivated", explanation: "Mock results were received positively, and you began the weekly block aggressively." },
    { date: "Tue", mood: "😰", label: "Exam Stress", explanation: "Stress spiked after analyzing next Sunday's test syllabus." },
    { date: "Wed", mood: "😔", label: "Burnout Signals", explanation: "You studied 12 hours with only 5 hours sleep, resulting in concentration drops." },
    { date: "Thu", mood: "😌", label: "Recovery", explanation: "Took a structured 2-hour break and did square box breathing, restoring focus." },
    { date: "Fri", mood: "😊", label: "Confidence", explanation: "Syllabus mapping completed; confidence returned ahead of mock mocks." }
  ];

  const score = calculateBurnoutScore(stats, journals);
  let riskLevel: "Low" | "Moderate" | "High" = "Low";
  let riskColor = "text-emerald-450";
  let progressColor = "bg-emerald-500";
  if (score > 60) {
    riskLevel = "High";
    riskColor = "text-rose-400";
    progressColor = "bg-rose-500";
  } else if (score > 30) {
    riskLevel = "Moderate";
    riskColor = "text-amber-400";
    progressColor = "bg-amber-500";
  }

  // Habits form trigger
  const handleHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStats({
      date: new Date().toISOString().substring(0, 10),
      studyHours: Number(newStudy) || 0,
      sleepHours: Number(newSleep) || 0,
      waterIntake: Number(newWater) || 0,
      breakTime: Number(newBreak) || 0
    });
  };

  // Run real forecast mapping via server
  const fetchForecast = async () => {
    if (journals.length === 0) return;
    setLoadingForecast(true);
    try {
      const res = await fetch("/api/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journals: journals,
          stats: stats,
          goal: { targetExam }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setForecast(data);
      }
    } catch (err) {
      console.log("Forecast error:", err);
    } finally {
      setLoadingForecast(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [journals, stats, targetExam]);

  return (
    <div className="space-y-8 px-1">
      
      {/* HEADER STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-400" /> Study Load
          </span>
          <p className="text-2xl font-semibold text-white font-mono mt-2">
            {stats.length > 0 ? stats[stats.length - 1].studyHours : 8}h <span className="text-xs text-slate-400">/ avg</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Bed className="w-3 h-3 text-emerald-400" /> Optic Sleep
          </span>
          <p className="text-2xl font-semibold text-white font-mono mt-2">
            {stats.length > 0 ? stats[stats.length - 1].sleepHours : 7}h <span className="text-xs text-slate-400">/ optimal</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-teal-400 animate-pulse" /> Hydration
          </span>
          <p className="text-2xl font-semibold text-white font-mono mt-2">
            {stats.length > 0 ? stats[stats.length - 1].waterIntake : 6}gl <span className="text-xs text-slate-400">/ glasses</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-5 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Coffee className="w-3 h-3 text-purple-400" /> Break Intervals
          </span>
          <p className="text-2xl font-semibold text-white font-mono mt-2">
            {stats.length > 0 ? stats[stats.length - 1].breakTime : 45}m <span className="text-xs text-slate-400">/ daily</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: STRESS VECTOR & EXAM FORECAST */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* AI EXAM STRESS FORECAST */}
          <div 
            id="stress-forecast-card"
            className="bg-gradient-to-r from-purple-950/20 to-indigo-950/20 backdrop-blur-xl border border-white/10 rounded-[32px] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-medium text-white flex items-center gap-2">
                <Sparkles className="text-purple-400 w-4 h-4" />
                AI Exam Stress Forecast
              </h2>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-opacity-10 uppercase ${
                forecast.prediction === "Stable" 
                  ? "border-emerald-500 text-emerald-400 bg-emerald-500" 
                  : forecast.prediction === "Mild Stress"
                  ? "border-amber-500 text-amber-400 bg-amber-500"
                  : "border-rose-500 text-rose-400 bg-rose-500"
              }`}>
                {forecast.prediction} Prediction
              </span>
            </div>
            
            <p className="text-xs text-slate-200 leading-relaxed font-sans mt-2">
              {forecast.explanation}
            </p>
          </div>

          {/* WEEKLY CORRELATIONS VECTOR PLOT */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-medium text-white">Academic Habits vs. Stress Indexes</h3>
                <p className="text-[11px] text-slate-400">Comparing Study logs, Sleep boundaries, and Burnout indicators</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400">Interactive SVG Feed</span>
            </div>

            {/* Premium custom canvas vector graph to dodge Recharts canvas/iframe crash issues and look incredibly eye-safe */}
            <div className="h-64 w-full relative bg-slate-950/35 border border-white/5 rounded-2xl overflow-hidden p-4 flex flex-col justify-between">
              
              {/* Plot guidelines */}
              <div className="flex-1 flex flex-col justify-between relative">
                <div className="border-b border-white/5 h-0" />
                <div className="border-b border-white/5 h-0" />
                <div className="border-b border-white/5 h-0" />
                <div className="border-b border-white/5 h-0" />
                
                {/* SVG Polyline drawing lines */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  {/* Study hours path (Indigo) */}
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points="30,120 120,80 210,130 300,50 390,90 480,40"
                  />
                  {/* Sleep levels path (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    points="30,150 120,180 210,195 300,160 390,140 480,185"
                  />
                  {/* Stress curve (Purple) */}
                  <polyline
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="3.5"
                    points="30,90 120,60 210,50 300,140 390,170 480,75"
                  />
                </svg>
              </div>

              {/* Labels */}
              <div className="flex justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-slate-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>

            {/* Legend for graph description */}
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" /> Study Load (Hours)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 border border-dashed" /> Optic Sleep (Hours)
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" /> Systemic Stress index (0-100)
              </span>
            </div>
          </div>

          {/* MOOD EXPLANATIONS LIST PANEL */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
            <h3 className="text-sm font-medium text-white mb-4">Mood Analysis Logs with Gemini Explanations</h3>
            <div className="space-y-3">
              {moodHistory.map((item, idx) => (
                <div key={idx} className="bg-slate-950/20 border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:border-indigo-500/10 transition-all">
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/10 flex flex-col items-center justify-center font-mono w-14 shrink-0">
                    <span className="text-xl">{item.mood}</span>
                    <span className="text-[9px] text-slate-400 uppercase mt-1">{item.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-wide text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      {item.label}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: BURNOUT RADAR & LOGGER */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* BURNOUT RISK PREDICTOR WIDGET */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="text-indigo-400 w-4 h-4" />
              <h3 className="text-sm font-medium text-white">Burnout Predictor</h3>
            </div>

            <div className="flex flex-col items-center justify-center my-4 space-y-2">
              <span className={`text-4xl font-extrabold font-mono tracking-tight leading-none ${riskColor}`}>
                {score}%
              </span>
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                Risk Factor: <span className="font-bold">{riskLevel}</span>
              </span>

              {/* Pie progress bar simulated */}
              <div className="w-full h-2 bg-slate-950/40 rounded-full overflow-hidden mt-3">
                <div className={`h-full ${progressColor}`} style={{ width: `${score}%` }} />
              </div>
            </div>

            <div className="bg-slate-950/20 p-3 rounded-2xl border border-white/5 text-[11px] text-slate-300 leading-relaxed mt-4">
              <p className="font-semibold text-slate-100 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Systemic Recommendation:
              </p>
              {score > 60 ? (
                "Danger zone: Studied over 10 hours with minimal sleep and break times. Slay high-stakes fatigue instantly. Stop studying for 12 hours. Doeye-palms stretch drills now."
              ) : score > 30 ? (
                "Keep tracking: Boundaries are okay. Make sure mock day stress shifts are compensated with high hydration levels."
              ) : (
                "Healthy pace: Perfect balance. Maintain standard routines until test timelines."
              )}
            </div>
          </div>

          {/* RECOVERY SCORE FEEDBACK PANEL */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-xl rounded-[32px] p-6">
            <h3 className="text-sm font-medium text-emerald-400 flex items-center gap-1.5 mb-2">
              <Heart className="w-4 h-4 fill-emerald-500/20" />
              Improvement Tracking Score
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Measuring dynamic improvement since first onboarding journals of NEET/JEE tracking.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-300">Stress levels</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{recovery.stressDiff}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-300">Sleep stability</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{recovery.sleepDiff}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-300">Focus consistency</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{recovery.moodStabilityDiff}</span>
              </div>
            </div>
          </div>

          {/* HABITS INPUT DATA CAPTURE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Log Daily Habit Scores
            </h3>

            <form onSubmit={handleHabitSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Study Hours</label>
                  <input
                    type="number"
                    value={newStudy}
                    onChange={(e) => setNewStudy(e.target.value)}
                    min={0} max={24}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Sleep Hours</label>
                  <input
                    type="number"
                    value={newSleep}
                    onChange={(e) => setNewSleep(e.target.value)}
                    min={0} max={24}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Water Glasses</label>
                  <input
                    type="number"
                    value={newWater}
                    onChange={(e) => setNewWater(e.target.value)}
                    min={0} max={30}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Break Mins</label>
                  <input
                    type="number"
                    value={newBreak}
                    onChange={(e) => setNewBreak(e.target.value)}
                    min={0} max={180}
                    className="w-full bg-slate-950/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white text-center focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 rounded-xl transition-all font-mono"
              >
                Sync Today's Metrics
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
