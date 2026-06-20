import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { detectCrisis } from "./src/utils/helpers";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely, avoiding crashes if key is omitted.
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("MindMate AI: Gemini Client Initialized successfully.");
  } catch (err) {
    console.error("MindMate AI: Failed to initialize Gemini Client:", err);
  }
} else {
  console.warn("MindMate AI: GEMINI_API_KEY is not set. Running in simulation fallback mode.");
}

// 1. Journal Analysis Route
app.post("/api/analyze-journal", async (req, res) => {
  const { text, mood } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text content provided." });
  }

  // Quick emergency safety screen
  const isEmergency = detectCrisis(text);
  if (isEmergency) {
    return res.json({
      anxiety: 100,
      fear: 100,
      stress: 100,
      burnoutRisk: 100,
      sentiment: "Highly Negative - Crisis Warning",
      triggers: {
        top_trigger: "Severe Academic Dejection / Emotional Distress",
        secondary_trigger: "Immediate Support Required",
        confidence: 1.0
      },
      explanation: "EMERGENCY SAFETY SIGNALS ENCOUNTERED. Please read support guidelines immediately.",
      emergencyTriggered: true
    });
  }

  // Base simulation results if Gemini is unavailable
  const simulationResult = {
    anxiety: Math.min(100, Math.max(10, text.length % 50 + 35)),
    fear: Math.min(100, Math.max(10, text.length % 40 + 20)),
    stress: Math.min(100, Math.max(10, text.length % 60 + 40)),
    burnoutRisk: Math.min(100, Math.max(15, text.length % 70 + 30)),
    sentiment: text.length > 200 ? "Neutral" : "Reflective Negative",
    triggers: {
      top_trigger: "Mock Test Performance Anxiety",
      secondary_trigger: "Loss of Confidence during Revision",
      confidence: 0.85
    },
    explanation: "This is a fallback analysis. (Please set up your real GEMINI_API_KEY in Secrets for personalized real-time extraction). The entry hints at self-evaluation challenges and study schedule pressure.",
    emergencyTriggered: false
  };

  if (!ai) {
    return res.json(simulationResult);
  }

  try {
    const prompt = `Analyze this student journal entry. They are preparing for tough competitive exams.
Journal Text: "${text}"
Indicated Mood: ${mood}

Extract stress markers, burnout risk, and pinpoint precise academic/emotional triggers.
You MUST output your response strictly adhering to JSON format as requested in the schema.
Detect any severe crisis phrases and alert if necessary. Use high-stakes competitive exams context (like NEET, JEE, UPSC, GATE).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, clinical student mental health analyst. Evaluate journals for underlying pressures like parental expectations, mock test drops, or imposter syndrome.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anxiety: { type: Type.INTEGER, description: "Scale 0-100 indicating anxiety level." },
            fear: { type: Type.INTEGER, description: "Scale 0-100 indicating fear of failure." },
            stress: { type: Type.INTEGER, description: "Scale 0-100 indicating current stress." },
            burnoutRisk: { type: Type.INTEGER, description: "Scale 0-100 indicating burnout accumulation." },
            sentiment: { type: Type.STRING, description: "Overall sentiment classification, eg: Positive, Negative, Neutral" },
            triggers: {
              type: Type.OBJECT,
              properties: {
                top_trigger: { type: Type.STRING, description: "Direct pinpointed trigger, e.g., 'Peer comparison', 'Mock Scores', 'Lack of focus'" },
                secondary_trigger: { type: Type.STRING, description: "Secondary underlying factor, e.g., 'Sleep issues', 'Family pressure'" },
                confidence: { type: Type.NUMBER, description: "Detection confidence index between 0.0 and 1.0" }
              },
              required: ["top_trigger", "secondary_trigger", "confidence"]
            },
            explanation: { type: Type.STRING, description: "Empathetic, clear, brief clinical evaluation on why they might feel this way (1-2 sentences)." },
            emergencyTriggered: { type: Type.BOOLEAN, description: "True if signs of self-harm, quit life, or severe crisis are mentioned." }
          },
          required: ["anxiety", "fear", "stress", "burnoutRisk", "sentiment", "triggers", "explanation", "emergencyTriggered"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Gemini journal analysis error:", error);
    return res.json(simulationResult);
  }
});

// 2. Stress & Burnout Forecast Route
app.post("/api/forecast", async (req, res) => {
  const { journals, stats, goal } = req.body;

  // Static fallback if API key or data is sparse
  const simulationForecast = {
    prediction: "Mild Stress" as const,
    explanation: "Your recent revisions show stable focus, but sleep levels are dipping under 6 hours. Sunday's preparation cycles indicate a potential stress trigger before weekly mock evaluations. Rest is as vital as active recall."
  };

  if (!ai || !journals || journals.length === 0) {
    return res.json(simulationForecast);
  }

  try {
    const journalTextContext = journals.slice(-4).map((j: any) => `[Date: ${j.date}, Mood: ${j.mood}]: "${j.text}"`).join("\n");
    const statsContext = stats ? JSON.stringify(stats.slice(-4)) : "None provided";
    const examGoal = goal ? `${goal.targetExam} containing goals to ${goal.aspiration}` : "Unspecified Competitive Exam";

    const prompt = `Analyze the student's recent history to predict stress and burnout trends for the next 7 days.
Target Exam Details: ${examGoal}
Recent Journals:
${journalTextContext}

Recent Habits History (Study hours, sleep duration, health levels):
${statsContext}

Output a structured JSON response identifying future stress risks and providing a student-centric foresight warning. Ensure explanations mention potential spikes before mock exams.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an AI stress-forecasting wizard. Analyze weekly patterns (Sundays before mocks, sleep drops, heavy study blocks) to provide an accurate stress prediction.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { 
              type: Type.STRING, 
              description: "Must be exactly one of: 'Stable', 'Mild Stress', or 'Burnout Risk'" 
            },
            explanation: { 
              type: Type.STRING, 
              description: "A highly descriptive, empathetic explanation detailing weekly stress correlations (e.g. rises on weekends, sleep correlation)." 
            }
          },
          required: ["prediction", "explanation"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error) {
    console.error("Gemini stress forecast error:", error);
    return res.json(simulationForecast);
  }
});

