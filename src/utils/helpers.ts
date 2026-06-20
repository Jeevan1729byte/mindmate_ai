import { JournalEntry, UserStats } from "../types";

/**
 * Formats seconds into a MM:SS string.
 * @param secs Total seconds
 */
export function formatTime(secs: number): string {
  if (secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Scans text for clinical crisis keywords to trigger safety protocols.
 * @param text The input thought/mood content.
 */
export function detectCrisis(text: string): boolean {
  if (!text) return false;
  const lowercase = text.toLowerCase();
  const crisisKeywords = [
    "quit life", "end my life", "suicide", "want to die", 
    "kill myself", "no reason to live", "quit this world",
    "nothing matters anymore", "want to end everything"
  ];
  return crisisKeywords.some(keyword => lowercase.includes(keyword));
}

/**
 * Calculates a quantitative burnout risk score based on study load, sleep duration,
 * break frequencies, and physiological anxiety and stress triggers from journals.
 * 
 * @param stats Historical or current logged study habits and metrics
 * @param journals Analyzed logs containing anxiety/stress metrics
 */
export function calculateBurnoutScore(stats: UserStats[], journals: JournalEntry[]): number {
  if (stats.length === 0) return 45; // default baseline
  const latest = stats[stats.length - 1];
  let score = (latest.studyHours * 8) - (latest.sleepHours * 6) + (latest.breakTime < 30 ? 25 : 0);
  if (journals.length > 0) {
    const latestJ = journals[journals.length - 1];
    if (latestJ.analysis) {
      score += (latestJ.analysis.anxiety + latestJ.analysis.stress) / 3;
    }
  }
  return Math.min(100, Math.max(12, Math.round(score)));
}
