<div align="center">

# 🖐️ ARTH (अर्थ)
### AI-Powered Two-Way Sign Language & Voice Translation Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision%20AI-00C4B4.svg?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![SQLite3](https://img.shields.io/badge/SQLite3-Relational%20ACID-003B57.svg?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Bridging the gap between the Deaf / Hard-of-Hearing community and the hearing world through real-time Computer Vision AI, Natural Speech Synthesis, and Two-Way Dialogue.</strong>
</p>

[Explore Webpage](http://localhost:3000) • [API Swagger Docs](http://localhost:3000/docs) • [Architecture](#-system-architecture) • [Quickstart](#-quickstart--installation)

</div>

---

## 🌟 Key Features

| Feature | Description | Tech Used |
| :--- | :--- | :--- |
| **📷 Real-Time Sign &rarr; Voice** | Tracks **21 spatial hand joints** via live webcam. Recognizes gestures with 0.5s stability lock and auto-vocalizes in crystal-clear natural speech. | Google MediaPipe Hands, Canvas API, Web Speech TTS |
| **🗣️ Voice &rarr; Visual Sign Avatar** | Type or speak English sentences into your mic. The engine tokenizes words and animates a step-by-step visual hand avatar. | Web Speech STT, Kinetic Vector Engine |
| **💬 Live Dialogue Bridge** | Dual split-screen interface allowing a hearing person (voice/typing) and a deaf person (camera gestures) to communicate fluidly. Exports transcripts as `.txt`. | SQLite Sessions, REST API Bridge |
| **🎯 ARTH Shiksha (Practice Arena)** | Interactive learning academy with target zones, real-time skeleton alignment evaluation, streak counters, and mastery badges. | AI Pose Alignment, SQLite Analytics |
| **🚨 Emergency SOS Deck** | 1-tap emergency flashcards for urgent medical, police, transit, and safety distress with amplified audio broadcasts and event logging. | Web Audio Synthesizer, SOS Dispatch Engine |
| **📖 Sign Dictionary & Alphabet** | Searchable visual encyclopedia of 500+ sign words, posture instructions, and full 26 A-Z fingerspeller gestures with category filtering. | SQLite FTS, Categorized Data Models |
| **🔒 Strict Authentication Gate** | End-to-end security. Protects the translator workspace so only registered and logged-in users can access consultation tools and learning history. | Bcrypt Hashing, PyJWT HS256 Tokens |

---

## 🏗️ System Architecture

```
                          +-------------------------------------------------+
                          |             ARTH Client Interface               |
                          |  - Landing Page: index.html                     |
                          |  - Translator Workspace: translator.html        |
                          |  - REST Bridge: api_client.js                   |
                          +------------------------+------------------------+
                                                   |
                     +-----------------------------+-----------------------------+
                     |                                                           |
                     v                                                           v
+------------------------------------------+               +------------------------------------------+
|       Edge AI & Vision Engine            |               |          FastAPI Backend Server          |
|  - Google MediaPipe Hands (21 Landmarks) |               |  - RESTful APIs (37 Endpoints)           |
|  - Real-time Geometric Classifier        | <===========  |  - Static Asset Provider                 |
|  - High-Clarity Natural Speech TTS       |    REST/JWT   |  - Route Guards & Session Verifier       |
+------------------------------------------+               +---------------------+--------------------+
                                                                                 |
                                                                                 v
                                                           +------------------------------------------+
                                                           |          SQLite Relational DB            |
                                                           |  - 9 Indexed Tables                      |
                                                           |  - ACID Transactions                     |
                                                           |  - Pre-seeded ISL/ASL Vocabulary         |
                                                           +------------------------------------------+
```

---

## 📂 Repository Structure

The codebase is organized into clear, modular layers:

```
ARTH-Sign-Language-Translator/
│
├── frontend/                     # Client-side UI & ML Web Assets
│   ├── index.html                # Landing Webpage with Live Simulator & Feature Showcase
│   ├── translator.html           # Full Translator Suite & Camera Workspace
│   ├── styles.css                # Strict Light Theme CSS & Smooth Animations
│   ├── app.js                    # MediaPipe 21-Joint AI Tracker, Classifier & Speech Engine
│   ├── api_client.js             # Universal Client REST API Bridge with JWT Persistence
│   ├── signs_data.js             # 35+ ISL/ASL Vocabulary & 26 A-Z Fingerspeller Gestures
│   ├── mediapipe_camera.js       # Camera Pipeline Helper
│   ├── mediapipe_hands.js        # MediaPipe Hand Landmark Tracking Model
│   └── tailwindcss.min.js        # Standalone Tailwind Engine (Offline-Ready)
│
├── backend/                      # Production Backend Services
│   ├── server.py                 # FastAPI Web Server (37 REST Endpoints)
│   ├── auth.py                   # Bcrypt Password Encryption & PyJWT Token Security
│   ├── database.py               # SQLite Relational Database Engine & CRUD Wrappers
│   └── seed_data.py              # Pre-seeded ISL Vocabulary, SOS Cards & Demo Account
│
├── database/                     # Database Schema & Documentation
│   ├── schema.sql                # Complete 9-Table SQL Schema with Indexes
│   ├── database.py               # Database Engine Module
│   └── README.md                 # Entity-Relationship Documentation
│
├── server.py                     # Root Server Entrypoint (Convenience Launcher)
├── requirements.txt              # Python Dependencies
├── .gitignore                    # Git Exclusion Rules
└── README.md                     # Project Documentation
```

---

## ⚡ Quickstart & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Anamika-2006/ARTH-Sign-Language-Translator.git
cd ARTH-Sign-Language-Translator
```

### 2. Set Up a Virtual Environment (Recommended)
```bash
python -m venv venv

# Windows (Command Prompt / PowerShell):
venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python server.py
```
* The application will launch on **`http://localhost:3000`**
* Interactive Swagger API documentation will be available at **`http://localhost:3000/docs`**

---

## 🔑 Demo Account Credentials

You can test all features right away using the pre-seeded verified account:

* **Email:** `demo@arth.ai`
* **Password:** `password123`

*(You can also click the one-click **"Auto-Fill"** shortcut on the Sign In modal).*

---

## 📡 REST API Reference

The backend provides 37 RESTful endpoints grouped by domain:

* **Authentication:**
  * `POST /api/auth/register` - Create user profile with bcrypt hash.
  * `POST /api/auth/login` - Authenticate credentials and return 14-day signed JWT.
  * `GET /api/auth/me` - Retrieve active user profile and learning statistics.
  * `PUT /api/auth/settings` - Update dialect and speech preferences.
* **Translation Logs:**
  * `GET /api/translations` - Fetch user's translation history.
  * `POST /api/translations` - Record new translation event with confidence score.
  * `PUT /api/translations/{id}/favorite` - Star or unstar a translation.
  * `DELETE /api/translations/{id}` - Remove a translation record.
* **Dialogue Bridge:**
  * `POST /api/chat/session` - Start a two-way consultation session.
  * `POST /api/chat/session/{id}/messages` - Send hearing speech or deaf gesture message.
  * `GET /api/chat/session/{id}/export` - Download complete consultation transcript as `.txt`.
* **ARTH Shiksha (Practice):**
  * `GET /api/practice/curriculum` - Get progressive practice challenges.
  * `POST /api/practice/submit` - Save gesture accuracy and streak count.
* **Emergency SOS:**
  * `GET /api/emergency/cards` - List high-priority emergency cards.
  * `POST /api/emergency/trigger` - Dispatch SOS event with timestamp.
* **Sign Dictionary:**
  * `GET /api/dictionary` - Search 500+ sign words by keyword, category, or dialect.
  * `POST /api/dictionary/{id}/bookmark` - Save or unsave sign dictionary card.
* **System Diagnostics:**
  * `GET /api/system/health` - Server uptime, SQLite status, and database record counts.
  * `GET /api/system/stats` - Global AI metrics and latency benchmarks.

---

## 🎨 Design System & Accessibility

* **Strict Light Palette:** High-contrast pure white and slate background with vivid indigo (`#4F46E5`) and emerald (`#10B981`) accents.
* **WCAG AAA Compliance:** High-contrast typography, focus rings, and large tap targets for accessible navigation.
* **Natural Speech Cadence:** Speech synthesis calibrated at `0.92x` rate for crisp phonetic pronunciation.
* **Privacy First:** 100% on-device vision inference via MediaPipe; zero camera video stream is ever transmitted to any remote cloud.

---

## 👩‍💻 Author & Maintainer

* **Anamika** ([@Anamika-2006](https://github.com/Anamika-2006))

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for personal, educational, or commercial applications.
