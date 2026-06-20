export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: string; // emoji
  analysis?: JournalAnalysis;
}

export interface JournalAnalysis {
  anxiety: number; // 0-100
  fear: number; // 0-100
  stress: number; // 0-100
  burnoutRisk: number; // 0-100
  sentiment: string;
  triggers: {
    top_trigger: string;
    secondary_trigger: string;
    confidence: number;
  };
  explanation: string;
  emergencyTriggered: boolean;
}

export interface MoodLog {
  date: string; // YYYY-MM-DD
  mood: string; // 😊, 😌, 😔, 😰, 😡
  label: string; // label like "Exam Stress"
  explanation?: string;
}

export interface StressForecast {
  prediction: "Stable" | "Mild Stress" | "Burnout Risk";
  explanation: string;
}

export interface RecoveryScore {
  stressDiff: string; // e.g. "↓ 18%"
  sleepDiff: string; // e.g. "↑ 12%"
  moodStabilityDiff: string; // e.g. "↑ 24%"
}

export interface UserStats {
  date: string;
  studyHours: number;
  sleepHours: number;
  waterIntake: number; // glasses
  breakTime: number; // minutes
}

export interface CareerGoal {
  aspiration: string; // "become an IAS officer"
  targetExam: "NEET" | "JEE" | "UPSC" | "CAT" | "CUET" | "GATE";
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  date: string;
}
