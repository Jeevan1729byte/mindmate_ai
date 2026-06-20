import React, { useState, useEffect } from "react";
import { Mic, MicOff, Send, Loader2, Calendar, BrainCircuit, AlertOctagon, Sparkles, CheckCircle } from "lucide-react";
import { JournalEntry, JournalAnalysis } from "../types";

// Simulated voice typing recognition (Web Speech API Wrapper)
const SpeechRecognition = typeof window !== "undefined" ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  targetExam: string;
}

export default function Journal({ entries, onAddEntry, targetExam }: JournalProps) {
  const [inputText, setInputText] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const moodOptions = [
    { emoji: "😊", label: "Motivated (Happy)" },
    { emoji: "😌", label: "Calm (Optimistic)" },
    { emoji: "😔", label: "Sad / Low energy" },
    { emoji: "😰", label: "Stress spikes / Panic" },
    { emoji: "😡", label: "Frustrated / Irritated" }
  ];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-IN"; // Target multilingual Indian English context

      rec.onresult = (e: any) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognitionObj(rec);
    }
  }, []);

  const handleVoiceClick = () => {
    if (!recognitionObj) {
      setErrorMsg("Web Speech API is not supported in this frame environment / browser. Type your entry freely below!");
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (isRecording) {
      recognitionObj.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setErrorMsg("");
      try {
        recognitionObj.start();
      } catch (err) {
        console.error("Speech recognition double start safety crash:", err);
      }
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          mood: selectedMood
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis endpoint failed");
      }

      const analysis: JournalAnalysis = await response.json();

      const newEntry: JournalEntry = {
        id: "journal-" + Date.now(),
        date: new Date().toISOString(),
        text: inputText,
        mood: selectedMood,
        analysis
      };

      onAddEntry(newEntry);
      setInputText("");
      // Success feedback
      const confirmBox = document.getElementById("entry-added-noti");
      if (confirmBox) {
        confirmBox.classList.remove("hidden");
        setTimeout(() => confirmBox.classList.add("hidden"), 4000);
      }

    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to analyze journal with MindMate Server. Using direct fallback saving.");
      
      // Fallback analysis to maintain offline resilient functionality
      const fallbackAnalysis: JournalAnalysis = {
        anxiety: 45,
        fear: 30,
        stress: 50,
        burnoutRisk: 40,
        sentiment: "Neutral Fallback",
        triggers: {
          top_trigger: "Standard Syllabus Revisions",
          secondary_trigger: "Unspecified Mock Schedules",
          confidence: 0.7
        },
        explanation: "Resilient Fallback is active. Real-time cognitive extraction requires connecting to the Express service.",
        emergencyTriggered: false
      };

      const fallbackEntry: JournalEntry = {
        id: "journal-" + Date.now(),
        date: new Date().toISOString(),
        text: inputText,
        mood: selectedMood,
        analysis: fallbackAnalysis
      };

      onAddEntry(fallbackEntry);
      setInputText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-1">
      {/* LEFT: Entry Form */}
      <div className="lg:col-span-7 space-y-6">
        <div id="entry-added-noti" className="hidden bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3 flex items-center justify-between transition-all">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Journal logged! Custom Trigger Radar and Stress analysis loaded.
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
                <BrainCircuit className="text-indigo-400 w-5 h-5" />
                Write Your Mind Out
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Freely record mock tests, study routines, family stress, or low confidence signs.
              </p>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full uppercase">
              Target: {targetExam}
            </span>
          </div>

          <form onSubmit={handleJournalSubmit} className="space-y-5">
            {/* Mood selector list */}
            <div>
              <label className="block text-[11px] font-mono tracking-widest text-slate-300 uppercase mb-2">
                Current Mood Anchor
              </label>
              <div className="flex flex-wrap gap-2.5">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.emoji}
                    type="button"
                    onClick={() => setSelectedMood(opt.emoji)}
                    aria-label={`Select mood ${opt.label}`}
                    style={{ contentVisibility: "auto" }}
                    className={`px-3 py-2 text-xs rounded-xl flex items-center gap-2 transition-all ${
                      selectedMood === opt.emoji
                        ? "bg-indigo-600/30 text-white border-2 border-indigo-500"
                        : "bg-slate-950/20 text-slate-300 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="text-[10px] opacity-80">{opt.label.split(" (")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Text Content and Voice input wrapper */}
            <div className="relative">
              <label 
                htmlFor="journal-textarea" 
                className="block text-[11px] font-mono tracking-widest text-slate-300 uppercase mb-2"
              >
                Journal Entry Description
              </label>
              <textarea
                id="journal-textarea"
                rows={10}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="I spent 11 hours studying today but my mock marks dropped by 20 points, and my parents keep bringing up my ranking. Feeling completely burnt out and worried if I am even capable of JEE/NEET..."
                className="w-full bg-slate-950/40 text-slate-150 placeholder-slate-500 text-sm border border-white/10 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all leading-relaxed"
                aria-label="Text entry area for student logs"
              />

              {/* Voice record trigger */}
              <button
                type="button"
                onClick={handleVoiceClick}
                aria-label={isRecording ? "Stop voice dictation" : "Start voice dictation"}
                className={`absolute bottom-3 right-3 p-3 rounded-full transition-all flex items-center justify-center ${
                  isRecording
                    ? "bg-rose-600 animate-pulse text-white"
                    : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            {isRecording && (
              <div className="bg-rose-500/5 border border-rose-500/20 text-rose-300 text-[11px] rounded-xl p-2.5 px-3.5 flex items-center gap-2 animate-bounce">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                Listening to speak-to-text... (We support Indian English contexts natively in standard Chrome/Edge)
              </div>
            )}

            {errorMsg && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl p-3 flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold font-mono">⚠️ Note:</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              aria-label="Submit Journal Entry"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Analyzing Cognitive Triggers...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Log & Uncover Hidden Triggers
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: History and Radar */}
      <div className="lg:col-span-5 space-y-6">
        {/* Hidden Trigger Radar explanation & status info */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-md font-medium text-white tracking-tight">Triggers Captured</h3>
              <p className="text-[11px] text-slate-400">Hidden psychological stresses normal trackers miss.</p>
            </div>
          </div>

          <div className="my-5 border-t border-white/10 pt-4 space-y-3.5">
            {entries.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs italic">Submit your first journal to trigger the AI Radar scan.</p>
              </div>
            ) : (
              (() => {
                const latest = entries[entries.length - 1];
                const analysis = latest.analysis;
                if (!analysis) return null;

                return (
                  <div className="space-y-3">
                    {/* TOP TRIGER CARD */}
                    <div className="bg-slate-950/30 border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] tracking-widest font-mono text-indigo-400 uppercase">Top Risk Vector</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {(analysis.triggers.confidence * 100).toFixed(0)}% Conf
                        </span>
                      </div>
                      <p className="text-sm text-slate-100 font-medium mt-1.5">
                        {analysis.triggers.top_trigger}
                      </p>
                    </div>

                    {/* SECONDARY TRIGGER CARD */}
                    <div className="bg-slate-950/30 border border-white/5 p-3.5 rounded-2xl">
                      <span className="text-[10px] tracking-widest font-mono text-indigo-400 uppercase">Secondary Vector</span>
                      <p className="text-xs text-slate-200 mt-1">
                        {analysis.triggers.secondary_trigger}
                      </p>
                    </div>

                    {/* EVALUATION DIALOG */}
                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 p-3.5 rounded-2xl">
                      <p className="text-[10px] tracking-widest font-mono text-purple-400 uppercase mb-1">Empathetic Scan</p>
                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{analysis.explanation}"
                      </p>
                    </div>

                    {analysis.emergencyTriggered && (
                      <div className="bg-rose-500/20 border border-rose-500/20 p-3.5 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs">
                        <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                        <div className="space-y-1">
                          <p className="font-bold">Severe academic distress detected.</p>
                          <p className="leading-normal">Please browse emergency contacts instantly on our bottom tabs. You matter infinitely more than NEET/JEE rankings.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* RECENT JOURNAL LIST */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6">
          <h3 className="text-sm font-medium text-white mb-3">Historical Logs ({entries.length})</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {entries.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">Your entries will be indexed here.</p>
            ) : (
              [...entries].reverse().map((entry) => (
                <div key={entry.id} className="bg-slate-950/20 border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      {new Date(entry.date).toLocaleDateString(undefined, { 
                        month: "short", day: "numeric" 
                      })}
                    </span>
                    <span>Mood: {entry.mood}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">
                    {entry.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
