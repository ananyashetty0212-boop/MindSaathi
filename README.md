# MindSaathi (মাインドসাথী) 🌿
### AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Care in the North Eastern Region (NER)
**Smart India Hackathon Problem Statement:** `SIH26003`

---

## 📌 Executive Summary

**MindSaathi** ("Companion of the Mind") is an assistive cognitive stimulation, prospective memory reinforcement, and family caregiver oversight platform designed specifically for elderly individuals experiencing age-related cognitive decline or dementia in India's **North Eastern Region (NER)**.

Unlike Western cognitive training software that presents unfamiliar symbols, rapid timers, and disorienting interfaces, MindSaathi incorporates:
* Culturally familiar regional motifs (Assam tea leaves, Kaziranga one-horned rhinos, Bihu Dhol drums, Kopou orchids, and Himalayan hills).
* Large touch ergonomics (minimum 54px–72px touch targets) with zero micro-navigation traps.
* High-contrast visual modes and multi-level font scaling.
* Localized voice guidance using native browser Web Speech API (zero paid speech APIs).
* An explainable, transparent **Adaptive Cognitive Engine** that calibrates puzzle complexity according to player pace and fatigue without medical pathologizing.
* Responsible medication confirmation workflows that clearly distinguish patient self-reporting from verified physical ingestion.

---

## ⚠️ Important Medical & Ethical Disclaimer

> **PLEASE NOTE:**  
> **MindSaathi is strictly an assistive cognitive stimulation and prospective memory companion platform. It is NOT a medical device, diagnostic system, or clinical decision tool.**  
> * It does **NOT** diagnose Alzheimer's disease, dementia, or any neurodegenerative condition.
> * Pressing **"I Took It"** logs a patient- or family-reported confirmation to assist family caregivers. It does **NOT** clinically verify physical medication ingestion.
> * All cognitive scores are assistive engagement metrics designed to adjust game difficulty gently and provide trend observations for families and doctors.

---

## 🎯 The Problem & Our Proposed Solution

### The Challenge in the North Eastern Region (NER)
1. **Cultural Alienation:** Elderly patients in Assam, Meghalaya, Arunachal Pradesh, and neighboring states find generic cognitive apps alienating when tasks feature Western cards or non-regional metaphors.
2. **Connectivity & Resource Constraints:** Intermittent hill connectivity makes cloud-dependent apps with paid external API tokens fragile and expensive.
3. **Ergonomic Barriers:** Tremors, reduced visual contrast sensitivity, and motor slowing make small buttons and complex menus frustrating.
4. **Caregiver Anxiety:** Family members living or working away from home need transparent, calm oversight of daily routines without intrusive surveillance.

### The MindSaathi Solution
* **Offline-First PWA:** Native Service Worker app shell caching + IndexedDB storage ensures games and reminders work without continuous internet.
* **Culturally Grounded Cognitive Gaming:** Memory Match and Pattern Recognition games inspired by North-Eastern heritage.
* **Transparent AI Engine:** An explainable heuristic model that adapts difficulty based on deliberate response latency, accuracy, hints, and error patterns.
* **Responsible Medication Tracking:** Clear confirmation states ("I Took It", "Remind Me Later", "I Skipped It") with gentle automated voice read-outs.
* **Analytical Caregiver Dashboard:** Visualized engagement trends, response latency distribution, and adherence rates powered by Recharts.

---


## 🔐 Family Authentication Flow

MindSaathi now separates caregiver access from the elderly experience:

1. **Caregiver registration** collects caregiver name, email, phone, relationship and password.
2. During registration, the caregiver also creates the **elderly profile** (name, age, language, region, emergency contact, routine and water goal).
3. MindSaathi generates a simple **4-digit Elder PIN**. The caregiver gives this PIN privately to the elderly user.
4. **Caregiver login:** email + password → caregiver dashboard.
5. **Elder login:** 4-digit PIN → simplified Elder Garden.
6. Game sessions and reminders are associated with the linked elderly profile rather than one hard-coded demo patient.
7. Authentication uses signed session tokens and password hashing with Node's built-in cryptography APIs, so no additional authentication package is required.

For local development without MongoDB, the existing in-memory fallback remains available. Local fallback accounts reset when the backend restarts.

## 🧠 Core Modules & Features

