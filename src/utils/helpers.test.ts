import { describe, it, expect } from "vitest";
import { formatTime, detectCrisis, calculateBurnoutScore } from "./helpers";
import { JournalEntry, UserStats } from "../types";

describe("Helpers Test Suite", () => {
  describe("formatTime", () => {
    it("should format positive seconds correctly into MM:SS format", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(59)).toBe("00:59");
      expect(formatTime(60)).toBe("01:00");
      expect(formatTime(125)).toBe("02:05");
      expect(formatTime(3599)).toBe("59:59");
    });

    it("should handle negative seconds gracefully", () => {
      expect(formatTime(-10)).toBe("00:00");
    });
  });

  describe("detectCrisis", () => {
    it("should detect emergency crisis phrases correctly (case-insensitive)", () => {
      expect(detectCrisis("i want to end my life, it's too much")).toBe(true);
      expect(detectCrisis("SUICIDE is on my mind")).toBe(true);
      expect(detectCrisis("I just want to quit life right now")).toBe(true);
    });

    it("should return false for regular, non-crisis student stress journal entries", () => {
      expect(detectCrisis("The UPSC syllabus is so massive, I feel overwhelmed or very stressed.")).toBe(false);
      expect(detectCrisis("")).toBe(false);
      expect(detectCrisis("My sleep has been a bit poor lately, need to fix it.")).toBe(false);
    });
  });

  describe("calculateBurnoutScore", () => {
    const mockStatsNoBreaks: UserStats[] = [
      {
        date: "2026-06-20",
        studyHours: 12,
        sleepHours: 5,
        waterIntake: 4,
        breakTime: 15, // less than 30 mins -> adds 25 points
      },
    ];

    const mockStatsGoodBreaks: UserStats[] = [
      {
        date: "2026-06-20",
        studyHours: 8,
        sleepHours: 8,
        waterIntake: 8,
        breakTime: 45, // >= 30 mins -> no extra burnout points
      },
    ];

    it("should return default value of 45 if no stats exist", () => {
      expect(calculateBurnoutScore([], [])).toBe(45);
    });

    it("should calculate higher risk for high study hours, low sleep hours, and short breaks", () => {
      // calculation: (12 * 8) - (5 * 6) + 25 = 96 - 30 + 25 = 91 points
      const score = calculateBurnoutScore(mockStatsNoBreaks, []);
      expect(score).toBe(91);
    });

    it("should calculate lower risk for balanced study, good sleep, and healthy break intervals", () => {
      // calculation: (8 * 8) - (8 * 6) + 0 = 64 - 48 + 0 = 16 points
      const score = calculateBurnoutScore(mockStatsGoodBreaks, []);
      expect(score).toBe(16);
    });

    it("should amplify burnout score if the latest journal suggests high physiological stress/anxiety triggers", () => {
      const mockJournals: JournalEntry[] = [
        {
          id: "j-1",
          date: "2026-06-20",
          text: "UPSC pre mocks did not go well...",
          mood: "😔",
          analysis: {
            anxiety: 80,
            fear: 70,
            stress: 90,
            burnoutRisk: 75,
            sentiment: "Negative",
            triggers: {
              top_trigger: "Mocks",
              secondary_trigger: "Sleep deprivation",
              confidence: 0.9,
            },
            explanation: "Overwhelmed with UPSC syllabus revisions.",
            emergencyTriggered: false,
          },
        },
      ];

      // Base: (8 * 8) - (8 * 6) + 0 = 16 points
      // Plus journal contribution: (80 + 90) / 3 = 170 / 3 = ~56.67 points
      // Total: 16 + 56.67 = ~72.67 -> bounded/rounded to 73
      const score = calculateBurnoutScore(mockStatsGoodBreaks, mockJournals);
      expect(score).toBe(73);
    });

    it("should bound scores strictly between 12 and 100", () => {
      const ultraBurnoutStats: UserStats[] = [
        {
          date: "2026-06-20",
          studyHours: 20, // (20 * 8) = 160
          sleepHours: 1,  // - (1 * 6) = 154
          waterIntake: 2,
          breakTime: 5,   // + 25 = 179
        }
      ];
      expect(calculateBurnoutScore(ultraBurnoutStats, [])).toBe(100);

      const superRelaxedStats: UserStats[] = [
        {
          date: "2026-06-20",
          studyHours: 1, // (1 * 8) = 8
          sleepHours: 10, // - (10 * 6) = -52
          waterIntake: 10,
          breakTime: 120, // + 0 = -52
        }
      ];

      expect(calculateBurnoutScore(superRelaxedStats, [])).toBe(12);
    });
  });
});
