# ARTH Frontend Client

The frontend of **ARTH (अर्थ)** is an accessible, high-performance web interface designed for real-time two-way communication between Deaf/Hard-of-Hearing individuals and hearing individuals.

---

## Architecture & Design System

- **Strict Pure Light Theme**: Clean, medical-grade aesthetic utilizing pure white (`#FFFFFF`), slate backgrounds (`#F8FAFC`), deep indigo branding (`#4F46E5`), and emerald accents (`#10B981`). Zero dark mode or muddy contrast.
- **Pure Client-Side Computer Vision**: Powered by Google MediaPipe Hands tracking 21 3D joint landmarks in real-time at 30+ FPS directly in the browser canvas.
- **Natural Neural TTS Engine**: Crystal-clear Web Speech API synthesis with intelligent voice filtering (selecting Google/Microsoft natural neural voices), calibrated 0.92x cadence, and garbage-collection utterance shielding.
- **Strict Authentication Guard**: Immediate `<head>` inspection ensuring unauthenticated visitors cannot access the translator suite, redirecting seamlessly to the login gate.

---

## File Directory

| File | Description |
| :--- | :--- |
| `index.html` | High-converting landing page with interactive sign simulator, left drawer, feature cards, and strict login/signup modal. |
| `translator.html` | The complete ARTH workspace suite containing Sign-to-Voice, Voice-to-Sign, 2-Way Dialogue Bridge, Practice Shiksha, Sign Dictionary, and SOS Emergency. |
| `styles.css` | Comprehensive CSS styling system adhering strictly to pure light mode with soft shadows and fluid transitions. |
| `app.js` | MediaPipe camera pipeline, 21-landmark geometric sign classifier (`classifyRealHandGesture`), auto-lock timer, and TTS synthesis engine. |
| `api_client.js` | Full REST API client bridging frontend events with FastAPI endpoints and managing JWT token storage. |
| `signs_data.js` | Built-in sign dictionary containing 35+ core ISL/ASL everyday gestures and 26 A-Z fingerspeller SVG hand poses. |
| `mediapipe_hands.js` | Offline standalone Google MediaPipe Hands tracking engine. |
| `mediapipe_camera.js` | Offline MediaPipe Camera Utils framework for webcam frame capture. |
| `tailwindcss.min.js` | Standalone client-side Tailwind CSS compilation engine. |

---

## Running Locally

Open `index.html` via any local HTTP server or launch the root FastAPI server:
```bash
python server.py
```
Then navigate to:
- **Landing Webpage**: `http://localhost:3000/`
- **Translator Workspace**: `http://localhost:3000/translator` (requires authentication)