// 3. AI Companion Chatbot Route
app.post("/api/companion", async (req, res) => {
  const { messages, journals, goal } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Conversational history required." });
  }

  const latestUserMsg = messages[messages.length - 1].text || "";

  // Urgent Emergency Support Intervention screen
  if (detectCrisis(latestUserMsg)) {
    return res.json({
      reply: "I am hear for you, and you are not alone in this. Competitive exams like NEET/JEE/UPSC can bring immense pressure, but your life is infinitely more precious than any scorecard. I want to encourage you to connect with someone who can support you right now. Please reach out to professional advisors immediately. You can reach India's Tele-MANAS at 14416 or the Vandrevala Foundation at +91 9999 666 555 for free support 24/7. Shall we take a slow, deep breath, and reach out to someone who loves you?"
    });
  }

  // Emulate interactive chat fallback if Gemini API is missing
  const goalStatement = goal ? `for your ${goal.targetExam} aspiration to ${goal.aspiration}` : "for your competitive exam preparation";
  const journalSummaryText = journals && journals.length > 0 
    ? `Your journal history mentions: "${journals[journals.length - 1].text.substring(0, 80)}..."` 
    : "No journals logged yet.";

  const simulationReply = `I hear you completely. High-stress preparations ${goalStatement} can feel completely overwhelming. ${journalSummaryText} Remember, one tough day of mock tests or low study scores doesn't define your true intelligence or wipe out the hard work of previous months. Let's reset together, try to aim for 7 hours of sleep tonight, and move one small step at a time!`;

  if (!ai) {
    return res.json({ reply: simulationReply });
  }

  try {
    const chatHistory = messages.slice(-10).map((m: any) => ({
      role: m.sender === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.text }]
    }));

    // Generate prompt with context
    const currentJournalContext = journals && journals.length > 0 
      ? `Student's Recent Journal Entries for context:\n` + journals.slice(-3).map((j: any) => `- ${j.text}`).join("\n")
      : "No journal history logged yet.";
    
    const goalContext = goal 
      ? `Goal: Ambition is to "${goal.aspiration}" via the ${goal.targetExam} exam.`
      : "Goal: Preparing for competitive national level exams.";

    const systemInstruction = `You are MindMate AI, an incredibly warm, gentle, and deeply empathetic AI mental health companion for students facing high-pressure national exams (NEET, JEE, UPSC, GATE, etc).
Your tone is conversational, supportive, encouraging, and completely non-judgmental.
Always hold their future aspiration in perspective: ${goalContext}
Use their recent insights if relevant: ${currentJournalContext}

If the user says things like "I wasted today" or similar self-sabotage thoughts, gently refute their academic guilt. Remind them of their goals dynamically (e.g., 'Your goal of ${goal ? goal.aspiration : "succeeding"} is still completely achievable. Today's setback does not erase months of effort').
Keep responses concise, warm, but profoundly human and compassionate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: latestUserMsg,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text || "I am right here with you. What is on your mind?";
    return res.json({ reply });
  } catch (error) {
    console.error("Gemini Chat Companion error:", error);
    return res.json({ reply: simulationReply });
  }
});

// 4. Daily Motivation Route
app.get("/api/motivation", async (req, res) => {
  const quotes = [
    { text: "Your preparation is a journey of endurance, not just scores. Give yourself permission to rest.", author: "MindMate Wellness" },
    { text: "Consistent micro-actions lead to macro-achievements. Focus only on the next 2 hours, not the final 100 days.", author: "Aspirant Guide" },
    { text: "Do not let mock exams define your identity. They are diagnostics, not final judgements.", author: "Empathetic Faculty" },
    { text: "The brightest steel is forged in the hottest fires. Your persistence is building deep cognitive resilience.", author: "UPSC Mentor" }
  ];
  const rand = quotes[Math.floor(Math.random() * quotes.length)];
  return res.json(rand);
});

// Setup Vite Dev server or Serve static files
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("MindMate AI: Running in Development mode with Vite middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("MindMate AI: Running in Production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MindMate AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

serveApp();