### 1. Elderly Dashboard (`/elderly`)
* Warm time-sensitive greeting using the signed-in elderly person's name.
* Giant high-contrast touch tiles:
  * **[ 🎮 Play Games ]**
  * **[ 💊 My Medicines (Due Count) ]**
  * **[ 💧 Drink Water (+1 Glass Logger) ]**
  * **[ 🌿 Today's Routine ]**
  * **[ 📞 Call Family (Direct Line Modal) ]**
* Native Web Speech API button: "Listen to Today's Update".
* Quick feeling / mood pulse check-in.

### 2. Cognitive Games Hub (`/games`)
* **Kaziranga Memory Match (`/games/memory`):** Playable 12-card paired association game with Assamese cultural symbols. Features gentle hints, elapsed stopwatch, and confetti completion.
* **Brahmaputra Pattern Sequence (`/games/pattern`):** Playable 4-pad rhythmic sequence recall game with Web Audio API sound synthesis and round progression.
* **Telemetry Reporting:** Submits completion telemetry to backend `POST /api/cognitive/evaluate` and displays instant Adaptive Engine feedback.

### 3. Responsible Reminders (`/reminders`)
* Structured for medicines, hydration, garden walks, and routine appointments.
* Non-coercive buttons:
  * **"I Took It"** (records confirmation timestamp)
  * **"Remind Me Later"** (snoozes for 15 minutes)
  * **"I Skipped It"** (logs skipped dose with immediate notification for family)
* Filter by category: All, Medicines, Water & Tea, Routine & Walk.

### 4. Caregiver Analytics Portal (`/caregiver`)
* Linked elderly profile overview using the caregiver's registered family data.
* 7-day Cognitive Engagement & Accuracy Trend chart (Recharts Line Chart).
* Today's Medication Confirmation Distribution (Recharts Donut/Pie Chart).
* Cognitive Engine telemetry table showing response latency, mistake counts, and recommended difficulty.
* Early anomaly detection alerts (e.g. "Response latency elevated; suggest morning sessions").

---

## ⚙️ AI Adaptive Cognitive Engine (ACE)

The **Adaptive Cognitive Engine** operates as an assistive service located at `backend/src/services/adaptiveEngine.js`.

### Telemetry Inputs:
$$\text{Performance Score} = w_a \cdot \text{Accuracy} + w_s \cdot \text{Speed} + w_m \cdot \text{MistakeScore} + w_h \cdot \text{Autonomy} + w_c \cdot \text{Completion}$$

* **Accuracy ($45\%$):** Percentage of correct pair selections or sequence taps.
* **Response Latency ($25\%$):** Evaluates deliberate elderly response pacing (1.5s–3.5s is optimal; $>7\text{s}$ indicates struggle/fatigue).
* **Mistakes & Errors ($15\%$):** Gentle penalty curve to avoid discouraging exploration.
* **Autonomy / Hints ($10\%$):** Evaluates reliance on hints.
* **Completion ($5\%$):** Full puzzle finish bonus.

### Dynamic Outputs:
* **Performance Score:** Normalized $0 - 100$ index.
* **Recommended Difficulty:** `EASY`, `MODERATE`, or `CHALLENGING`.
* **Activity Recommendation:** Contextual suggestion (e.g. switch from paired visual memory to calming rhythm sequence, or take a hydration break).
* **Anomaly Flag:** Highlights sudden drops ($>25\text{ pts}$) compared to patient baseline for caregiver review.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript, React Router 6 |
| **Styling** | Custom Vanilla CSS Design System, Responsive Glassmorphism, CSS Custom Properties |
| **Icons & Media** | Lucide React, Native SVG, Canvas Confetti |
| **Analytics** | Recharts (Responsive Line & Pie Charts) |
| **Voice / Audio** | Native Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext` sine tones) |
| **Offline / PWA** | Web App Manifest (`manifest.json`), Custom Cache Service Worker (`sw.js`), IndexedDB API (`db.js`) |
| **Backend** | Node.js (v20+ / v24), Express 4, Morgan logger, CORS |
| **Database** | MongoDB / Mongoose with automatic **In-Memory Fallback Store** (`mockDataStore.js`) |

---

## 📁 Project Structure

```
MindSaathi/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg          # MindSaathi lotus/brain emblem
│   │   ├── manifest.json        # PWA web manifest
│   │   └── sw.js                # Offline caching service worker
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── AudioSpeakButton.jsx  # Universal Web Speech voice reader
│   │   │       ├── MedicalDisclaimer.jsx # Ethical SIH26003 assistive banner
│   │   │       └── Navbar.jsx            # Header with accessibility controls
│   │   ├── context/
│   │   │   └── AccessibilityContext.jsx  # Contrast, font scale, patient state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Public intro & mission
│   │   │   ├── LoginPage.jsx             # Role switcher (Elderly vs Caregiver)
│   │   │   ├── ElderlyDashboard.jsx      # Big button calm dashboard
│   │   │   ├── GamesHub.jsx              # Games library
│   │   │   ├── MemoryMatchGame.jsx       # Kaziranga Memory Match game
│   │   │   ├── PatternRecognitionGame.jsx# Brahmaputra Pattern game
│   │   │   ├── RemindersPage.jsx         # Responsible medication page
│   │   │   └── CaregiverDashboard.jsx    # Analytics & Recharts dashboard
│   │   ├── services/
│   │   │   ├── api.js           # REST API client with local fallbacks
│   │   │   ├── db.js            # IndexedDB offline store
│   │   │   └── speechService.js # Native speech synthesis wrapper
│   │   ├── App.jsx              # Routing definition
│   │   ├── index.css            # Comprehensive accessible design tokens
│   │   └── main.jsx             # React DOM root & SW registration
│   ├── index.html
│   ├── package.json
│   └── vite.config.js           # Proxy to backend on port 5001
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # Mongoose connector with 3s fallback
│   │   ├── controllers/
│   │   │   ├── caregiverController.js # Aggregated analytics & alerts
│   │   │   ├── cognitiveController.js # Telemetry evaluation handler
│   │   │   └── reminderController.js  # Reminder status updater
│   │   ├── models/
│   │   │   ├── GameSession.js   # Mongoose session schema
│   │   │   └── Reminder.js      # Mongoose reminder schema
│   │   ├── routes/
│   │   │   ├── caregiverRoutes.js
│   │   │   ├── cognitiveRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   └── reminderRoutes.js
│   │   ├── services/
│   │   │   ├── adaptiveEngine.js # Explainable heuristic engine
│   │   │   └── mockDataStore.js  # In-memory store for instant zero-config run
│   │   └── server.js            # Express server entrypoint (Port 5001)
│   ├── .env                     # PORT=5001, MONGODB_URI
│   ├── .env.example
│   └── package.json
│
├── README.md                    # Project documentation
└── .gitignore                   # Git exclusion rules
```

---

## 🚀 How to Run MindSaathi Locally

MindSaathi is configured to run **right out of the box** without requiring any paid API keys or even a running MongoDB daemon (in-memory mode engages automatically).

### Prerequisites
* **Node.js**: v18 or higher (Tested on Node v24.18)
* **npm**: v9 or higher

---

### Step 1: Start the Backend Server

Open a terminal in the root directory:
```bash
cd backend
npm install       # (Already installed)
npm start
```
* The backend server will start on **`http://localhost:5001`**.
* Check health: Visit `http://localhost:5001/api/health` in your browser.

---

### Step 2: Start the Frontend Application

Open a second terminal in the root directory:
```bash
cd frontend
npm install       # (Already installed)
npm run dev
```
* Vite will start the frontend on **`http://localhost:5173`**.
* Open your browser and navigate to: **`http://localhost:5173`**.

---

### 🌐 Verified Application Routes

| URL Route | View Description |
|---|---|
| `/` | Landing page introducing MindSaathi and NER regional focus |
| `/login` | 1-tap profile selection (Elderly mode vs Caregiver mode) |
| `/elderly` | Accessible elderly dashboard with greeting, water logger, and speech update |
| `/games` | Cognitive games menu with difficulty badges |
| `/games/memory` | Playable Kaziranga Memory Match game with live telemetry scoring |
| `/games/pattern` | Playable Brahmaputra Pattern Sequence game with sound feedback |
| `/reminders` | Medication confirmations ("I Took It", "Remind Me Later", "I Skipped It") |
| `/caregiver` | Analytical dashboard with 7-day trends and medication adherence charts |

---

## 🛡️ MongoDB vs. In-Memory Graceful Fallback

* **With MongoDB running:** Set `MONGODB_URI=mongodb://localhost:27017/mindsaathi` in `backend/.env`. All game sessions and reminder changes persist to your Mongo collections.
* **Without MongoDB running:** If Mongo is offline, the backend catches the connection timeout within 3 seconds and automatically initializes an in-memory seed store populated with realistic patient data for *Bhaben Sharma (Guwahati, Assam)*. **Zero runtime crashes.**

---

*Built with care for Smart India Hackathon `SIH26003` — Empowering dignity, memory, and cognitive connection for our elders in the North East.*
