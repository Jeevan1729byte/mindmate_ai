# MindMate AI
> *Your AI Companion for Stress-Free Exam Preparation*

MindMate AI is a production-quality, deeply empathetic mental well-being platform designed specifically for students facing high-stakes competitive examinations (NEET, JEE, UPSC, CAT, CUET, GATE). By utilizing high-fidelity server-side Google Gemini-3.5-flash prompts and interactive habit correlations, MindMate uncovers hidden stress triggers that normal mood trackers fail to notice.

---

## 🎨 Design Philosophy & Themes
- **Calming Glassmorphism Theme**: Clean, translucent slate-colored cards paired with soft emerald, indigo, and purple highlight bubbles that soothe optic strain.
- **Spaces & Contoured Rhythm**: High typographic variation utilizing "Inter" for high UI legible contrast paired with "JetBrains Mono" precision layouts.
- **Responsive & Touch-Friendly**: Clean layout scaling from fluid desktop viewports down to high-stakes mobile grids.

---

## 🚀 Key Modules & Capabilities

### 1. AI Journaling & Implicit Stress-Level Mapping (`src/components/Journal.tsx`)
- Allows students to type or record voice thoughts freely.
- Coordinates server-side safe Gemini prompts to isolate underlying academic forces, imposter spikes, and emotional dejection.
- Under Trigger analysis, outputs structured JSON displaying confidence thresholds.

### 2. Coping Sanctuary (`src/components/Coping.tsx`)
- **Navy SEALS Somatic Box Breather**: A structural 4s inhale, 4s hold, 4s exhale, 4s hold somatic breathing ring to instantly offset test alarms.
- **Focus Pomodoro Timer**: Balanced interval trackers with audio beeps and visual indicators.
- **Desk Stretch Guides**: 4 rapid-access biomechanic routines (Optic palming, Neck rolls, Shoulder adjustments).

### 3. Integrated Insights Dashboard (`src/components/Dashboard.tsx`)
- **Burnout Predictor**: Algorithmic burnout index (0-100%) checking study duration, rest stability, and recent diary sentiments.
- **AI Exam Stress Forecast**: Smart 1-week predictive forecasts outlining anticipated weekend pressure.
- **Mood changes with Gemini explanations**: Displays progressive emotional logs alongside smart, contextual AI breakdowns.
- **Dynamic Vector Charts**: Interactively displays Study Hours vs. Sleep Hours vs. Stress curves.

### 4. Interactive Testing Verification Suite (`src/components/Testing.tsx`)
- Simulation unit tests detailing **Jest** and **Pytest** specifications for testing coverage, asserting 100% test-green robustness.

---

## 🔒 Security & Accessibility Controls
- **OWASP-10 Express Proxy Server (`server.ts`)**: Shields the private `GEMINI_API_KEY` server-side so keys are never exposed browser-client side.
- **Emergency Crisis Interventions**: Detects crisis tripwords (e.g., self-harm indications) to instantly direct attention to professional networks (Tele-MANAS, Vandrevala Foundation).
- **Accessibility Scaler**: Font Scale control panel adjusting overall reading size natively (small, base, large, x-large).

---

## 🛠️ Developer Setup & Procedures

1. **Install Base Packages**:
   ```bash
   npm install
   ```

2. **Establish Environment Parameters (`.env`)**:
   ```env
   GEMINI_API_KEY="your-google-api-key-here"
   APP_URL="http://localhost:3000"
   ```

3. **Launch in Development**:
   ```bash
   npm run dev
   ```

4. **Production Compilation**:
   ```bash
   npm run build
   npm run start
   ```
