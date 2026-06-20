import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Wind, Heart, Sparkles, BookOpen, Clock, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatTime } from "../utils/helpers";

const BREED_STEPS = [
  { text: "Inhale deeply...", duration: 4, color: "from-emerald-400 to-teal-500", scale: 1.5 },
  { text: "Hold your breath...", duration: 4, color: "from-teal-400 to-indigo-500", scale: 1.5 },
  { text: "Exhale slowly...", duration: 4, color: "from-indigo-400 to-purple-500", scale: 1.0 },
  { text: "Hold empty...", duration: 4, color: "from-purple-400 to-emerald-500", scale: 1.0 }
];

export default function Coping() {
  // Somatic Square Breather states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathStepIdx, setBreathStepIdx] = useState(0);
  const [breathSecsLeft, setBreathSecsLeft] = useState(4);

  // Pomodoro States
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60); // 25 mins
  const [initialDuration, setInitialDuration] = useState(25 * 60);

  // Affirmations
  const affirmations = [
    "Your worth is not defined by an exam score.",
    "Breathe. One question, one concept at a time.",
    "Every mistake teaches you what to fix before NEET/JEE/UPSC.",
    "You are fully capable of doing tough things.",
    "Stress is just physiological energy. Channel it into focus.",
    "Resting your mind is a strategic part of preparation.",
  ];
  const [affirmationIdx, setAffirmationIdx] = useState(0);

  // Stretches
  const stretches = [
    { title: "Eye Palming", desc: "Rub hands together to generate warmth, cup them over closed eyes for 20 seconds to release optic pressure." },
    { title: "Cervical Neck Stretch", desc: "Slowly drop right ear to right shoulder, hold 15s, then alternate to release desk neck stress." },
    { title: "Shoulder Roll Reset", desc: "Roll shoulders backwards 5 times, then forwards 5 times to stimulate thoracic posture." },
    { title: "Spinal Twist", desc: "Hold the back of your chair and twist gently to each side to relieve lumbar compressions." }
  ];

  // Somatic breathing timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathSecsLeft((prev) => {
          if (prev <= 1) {
            const nextIdx = (breathStepIdx + 1) % BREED_STEPS.length;
            setBreathStepIdx(nextIdx);
            return BREED_STEPS[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathStepIdx]);

  // Pomodoro timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomodoroActive) {
      interval = setInterval(() => {
        setPomodoroDuration((prev) => {
          if (prev <= 1) {
            // Toggle focus / break mode
            const nextMode = timerMode === "focus" ? "break" : "focus";
            const nextDur = nextMode === "focus" ? 25 * 60 : 5 * 60;
            setTimerMode(nextMode);
            setInitialDuration(nextDur);
            // Play a mild synthesized beep
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(600, audioCtx.currentTime);
              osc.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              console.log("Audio feedback error:", e);
            }
            return nextDur;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, timerMode]);

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      setBreathStepIdx(0);
      setBreathSecsLeft(BREED_STEPS[0].duration);
    }
  };

  const handlePomodoroReset = () => {
    setPomodoroActive(false);
    const defaultSecs = timerMode === "focus" ? 25 * 60 : 5 * 60;
    setPomodoroDuration(defaultSecs);
    setInitialDuration(defaultSecs);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
      {/* SECTION 1: Somatic Guided Square Breathing */}
      <div 
        id="breathing-card"
        className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              <Wind className="text-emerald-400 w-5 h-5 animate-pulse" />
              Somatic Square Breather
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Used by Navy SEALS and toppers to instantly regulate high academic panic.
            </p>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full uppercase">
            Autonomic Reset
          </span>
        </div>

        {/* Dynamic breathing visual stage */}
        <div className="h-64 flex flex-col items-center justify-center relative my-6">
          <AnimatePresence mode="popLayout">
            {/* Pulsing Breathing Ring */}
            <motion.div
              key={breathStepIdx}
              className={`absolute rounded-full bg-gradient-to-br ${BREED_STEPS[breathStepIdx].color} opacity-20 blur-xl`}
              style={{ width: 140, height: 140 }}
              animate={{
                scale: breathingActive ? BREED_STEPS[breathStepIdx].scale : 1.0,
              }}
              transition={{
                duration: BREED_STEPS[breathStepIdx].duration,
                ease: "easeInOut"
              }}
            />
          </AnimatePresence>

          {/* Central Sphere */}
          <motion.div
            className={`w-32 h-32 rounded-full bg-gradient-to-r ${
              breathingActive ? BREED_STEPS[breathStepIdx].color : "from-slate-700 to-slate-800"
            } shadow-inner flex flex-col items-center justify-center border border-white/20 z-10`}
            animate={breathingActive ? {
              scale: BREED_STEPS[breathStepIdx].scale,
            } : { scale: 1 }}
            transition={{
              duration: BREED_STEPS[breathStepIdx].duration,
              ease: "easeInOut"
            }}
          >
            <span className="text-3xl font-mono text-white font-bold">{breathSecsLeft}s</span>
            <span className="text-[10px] opacity-80 tracking-wider font-mono">COUNTDOWN</span>
          </motion.div>

          {/* Prompt banner of the step */}
          <div className="absolute bottom-1 text-center w-full z-10">
            <p className="text-lg font-medium text-white tracking-wide">
              {breathingActive ? BREED_STEPS[breathStepIdx].text : "Ready to soothe exam anxiety?"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {breathingActive 
                ? `Hold for 4 cycles of box breathing` 
                : "A 4-4-4-4 second autonomic control sequence"
              }
            </p>
          </div>
        </div>

        <button
          onClick={toggleBreathing}
          aria-label={breathingActive ? "Pause breathing guide" : "Start breathing guide"}
          className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${
            breathingActive
              ? "bg-slate-700 hover:bg-slate-600 text-white border border-slate-500/20"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-950/30"
          }`}
        >
          {breathingActive ? (
            <>
              <Pause size={18} /> Pause Box Rest
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" /> Activate Box Breather
            </>
          )}
        </button>
      </div>

      {/* SECTION 2: Custom Pomodoro & Habits */}
      <div 
        id="pomodoro-card"
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              <Clock className="text-indigo-400 w-5 h-5" />
              Focus Pomodoro Deck
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Optimize cognitive endurance. Take systematic micro-breaks.
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setTimerMode("focus");
                setPomodoroDuration(25 * 60);
                setInitialDuration(25 * 60);
                setPomodoroActive(false);
              }}
              className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded-lg transition-all ${
                timerMode === "focus" 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Study Block
            </button>
            <button
              onClick={() => {
                setTimerMode("break");
                setPomodoroDuration(5 * 60);
                setInitialDuration(5 * 60);
                setPomodoroActive(false);
              }}
              className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded-lg transition-all ${
                timerMode === "break" 
                  ? "bg-indigo-600 text-white" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rest Break
            </button>
          </div>
        </div>

        {/* Display timer */}
        <div className="flex flex-col items-center justify-center my-6">
          <span className="text-6xl font-extrabold font-mono text-white tracking-widest leading-none drop-shadow-md">
            {formatTime(pomodoroDuration)}
          </span>
          <span className="text-[11px] font-mono tracking-widest text-[#a5b4fc] mt-2 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase">
            {timerMode === "focus" ? "✏️ Active Study State" : "☕ Mind Refactoring"}
          </span>

          {/* Simple simulated visual bar */}
          <div className="w-full max-w-xs h-1.5 bg-slate-950/40 rounded-full mt-5 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${(pomodoroDuration / initialDuration) * 100}%` }}
              layout
            />
          </div>
        </div>

        {/* Pomodoro Action Row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPomodoroActive(!pomodoroActive)}
            className={`py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-xs transition-all ${
              pomodoroActive 
                ? "bg-amber-600 hover:bg-amber-700 text-white" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {pomodoroActive ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
            {pomodoroActive ? "Pause Timer" : "Begin Interval"}
          </button>
          <button
            onClick={handlePomodoroReset}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-xs transition-all border border-slate-500/20"
          >
            <RotateCcw size={14} />
            Reset Block
          </button>
        </div>
      </div>

      {/* SECTION 3: Somatic Stretches For Desk Fatigue */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
        <h2 className="text-lg font-medium tracking-tight text-white flex items-center gap-2 mb-4">
          <Activity className="text-purple-400 w-5 h-5" />
          Desk Reset Stretches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {stretches.map((stretch, idx) => (
            <div key={idx} className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/30 transition-all">
              <span className="text-[10px] tracking-wide font-mono text-purple-400 uppercase bg-purple-500/10 px-2 py-0.5 rounded-md">
                0{idx + 1} • {stretch.title}
              </span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {stretch.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: Aspirant Grounding Affirmations */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-medium tracking-tight text-white flex items-center gap-2 mb-1">
            <Heart className="text-rose-400 w-4 h-4" />
            Empathetic Affirmations
          </h2>
          <p className="text-xs text-slate-400">
            Click to cycle calming psychological grounding statements.
          </p>
        </div>

        <div className="bg-slate-950/20 border border-dashed border-white/10 rounded-2xl p-5 my-4 h-24 flex items-center justify-center text-center">
          <p className="text-sm font-medium italic text-slate-200 leading-relaxed">
            "{affirmations[affirmationIdx]}"
          </p>
        </div>

        <button
          onClick={() => setAffirmationIdx((prev) => (prev + 1) % affirmations.length)}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2.5 text-xs font-mono tracking-wider uppercase border border-slate-500/20 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          Generate Calm Affirmation
        </button>
      </div>
    </div>
  );
}
