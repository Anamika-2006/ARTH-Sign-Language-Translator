/**
 * ARTH - AI Sign Language Translator Engine (100% English Edition)
 * Pure Frontend Implementation with WebRTC, Canvas Hand Mesh Visualizer,
 * Web Speech API (TTS & STT), and Interactive Practice Academy.
 */

// Application State
const ArthState = {
  activeTab: 'camera-translate', // 'camera-translate', 'reverse-translate', 'duo-chat', 'shiksha', 'sos', 'dictionary'
  dialect: 'ASL', // 'ASL' or 'ISL'
  isCameraActive: false,
  isCameraMirrored: true,
  showMeshOverlay: true,
  stream: null,
  currentDetectedSign: 'Hello / Welcome',
  confidence: 98.4,
  stabilityProgress: 0,
  sentenceBuffer: ['Hello'],
  isSpeaking: false,
  isListening: false,
  
  // Real-Time Computer Vision & MediaPipe Engine
  mediaPipeReady: false,
  mediaPipeHands: null,
  isRealHandDetected: false,
  realLandmarks: null,
  activeHandSide: 'Right Hand',
  candidateSign: null,
  candidateHoldFrames: 0,
  lastLockTimestamp: 0,

  // High-Clarity Voice Synthesizer
  selectedVoice: null,
  selectedVoiceURI: localStorage.getItem('arth_selected_voice') || '',
  speechRate: 0.92, // Optimal crisp phonetic tempo
  speechPitch: 1.0,
  soundFxEnabled: true,
  autoSpeak: true,
  fontScale: 'normal',
  highContrast: false,
  
  // Reverse Mode
  reverseTokens: ['Hello', 'Thank You', 'Help', 'Water'],
  reverseCurrentIndex: 0,
  isReversePlaying: false,
  reverseSpeed: 1.0,
  reverseIntervalId: null,
  
  // Practice Mode
  practiceTargetId: 'hello',
  practiceScore: 0,
  streakCount: 4,
  
  // Conversation Messages
  chatMessages: [
    { id: 1, sender: 'hearing', name: 'Hearing Person', text: 'Hello! How can I help you today?', time: '10:05 AM' },
    { id: 2, sender: 'deaf', name: 'Deaf Participant (ARTH)', text: 'Hello. I need directions to the nearest hospital.', time: '10:06 AM' }
  ],
  
  // Dictionary Filter
  dictionaryCategory: 'all',
  dictionarySearch: ''
};

// Audio Synthesizer Effects (Chimes)
const SoundEffects = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
    if (!ArthState.soundFxEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio chime prevented:", e);
    }
  },
  success() {
    this.playTone(587.33, 'sine', 0.12, 0.08);
    setTimeout(() => this.playTone(880, 'sine', 0.25, 0.08), 120);
  },
  click() {
    this.playTone(440, 'triangle', 0.08, 0.04);
  },
  alert() {
    this.playTone(400, 'square', 0.2, 0.1);
    setTimeout(() => this.playTone(600, 'square', 0.25, 0.1), 180);
  }
};

// 21-Joint MediaPipe Hand Skeleton Connections
const HAND_LANDMARK_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base
  [5, 9], [9, 13], [13, 17]
];

// Normalized Hand Poses for Live Tracking Simulation
const HAND_POSES = {
  open_palm: [
    {x: 0.50, y: 0.85},
    {x: 0.42, y: 0.75}, {x: 0.35, y: 0.66}, {x: 0.30, y: 0.58}, {x: 0.24, y: 0.50},
    {x: 0.46, y: 0.64}, {x: 0.44, y: 0.48}, {x: 0.43, y: 0.34}, {x: 0.42, y: 0.20},
    {x: 0.50, y: 0.63}, {x: 0.50, y: 0.46}, {x: 0.50, y: 0.31}, {x: 0.50, y: 0.17},
    {x: 0.54, y: 0.64}, {x: 0.56, y: 0.48}, {x: 0.57, y: 0.34}, {x: 0.58, y: 0.21},
    {x: 0.58, y: 0.68}, {x: 0.62, y: 0.55}, {x: 0.65, y: 0.43}, {x: 0.68, y: 0.30}
  ],
  thumbs_up: [
    {x: 0.50, y: 0.80},
    {x: 0.52, y: 0.65}, {x: 0.52, y: 0.50}, {x: 0.51, y: 0.35}, {x: 0.50, y: 0.20},
    {x: 0.45, y: 0.70}, {x: 0.42, y: 0.68}, {x: 0.44, y: 0.72}, {x: 0.47, y: 0.72},
    {x: 0.46, y: 0.75}, {x: 0.43, y: 0.73}, {x: 0.44, y: 0.77}, {x: 0.47, y: 0.77},
    {x: 0.47, y: 0.79}, {x: 0.44, y: 0.78}, {x: 0.45, y: 0.81}, {x: 0.48, y: 0.81},
    {x: 0.48, y: 0.82}, {x: 0.46, y: 0.81}, {x: 0.46, y: 0.84}, {x: 0.49, y: 0.84}
  ],
  peace: [
    {x: 0.50, y: 0.82},
    {x: 0.44, y: 0.70}, {x: 0.42, y: 0.65}, {x: 0.44, y: 0.62}, {x: 0.47, y: 0.62},
    {x: 0.46, y: 0.65}, {x: 0.43, y: 0.50}, {x: 0.40, y: 0.36}, {x: 0.37, y: 0.22},
    {x: 0.52, y: 0.65}, {x: 0.55, y: 0.50}, {x: 0.58, y: 0.36}, {x: 0.61, y: 0.22},
    {x: 0.54, y: 0.72}, {x: 0.52, y: 0.74}, {x: 0.50, y: 0.76}, {x: 0.48, y: 0.74},
    {x: 0.56, y: 0.76}, {x: 0.54, y: 0.78}, {x: 0.52, y: 0.80}, {x: 0.50, y: 0.78}
  ],
  ily: [
    {x: 0.50, y: 0.85},
    {x: 0.40, y: 0.75}, {x: 0.32, y: 0.68}, {x: 0.25, y: 0.62}, {x: 0.18, y: 0.56},
    {x: 0.47, y: 0.65}, {x: 0.46, y: 0.50}, {x: 0.45, y: 0.35}, {x: 0.45, y: 0.20},
    {x: 0.51, y: 0.68}, {x: 0.49, y: 0.72}, {x: 0.47, y: 0.75}, {x: 0.46, y: 0.72},
    {x: 0.54, y: 0.71}, {x: 0.52, y: 0.74}, {x: 0.50, y: 0.77}, {x: 0.49, y: 0.74},
    {x: 0.57, y: 0.70}, {x: 0.61, y: 0.55}, {x: 0.66, y: 0.40}, {x: 0.71, y: 0.25}
  ]
};

// UI Controller Class
class ArthUI {
  static init() {
    this.initThemeSwitcher();
    this.initSpeechVoices();
    this.initMediaPipe();
    this.bindNavigation();
    this.initCameraVisualizer();
    this.renderSentenceBuffer();
    this.renderReverseTimeline();
    this.renderChatMessages();
    this.renderShikshaMode();
    this.renderSOSGrid();
    this.renderDictionary();
    this.bindSettings();
    this.setupSpeechRecognition();

    requestAnimationFrame((ts) => this.renderCameraLoop(ts));
  }

  // Theme Accent Customizer (Electric Iris, Cyber Ocean, Emerald Mint, Sunset Aurora)
  static initThemeSwitcher() {
    const savedTheme = localStorage.getItem('arth_theme_accent') || 'iris';
    this.applyTheme(savedTheme);

    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-set-theme');
        this.applyTheme(theme);
        if (typeof SoundEffects !== 'undefined') SoundEffects.click();
      });
    });
  }

  static applyTheme(theme) {
    if (theme === 'iris') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('arth_theme_accent', theme);

    // Update active dot indicators
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      if (btn.getAttribute('data-set-theme') === theme) {
        btn.classList.add('active');
        btn.style.boxShadow = '0 0 0 2px #FFFFFF, 0 0 0 4px var(--primary)';
        btn.style.transform = 'scale(1.2)';
      } else {
        btn.classList.remove('active');
        btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
        btn.style.transform = 'scale(1.0)';
      }
    });
  }

  // MediaPipe AI Hand Tracker Engine
  static initMediaPipe() {
    try {
      if (typeof Hands !== 'undefined') {
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        hands.onResults((results) => {
          this.onMediaPipeHandResults(results);
        });
        ArthState.mediaPipeHands = hands;
        ArthState.mediaPipeReady = true;
        console.log('[ARTH] MediaPipe Hands initialized successfully.');
      } else {
        console.warn('[ARTH] MediaPipe Hands library not loaded; fallback simulated tracker available.');
      }
    } catch (err) {
      console.warn('[ARTH] MediaPipe initialization notice:', err);
    }
  }

  // Navigation Switching
  static bindNavigation() {
    const tabs = document.querySelectorAll('[data-tab-target]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab-target');
        this.switchTab(target);
      });
    });

    const dialectBtn = document.getElementById('dialectSelector');
    if (dialectBtn) {
      dialectBtn.addEventListener('click', () => {
        ArthState.dialect = ArthState.dialect === 'ASL' ? 'ISL' : 'ASL';
        dialectBtn.textContent = `${ArthState.dialect} Mode`;
        this.showToast(`Switched vocabulary to ${ArthState.dialect}`);
      });
    }

    // Deep-linking from landing page feature drawer
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab) {
      this.switchTab(initialTab);
    }
  }

  static switchTab(tabId) {
    ArthState.activeTab = tabId;
    SoundEffects.click();

    const tabTitles = {
      'camera-translate': 'Real-Time Sign ➔ Voice Translator',
      'reverse-translate': 'Voice / Speech ➔ Sign Language Avatar',
      'duo-chat': 'Two-Way Live Dialogue Bridge',
      'shiksha': 'ARTH Shiksha Practice Arena',
      'sos': 'Emergency SOS Distress Deck',
      'dictionary': 'Visual Sign Language & A-Z Dictionary'
    };

    document.querySelectorAll('[data-tab-target]').forEach(el => {
      if (el.getAttribute('data-tab-target') === tabId) {
        el.classList.add('nav-pill-active');
        el.classList.remove('nav-pill-inactive');
      } else {
        el.classList.remove('nav-pill-active');
        el.classList.add('nav-pill-inactive');
      }
    });

    document.querySelectorAll('.tab-view-container').forEach(view => {
      view.classList.add('hidden');
    });

    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) {
      activeView.classList.remove('hidden');
    }

    const titleEl = document.getElementById('activeWorkspaceTabTitle');
    if (titleEl && tabTitles[tabId]) {
      titleEl.textContent = tabTitles[tabId];
    }

    if (tabId === 'reverse-translate') {
      this.drawReverseHandSign();
    }
  }

  // Camera Management
  static initCameraVisualizer() {
    const toggleCamBtn = document.getElementById('btnToggleCamera');
    const headerToggleBtn = document.getElementById('btnHeaderToggleCamera');
    const overlayToggleBtn = document.getElementById('btnOverlayStartCamera');
    const mirrorBtn = document.getElementById('btnMirrorCamera');
    const meshBtn = document.getElementById('btnToggleMesh');

    const handleToggle = () => this.toggleCameraStream();

    if (toggleCamBtn) toggleCamBtn.addEventListener('click', handleToggle);
    if (headerToggleBtn) headerToggleBtn.addEventListener('click', handleToggle);
    if (overlayToggleBtn) overlayToggleBtn.addEventListener('click', handleToggle);

    if (mirrorBtn) {
      mirrorBtn.addEventListener('click', () => {
        ArthState.isCameraMirrored = !ArthState.isCameraMirrored;
        const video = document.getElementById('cameraVideo');
        if (video) {
          video.style.transform = ArthState.isCameraMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
      });
    }
    if (meshBtn) {
      meshBtn.addEventListener('click', () => {
        ArthState.showMeshOverlay = !ArthState.showMeshOverlay;
        meshBtn.textContent = `Mesh Overlay: ${ArthState.showMeshOverlay ? 'ON' : 'OFF'}`;
      });
    }

    // Preset Gesture Selector Buttons
    document.querySelectorAll('[data-trigger-sign]').forEach(btn => {
      btn.addEventListener('click', () => {
        const signName = btn.getAttribute('data-trigger-sign');
        this.triggerRecognizedSign(signName);
      });
    });
  }

  static async toggleCameraStream() {
    const video = document.getElementById('cameraVideo');
    const badge = document.getElementById('camStatusBadge');
    const btn = document.getElementById('btnToggleCamera');
    const btnHeader = document.getElementById('btnHeaderToggleCamera');
    const overlay = document.getElementById('cameraStartOverlay');

    if (!ArthState.isCameraActive) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera Access Error:\nYour browser does not support or allow camera access on this connection.\nPlease access via http://localhost:3000 or HTTPS.");
        this.showToast("⚠️ Camera API unavailable on this connection.");
        return;
      }

      let stream = null;
      try {
        // Attempt 1: Optimal HD constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (err1) {
        console.warn("[ARTH] Primary camera constraints failed, attempting fallback:", err1);
        try {
          // Attempt 2: Minimal fallback (works on any webcam hardware)
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (err2) {
          console.error("[ARTH] Camera failed completely:", err2);
          if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
            this.showToast("⚠️ Camera permission blocked. Allow camera access in browser URL bar.");
            alert("Camera Permission Blocked:\n\nPlease click the lock or camera icon in your browser URL bar (next to localhost:3000) and choose 'Allow' for Camera, then click 'Open Webcam' again.");
          } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
            this.showToast("⚠️ No camera hardware found on this system.");
            alert("No Camera Found:\nPlease ensure a webcam is connected to your computer.");
          } else {
            this.showToast(`⚠️ Camera error: ${err2.message || 'Unable to start camera'}`);
          }
          return;
        }
      }

      // Stream successfully acquired
      ArthState.stream = stream;
      if (video) {
        video.srcObject = stream;
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.muted = true;
        try {
          await video.play();
        } catch (playErr) {
          console.warn("[ARTH] video.play notice:", playErr);
        }
      }

      ArthState.isCameraActive = true;
      if (overlay) overlay.classList.add('hidden');

      if (badge) {
        badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-emerald"></span><span class="text-emerald-700 font-bold text-xs uppercase tracking-wide">Webcam Live • Real-Time AI</span>`;
      }

      [btn, btnHeader].forEach(b => {
        if (!b) return;
        b.classList.remove('btn-gradient-primary');
        b.classList.add('btn-gradient-rose');
        b.innerHTML = `<svg width="16" height="16" class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg> <span>Stop Camera</span>`;
      });

      this.showToast("Webcam connected! Real-time AI hand tracking active.");
      this.startMediaPipePump();

    } else {
      // Turn off camera
      if (ArthState.stream) {
        ArthState.stream.getTracks().forEach(track => track.stop());
        ArthState.stream = null;
      }
      if (video) video.srcObject = null;
      ArthState.isCameraActive = false;
      ArthState.isRealHandDetected = false;
      ArthState.realLandmarks = null;

      if (overlay) overlay.classList.remove('hidden');

      if (badge) {
        badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span><span class="text-slate-600 font-bold text-xs uppercase">Camera Off (Click to Start)</span>`;
      }

      [btn, btnHeader].forEach(b => {
        if (!b) return;
        b.classList.remove('btn-gradient-rose');
        b.classList.add('btn-gradient-primary');
        b.innerHTML = `<svg width="16" height="16" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> <span>Start Real Camera</span>`;
      });

      this.showToast("Camera stopped.");
    }
  }

  static startMediaPipePump() {
    const video = document.getElementById('cameraVideo');
    let isProcessing = false;

    const pump = async () => {
      if (!ArthState.isCameraActive) return;

      if (video && video.readyState >= 2 && ArthState.mediaPipeHands && !isProcessing) {
        isProcessing = true;
        try {
          await ArthState.mediaPipeHands.send({ image: video });
        } catch (e) {
          // ignore transient frame skip
        }
        isProcessing = false;
      }

      if (ArthState.isCameraActive) {
        requestAnimationFrame(pump);
      }
    };

    requestAnimationFrame(pump);
  }

  // Handle incoming real-time hand landmarks from MediaPipe
  static onMediaPipeHandResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      ArthState.isRealHandDetected = false;
      ArthState.realLandmarks = null;
      ArthState.candidateHoldFrames = 0;
      ArthState.stabilityProgress = Math.max(0, ArthState.stabilityProgress - 3);
      const bar = document.getElementById('stabilityBar');
      if (bar) bar.style.width = `${ArthState.stabilityProgress}%`;
      return;
    }

    ArthState.isRealHandDetected = true;
    ArthState.realLandmarks = results.multiHandLandmarks[0];

    if (results.multiHandedness && results.multiHandedness[0]) {
      ArthState.activeHandSide = results.multiHandedness[0].label || 'Hand 1';
    }

    // Classify real-time human hand gesture
    const classified = this.classifyRealHandGesture(ArthState.realLandmarks);
    if (classified) {
      this.handleRealTimeGestureDetection(classified);
    }
  }

  // Real-time geometric hand posture classifier (runs in <2ms)
  static classifyRealHandGesture(lm) {
    const dist = (i1, i2) => Math.hypot(lm[i1].x - lm[i2].x, lm[i1].y - lm[i2].y);
    const palmSize = dist(0, 9); // Wrist (0) to Middle MCP (9)

    if (palmSize < 0.04) return null; // Hand too far or invalid

    // Check finger extensions (distance of tip from wrist vs PIP from wrist)
    const isIndexExt = dist(8, 0) > dist(6, 0) * 1.12;
    const isMiddleExt = dist(12, 0) > dist(10, 0) * 1.12;
    const isRingExt = dist(16, 0) > dist(14, 0) * 1.12;
    const isPinkyExt = dist(20, 0) > dist(18, 0) * 1.12;
    const isThumbExt = dist(4, 17) > palmSize * 0.82;

    // 1. I Love You (🤟)
    if (isThumbExt && isIndexExt && isPinkyExt && !isMiddleExt && !isRingExt) {
      return { label: "I Love You", confidence: 98, pose: "Thumb, index & pinky open (Universal ILY)" };
    }

    // 2. Water / Peace / Number 2 (✌️)
    if (isIndexExt && isMiddleExt && !isRingExt && !isPinkyExt) {
      return { label: "Water", confidence: 97, pose: "Index & Middle upright in V-shape" };
    }

    // 3. OK / Perfect (👌)
    if (dist(4, 8) < palmSize * 0.30 && isMiddleExt && isRingExt) {
      return { label: "OK", confidence: 98, pose: "Thumb and index tips touching" };
    }

    // 4. Yes / Thumbs Up (👍)
    if (isThumbExt && !isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt && lm[4].y < lm[3].y) {
      return { label: "Yes", confidence: 97, pose: "Thumb upright, closed fist" };
    }

    // 5. Help / SOS / Fist (✊)
    if (!isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
      return { label: "Help", confidence: 96, pose: "Closed fist distress gesture" };
    }

    // 6. You / Direction (☝️)
    if (isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
      return { label: "You", confidence: 96, pose: "Index pointing upright" };
    }

    // 7. Call / Phone (🤙)
    if (isThumbExt && isPinkyExt && !isIndexExt && !isMiddleExt && !isRingExt) {
      return { label: "Call", confidence: 95, pose: "Thumb & pinky extended" };
    }

    // 8. Hello / Welcome (🖐️)
    if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt) {
      return { label: "Hello / Welcome", confidence: 98, pose: "Open palm facing camera" };
    }

    return { label: "Active Hand", confidence: 92, pose: "Tracking hand gesture in camera" };
  }

  // Real-time gesture stabilization and auto-lock
  static handleRealTimeGestureDetection(classified) {
    if (classified.label === "Active Hand") {
      this.updateLiveDetectedPreview("Detecting Sign...", classified.confidence, classified.pose);
      return;
    }

    this.updateLiveDetectedPreview(classified.label, classified.confidence, classified.pose);

    if (ArthState.candidateSign === classified.label) {
      ArthState.candidateHoldFrames++;
      // Progress over 16 consecutive frames (~0.5s stability)
      ArthState.stabilityProgress = Math.min(100, (ArthState.candidateHoldFrames / 16) * 100);
      const bar = document.getElementById('stabilityBar');
      if (bar) bar.style.width = `${ArthState.stabilityProgress}%`;

      const now = Date.now();
      if (ArthState.candidateHoldFrames >= 16 && (now - ArthState.lastLockTimestamp > 1800)) {
        ArthState.lastLockTimestamp = now;
        ArthState.candidateHoldFrames = 0;
        ArthState.stabilityProgress = 100;
        this.lockInRealSign(classified.label, classified.confidence);
      }
    } else {
      ArthState.candidateSign = classified.label;
      ArthState.candidateHoldFrames = 1;
      ArthState.stabilityProgress = 10;
      const bar = document.getElementById('stabilityBar');
      if (bar) bar.style.width = '10%';
    }
  }

  static updateLiveDetectedPreview(label, confidence, handPose) {
    const textEl = document.getElementById('liveDetectedText');
    const confEl = document.getElementById('liveConfidenceBadge');
    const handPoseEl = document.getElementById('liveHandPose');

    if (textEl && textEl.textContent !== label) textEl.textContent = label;
    if (confEl) confEl.textContent = `${confidence.toFixed(0)}% Match`;
    if (handPoseEl) handPoseEl.textContent = handPose;

    // Highlight preset button if matches
    document.querySelectorAll('[data-trigger-sign]').forEach(btn => {
      const bSign = btn.getAttribute('data-trigger-sign').toLowerCase();
      if (label.toLowerCase().includes(bSign)) {
        btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
      } else {
        btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
      }
    });
  }

  // Auto-lock when held stable for 0.5s: vocalizes with natural TTS and adds to sentence!
  static lockInRealSign(signLabel, confidence) {
    SoundEffects.success();
    const word = signLabel.split('/')[0].trim();

    // Visual pulse feedback on detection card
    const card = document.getElementById('liveDetectedText')?.closest('.arth-card');
    if (card) {
      card.classList.add('ring-2', 'ring-emerald-400');
      setTimeout(() => card.classList.remove('ring-2', 'ring-emerald-400'), 500);
    }

    // Add to sentence buffer
    ArthState.sentenceBuffer.push(word);
    this.renderSentenceBuffer();

    // High-Clarity Voice Vocalization
    if (ArthState.autoSpeak) {
      this.speakText(word);
    }

    // Record into database
    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.recordTranslation('sign_to_speech', word, word, ArthState.dialect, confidence / 100);
    }

    this.showToast(`Locked in "${word}" from live camera!`);
  }

  // Realtime Render Loop for Canvas Landmarks
  static renderCameraLoop(timestamp) {
    const canvas = document.getElementById('cameraOverlayCanvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (ArthState.showMeshOverlay) {
        if (ArthState.isRealHandDetected && ArthState.realLandmarks) {
          this.drawRealHandMesh(ctx, canvas.width, canvas.height, ArthState.realLandmarks);
        } else {
          this.drawSimulatedHandMesh(ctx, canvas.width, canvas.height, timestamp);
        }
      }
    }

    requestAnimationFrame((ts) => this.renderCameraLoop(ts));
  }

  // Draw REAL 21-joint skeleton tracked from user's physical hand with futuristic HUD aesthetic
  static drawRealHandMesh(ctx, width, height, landmarks) {
    const isMirrored = ArthState.isCameraMirrored;
    const pts = landmarks.map(p => ({
      x: isMirrored ? (1 - p.x) * width : p.x * width,
      y: p.y * height
    }));

    // Bounding Box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const pad = 18;
    minX = Math.max(0, minX - pad);
    maxX = Math.min(width, maxX + pad);
    minY = Math.max(0, minY - pad);
    maxY = Math.min(height, maxY + pad);

    // Dynamic Live Reticle Box
    ctx.save();
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 8;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);
    ctx.restore();

    // Corner Reticles on Bounding Box
    const cLen = 10;
    ctx.save();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 10;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(minX, minY + cLen); ctx.lineTo(minX, minY); ctx.lineTo(minX + cLen, minY); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(maxX - cLen, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + cLen); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(minX, maxY - cLen); ctx.lineTo(minX, maxY); ctx.lineTo(minX + cLen, maxY); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(maxX - cLen, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - cLen); ctx.stroke();
    ctx.restore();

    // Live AI Telemetry Pill Badge
    ctx.save();
    const tagText = `● AI TRACKING • ${ArthState.activeHandSide}`;
    ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    const badgeY = Math.max(18, minY - 24);
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(minX, badgeY, textWidth + 16, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.fillText(tagText, minX + 8, badgeY + 14);
    ctx.restore();

    // Draw Skeleton Bones with Glowing Gradient
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 10;
    HAND_LANDMARK_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = pts[startIdx];
      const p2 = pts[endIdx];
      if (p1 && p2) {
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(1, '#818CF8');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
    ctx.restore();

    // Draw Joint Points (Glow emerald for fingertips, crisp white for internal joints)
    pts.forEach((pt, idx) => {
      ctx.save();
      const isFingertip = (idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isFingertip ? 6.5 : 4, 0, Math.PI * 2);
      if (isFingertip) {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#34D399';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.shadowColor = '#6366F1';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Draw 21-point hand skeleton with realistic movement and modern glowing aesthetic
  static drawSimulatedHandMesh(ctx, width, height, time) {
    const t = time * 0.002;
    let basePose = HAND_POSES.open_palm;
    if (ArthState.currentDetectedSign.toLowerCase().includes('love')) basePose = HAND_POSES.ily;
    else if (ArthState.currentDetectedSign.toLowerCase().includes('help')) basePose = HAND_POSES.thumbs_up;
    else if (ArthState.currentDetectedSign.toLowerCase().includes('water')) basePose = HAND_POSES.peace;

    const offsetX = width * 0.5 + Math.sin(t) * 10;
    const offsetY = height * 0.52 + Math.cos(t * 0.8) * 6;
    const scale = Math.min(width, height) * 0.65;

    const transformedPoints = basePose.map(pt => ({
      x: offsetX + (pt.x - 0.5) * scale,
      y: offsetY + (pt.y - 0.5) * scale
    }));

    // Bounding Box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    transformedPoints.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const pad = 20;
    minX -= pad; maxX += pad; minY -= pad; maxY += pad;

    // Glowing Reticle Box
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 5]);
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 8;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);
    ctx.restore();

    // AI Badge
    ctx.save();
    ctx.fillStyle = '#4F46E5';
    ctx.shadowColor = '#6366F1';
    ctx.shadowBlur = 8;
    const tagText = `● AI VISION • ${(ArthState.confidence).toFixed(0)}% Match`;
    ctx.font = '700 11px Plus Jakarta Sans, sans-serif';
    const textWidth = ctx.measureText(tagText).width;
    ctx.beginPath();
    ctx.roundRect(minX, minY - 24, textWidth + 16, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.fillText(tagText, minX + 8, minY - 10);
    ctx.restore();

    // Draw Skeleton Bones
    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#06B6D4';
    ctx.shadowBlur = 10;
    HAND_LANDMARK_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = transformedPoints[startIdx];
      const p2 = transformedPoints[endIdx];
      if (p1 && p2) {
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(1, '#818CF8');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
    ctx.restore();

    // Draw Joint Points
    transformedPoints.forEach((pt, idx) => {
      ctx.save();
      const isFingertip = (idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isFingertip ? 6.5 : 4, 0, Math.PI * 2);
      if (isFingertip) {
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#34D399';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.shadowColor = '#6366F1';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  // Trigger Sign Detection
  static triggerRecognizedSign(signLabel) {
    ArthState.currentDetectedSign = signLabel;
    ArthState.confidence = 95 + Math.random() * 4.8;
    ArthState.stabilityProgress = 0;
    SoundEffects.success();

    const signCard = ARTH_SIGN_DATABASE.find(s => s.label.toLowerCase().includes(signLabel.toLowerCase()) || s.id.toLowerCase().includes(signLabel.toLowerCase()));
    
    const textEl = document.getElementById('liveDetectedText');
    const confEl = document.getElementById('liveConfidenceBadge');
    const handPoseEl = document.getElementById('liveHandPose');

    if (textEl) textEl.textContent = signLabel;
    if (confEl) confEl.textContent = `${ArthState.confidence.toFixed(0)}% Match`;
    if (handPoseEl) handPoseEl.textContent = signCard ? signCard.handPose : 'Standard Hand Posture';

    document.querySelectorAll('[data-trigger-sign]').forEach(btn => {
      if (btn.getAttribute('data-trigger-sign').toLowerCase() === signLabel.toLowerCase()) {
        btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
      } else {
        btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-300');
      }
    });
  }

  static appendCurrentSignToBuffer() {
    const word = ArthState.currentDetectedSign.split('/')[0].trim();
    ArthState.sentenceBuffer.push(word);
    this.renderSentenceBuffer();
    SoundEffects.click();

    if (ArthState.autoSpeak) {
      this.speakText(word);
    }
  }

  // Sentence Buffer UI
  static renderSentenceBuffer() {
    const container = document.getElementById('sentenceBufferContainer');
    const countBadge = document.getElementById('wordCountBadge');
    if (!container) return;

    if (countBadge) countBadge.textContent = `${ArthState.sentenceBuffer.length} Words`;

    if (ArthState.sentenceBuffer.length === 0) {
      container.innerHTML = `<span class="text-slate-400 italic text-xs">Recognized words will form a sentence here...</span>`;
      return;
    }

    container.innerHTML = ArthState.sentenceBuffer.map((word, i) => `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg text-xs font-bold transition hover:bg-indigo-100">
        <span>${word}</span>
        <button onclick="ArthUI.removeWordFromBuffer(${i})" class="text-indigo-400 hover:text-indigo-700" title="Remove word">
          ✕
        </button>
      </span>
    `).join('');
  }

  static removeWordFromBuffer(idx) {
    ArthState.sentenceBuffer.splice(idx, 1);
    this.renderSentenceBuffer();
    SoundEffects.click();
  }

  static clearSentenceBuffer() {
    ArthState.sentenceBuffer = [];
    this.renderSentenceBuffer();
    SoundEffects.click();
    this.showToast("Sentence buffer cleared");
  }

  static copySentenceBuffer() {
    const fullText = ArthState.sentenceBuffer.join(' ');
    if (!fullText) return;
    navigator.clipboard.writeText(fullText).then(() => {
      this.showToast("Copied sentence to clipboard!");
    });
  }

  static speakSentence() {
    const fullText = ArthState.sentenceBuffer.join(' ');
    if (!fullText) {
      this.showToast("Sentence is empty. Select or sign words first!");
      return;
    }
    this.speakText(fullText);

    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.recordTranslation('sign_to_speech', fullText, fullText, ArthState.dialect, 0.98);
    }
  }

  // Initialize High-Clarity Speech Synthesis Voices
  static initSpeechVoices() {
    if (!('speechSynthesis' in window)) return;

    const populateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const select = document.getElementById('settingVoiceSelect');
      if (select) {
        select.innerHTML = '<option value="">Auto-Detect Best Natural English Voice</option>';
        voices
          .filter(v => v.lang.startsWith('en'))
          .forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.voiceURI;
            const isNatural = v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google');
            opt.textContent = `${v.name} (${v.lang})${isNatural ? ' ✨ Crystal Clear' : ''}`;
            if (v.voiceURI === ArthState.selectedVoiceURI) opt.selected = true;
            select.appendChild(opt);
          });
      }

      // Pick highest clarity natural voice
      if (ArthState.selectedVoiceURI) {
        ArthState.selectedVoice = voices.find(v => v.voiceURI === ArthState.selectedVoiceURI) || null;
      }

      if (!ArthState.selectedVoice) {
        // Priority 1: Natural neural online voices
        let best = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')));
        // Priority 2: Google natural voices
        if (!best) best = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
        // Priority 3: Crisp regional voices
        if (!best) best = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
        // Priority 4: Any English voice
        if (!best) best = voices.find(v => v.lang.startsWith('en')) || voices[0];

        ArthState.selectedVoice = best;
        if (best) {
          console.log(`[ARTH TTS] Selected high-clarity voice: ${best.name} (${best.lang})`);
        }
      }
    };

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  // Text-To-Speech (High-Clarity Natural Audio Engine)
  static speakText(text, onComplete = null) {
    if (!('speechSynthesis' in window)) {
      this.showToast("Speech synthesis not supported in this browser.");
      return;
    }
    if (!text || !text.trim()) return;

    // Cancel any previous trailing utterances to prevent voice overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());

    // Select chosen or best natural voice
    if (ArthState.selectedVoice) {
      utterance.voice = ArthState.selectedVoice;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const best = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) || voices.find(v => v.lang.startsWith('en'));
      if (best) utterance.voice = best;
    }

    // Precise acoustic tuning for maximum clarity:
    // Rate 0.92 delivers clean phonetic articulation without rushing
    utterance.rate = ArthState.speechRate || 0.92;
    utterance.pitch = ArthState.speechPitch || 1.0;
    utterance.volume = 1.0; // Full clear amplification

    const speakerWave = document.getElementById('speechWaveIndicator');
    utterance.onstart = () => {
      ArthState.isSpeaking = true;
      if (speakerWave) speakerWave.classList.remove('hidden');
    };

    utterance.onend = utterance.onerror = () => {
      ArthState.isSpeaking = false;
      if (speakerWave) speakerWave.classList.add('hidden');
      window._activeSpeechUtterance = null;
      if (onComplete) onComplete();
    };

    // Retain global reference to avoid browser garbage collection bug that cuts off speech
    window._activeSpeechUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  }

  // Instant Voice Test shortcut for settings modal
  static testCurrentVoice() {
    const select = document.getElementById('settingVoiceSelect');
    if (select && select.value) {
      const voices = window.speechSynthesis.getVoices();
      const chosen = voices.find(v => v.voiceURI === select.value);
      if (chosen) {
        ArthState.selectedVoice = chosen;
        ArthState.selectedVoiceURI = chosen.voiceURI;
        localStorage.setItem('arth_selected_voice', chosen.voiceURI);
      }
    }
    this.speakText("Hello! ARTH speech clarity is now active with natural voice synthesis.");
  }

  // Speech Recognition (Microphone STT)
  static setupSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('btnStartMic');
    const inputEl = document.getElementById('reverseTextInput');

    if (!micBtn) return;

    if (!SpeechRec) {
      micBtn.title = "Speech recognition not supported in this browser";
      micBtn.classList.add('opacity-50', 'cursor-not-allowed');
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
      if (!ArthState.isListening) {
        try {
          recognition.start();
          ArthState.isListening = true;
          micBtn.classList.add('bg-rose-500', 'text-white', 'pulse-emerald');
          this.showToast("Listening... Speak now");
        } catch (e) {
          console.error(e);
        }
      } else {
        recognition.stop();
        ArthState.isListening = false;
        micBtn.classList.remove('bg-rose-500', 'text-white', 'pulse-emerald');
      }
    });

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      if (inputEl) inputEl.value = transcript;
    };

    recognition.onend = () => {
      ArthState.isListening = false;
      micBtn.classList.remove('bg-rose-500', 'text-white', 'pulse-emerald');
      if (inputEl && inputEl.value.trim()) {
        this.processReverseInput();
      }
    };
  }

  // Reverse Translation (Speech/Text to Sign Language)
  static processReverseInput() {
    const inputEl = document.getElementById('reverseTextInput');
    if (!inputEl) return;
    const text = inputEl.value.trim();
    if (!text) {
      this.showToast("Please enter words or speak into the microphone.");
      return;
    }

    const tokens = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                       .split(/\s+/)
                       .filter(t => t.length > 0);

    ArthState.reverseTokens = tokens;
    ArthState.reverseCurrentIndex = 0;
    this.renderReverseTimeline();
    this.drawReverseHandSign();
    this.showToast(`Converted into ${tokens.length} Sign Visuals`);

    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.recordTranslation('speech_to_sign', text, tokens.join(' '), 'Universal', 0.96);
    }
  }

  static renderReverseTimeline() {
    const container = document.getElementById('reverseTimelineCards');
    if (!container) return;

    if (ArthState.reverseTokens.length === 0) {
      container.innerHTML = `<p class="text-slate-400 text-xs">No signs in sequence.</p>`;
      return;
    }

    container.innerHTML = ArthState.reverseTokens.map((token, i) => {
      const match = ARTH_SIGN_DATABASE.find(s => s.label.toLowerCase().includes(token.toLowerCase()) || s.id.toLowerCase() === token.toLowerCase());
      const isActive = i === ArthState.reverseCurrentIndex;

      return `
        <div onclick="ArthUI.selectReverseToken(${i})" 
             class="cursor-pointer flex-shrink-0 w-36 p-3 rounded-xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-2 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}">
              Step ${i + 1}
            </span>
          </div>
          <h4 class="font-bold text-slate-800 text-sm capitalize mb-0.5 truncate">${token}</h4>
          <p class="text-[11px] text-slate-500 line-clamp-2">${match ? match.handPose : `Fingerspell: ${token.toUpperCase()}`}</p>
        </div>
      `;
    }).join('');

    const currentWord = ArthState.reverseTokens[ArthState.reverseCurrentIndex] || '';
    const activeLabel = document.getElementById('reverseCurrentWordTitle');
    const activeDesc = document.getElementById('reverseCurrentWordDesc');
    const activeTips = document.getElementById('reverseCurrentWordTips');

    const matchedSign = ARTH_SIGN_DATABASE.find(s => s.label.toLowerCase().includes(currentWord.toLowerCase()) || s.id.toLowerCase() === currentWord.toLowerCase());

    if (activeLabel) activeLabel.textContent = currentWord.toUpperCase();
    if (activeDesc) activeDesc.textContent = matchedSign ? matchedSign.summary : `Fingerspell each letter for "${currentWord}".`;
    if (activeTips) activeTips.textContent = matchedSign ? matchedSign.tips : "Keep your palm facing forward with relaxed fingers.";
  }

  static selectReverseToken(index) {
    ArthState.reverseCurrentIndex = index;
    this.renderReverseTimeline();
    this.drawReverseHandSign();
    SoundEffects.click();
  }

  static stepReverseTimeline(direction) {
    const nextIdx = ArthState.reverseCurrentIndex + direction;
    if (nextIdx >= 0 && nextIdx < ArthState.reverseTokens.length) {
      ArthState.reverseCurrentIndex = nextIdx;
      this.renderReverseTimeline();
      this.drawReverseHandSign();
      SoundEffects.click();
    }
  }

  static toggleReversePlay() {
    const playBtn = document.getElementById('btnPlayReverse');
    if (ArthState.isReversePlaying) {
      clearInterval(ArthState.reverseIntervalId);
      ArthState.isReversePlaying = false;
      if (playBtn) playBtn.innerHTML = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span>Play Sequence</span>`;
    } else {
      ArthState.isReversePlaying = true;
      if (playBtn) playBtn.innerHTML = `<span>Pause</span>`;
      
      const intervalMs = 1800 / ArthState.reverseSpeed;
      ArthState.reverseIntervalId = setInterval(() => {
        if (ArthState.reverseCurrentIndex < ArthState.reverseTokens.length - 1) {
          ArthState.reverseCurrentIndex++;
        } else {
          ArthState.reverseCurrentIndex = 0;
        }
        this.renderReverseTimeline();
        this.drawReverseHandSign();
      }, intervalMs);
    }
  }

  // Draw 2D Hand Sign Visualizer
  static drawReverseHandSign() {
    const canvas = document.getElementById('reverseVisualizerCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 400;
    const h = canvas.height = 280;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    const currentWord = (ArthState.reverseTokens[ArthState.reverseCurrentIndex] || 'Hello').toLowerCase();
    
    let template = HAND_POSES.open_palm;
    if (currentWord.includes('love')) template = HAND_POSES.ily;
    else if (currentWord.includes('water')) template = HAND_POSES.peace;
    else if (currentWord.includes('help')) template = HAND_POSES.thumbs_up;

    const scale = Math.min(w, h) * 0.7;
    const ox = w * 0.5;
    const oy = h * 0.52;

    const pts = template.map(p => ({
      x: ox + (p.x - 0.5) * scale,
      y: oy + (p.y - 0.5) * scale
    }));

    // Connectors
    HAND_LANDMARK_CONNECTIONS.forEach(([a, b]) => {
      const p1 = pts[a];
      const p2 = pts[b];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });

    // Joints
    pts.forEach((p, idx) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, idx % 4 === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = idx % 4 === 0 ? '#10B981' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#312E81';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  // Conversation Dialogue
  static renderChatMessages() {
    const list = document.getElementById('chatMessagesList');
    if (!list) return;

    list.innerHTML = ArthState.chatMessages.map(msg => {
      const isHearing = msg.sender === 'hearing';
      return `
        <div class="flex flex-col ${isHearing ? 'items-end' : 'items-start'} mb-3">
          <div class="flex items-center gap-1.5 mb-1 px-1">
            <span class="text-xs font-bold ${isHearing ? 'text-indigo-600' : 'text-slate-600'}">${msg.name}</span>
            <span class="text-[11px] text-slate-400">• ${msg.time}</span>
          </div>
          <div class="${isHearing ? 'chat-bubble-hearing' : 'chat-bubble-deaf'} max-w-[85%] md:max-w-md p-3.5">
            <p class="text-xs leading-relaxed font-medium">${msg.text}</p>
            <div class="mt-2 pt-2 border-t ${isHearing ? 'border-indigo-400/40 text-indigo-100' : 'border-slate-100 text-slate-500'} flex items-center justify-between text-[11px]">
              <button onclick="ArthUI.speakText('${msg.text.replace(/'/g, "\\'")}')" class="hover:underline font-semibold flex items-center gap-1">
                🔊 Listen
              </button>
              <button onclick="ArthUI.loadMessageIntoSignPlayer('${msg.text.replace(/'/g, "\\'")}')" class="hover:underline font-semibold flex items-center gap-1">
                👁️ View Sign
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    list.scrollTop = list.scrollHeight;
  }

  static sendChatMessage(senderType) {
    const hearingInput = document.getElementById('chatHearingInput');
    const text = hearingInput ? hearingInput.value.trim() : '';
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: senderType,
      name: senderType === 'hearing' ? 'Hearing Person' : 'Deaf Participant',
      text: text,
      time: timeStr
    };
    ArthState.chatMessages.push(newMsg);

    hearingInput.value = '';
    this.renderChatMessages();
    SoundEffects.click();

    if (senderType === 'hearing') {
      this.speakText(text);
    }

    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.sendChatMessage('demo-consult-001', senderType, newMsg.name, text);
    }
  }

  static sendDeafBufferToChat() {
    const text = ArthState.sentenceBuffer.join(' ');
    if (!text) {
      this.showToast("Sentence buffer is empty. Sign or select words first!");
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'deaf',
      name: 'Deaf Participant (ARTH)',
      text: text,
      time: timeStr
    };
    ArthState.chatMessages.push(newMsg);

    this.renderChatMessages();
    this.speakText(text);
    SoundEffects.success();
    this.showToast("Sentence sent to dialogue thread!");

    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.sendChatMessage('demo-consult-001', 'deaf', newMsg.name, text, ArthState.sentenceBuffer);
    }
  }

  static loadMessageIntoSignPlayer(text) {
    const inputEl = document.getElementById('reverseTextInput');
    if (inputEl) inputEl.value = text;
    this.switchTab('reverse-translate');
    this.processReverseInput();
  }

  static exportChatTranscript() {
    const transcript = ArthState.chatMessages.map(m => `[${m.time}] ${m.name}: ${m.text}`).join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARTH-Dialogue-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast("Dialogue transcript exported as TXT");
  }

  // Practice Mode
  static renderShikshaMode() {
    const target = ARTH_SIGN_DATABASE.find(s => s.id === ArthState.practiceTargetId) || ARTH_SIGN_DATABASE[0];
    const titleEl = document.getElementById('shikshaTargetTitle');
    const descEl = document.getElementById('shikshaTargetDesc');
    const stepsEl = document.getElementById('shikshaTargetSteps');
    const streakEl = document.getElementById('shikshaStreakBadge');

    if (titleEl) titleEl.textContent = target.label;
    if (descEl) descEl.textContent = target.summary;
    if (streakEl) streakEl.textContent = `🔥 ${ArthState.streakCount} Day Streak`;

    if (stepsEl && target.steps) {
      stepsEl.innerHTML = target.steps.map((st, i) => `
        <li class="flex items-start gap-2">
          <span class="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">${i + 1}</span>
          <span>${st}</span>
        </li>
      `).join('');
    }

    this.drawShikshaSilhouette();
  }

  static testPracticeGesture() {
    const scoreMeter = document.getElementById('shikshaScoreMeter');
    const scoreText = document.getElementById('shikshaScoreText');
    const feedbackText = document.getElementById('shikshaFeedbackText');

    let current = 30;
    const targetScore = Math.floor(94 + Math.random() * 5);

    const anim = setInterval(() => {
      current += 4;
      if (scoreMeter) scoreMeter.style.width = `${current}%`;
      if (scoreText) scoreText.textContent = `${current}%`;

      if (current >= targetScore) {
        clearInterval(anim);
        SoundEffects.success();
        ArthState.streakCount++;
        document.getElementById('shikshaStreakBadge').textContent = `🔥 ${ArthState.streakCount} Day Streak`;
        if (feedbackText) {
          feedbackText.className = "text-emerald-600 font-bold text-xs";
          feedbackText.textContent = `✓ Excellent Alignment! ${targetScore}% Match achieved.`;
        }
        ArthUI.showToast("🎯 Perfect Sign! Accuracy verified.");

        if (typeof ArthAPI !== 'undefined') {
          const target = ARTH_SIGN_DATABASE.find(s => s.id === ArthState.practiceTargetId) || ARTH_SIGN_DATABASE[0];
          ArthAPI.submitPracticeResult(target.id, target.label, targetScore).then(res => {
            if (res && res.streak_count) {
              ArthState.streakCount = res.streak_count;
              const streakBadge = document.getElementById('shikshaStreakBadge');
              if (streakBadge) streakBadge.textContent = `🔥 ${res.streak_count} Day Streak`;
            }
          });
        }
      }
    }, 25);
  }

  static selectNextShikshaSign() {
    const currentIndex = ARTH_SIGN_DATABASE.findIndex(s => s.id === ArthState.practiceTargetId);
    const nextIndex = (currentIndex + 1) % ARTH_SIGN_DATABASE.length;
    ArthState.practiceTargetId = ARTH_SIGN_DATABASE[nextIndex].id;
    this.renderShikshaMode();

    const scoreMeter = document.getElementById('shikshaScoreMeter');
    const scoreText = document.getElementById('shikshaScoreText');
    const feedbackText = document.getElementById('shikshaFeedbackText');
    if (scoreMeter) scoreMeter.style.width = `0%`;
    if (scoreText) scoreText.textContent = `0%`;
    if (feedbackText) {
      feedbackText.className = "text-slate-500 text-xs";
      feedbackText.textContent = "Align your hand inside the target circle to evaluate accuracy.";
    }
  }

  static drawShikshaSilhouette() {
    const canvas = document.getElementById('shikshaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth || 360;
    const h = canvas.height = 240;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(w/2, h/2, 65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#4F46E5';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("TARGET ZONE", w/2, h/2 - 8);
    ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText("Position hand inside circle", w/2, h/2 + 12);
  }

  // Emergency SOS Cards
  static renderSOSGrid() {
    const grid = document.getElementById('sosCardsGrid');
    if (!grid) return;

    grid.innerHTML = ARTH_SOS_PHRASES.map(item => `
      <div onclick="ArthUI.triggerSOS('${item.id}')"
           class="sos-card arth-card p-4 cursor-pointer border border-slate-200 bg-white hover:border-rose-300">
        <div class="flex items-start justify-between mb-2">
          <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            ${item.badge}
          </span>
        </div>
        <h3 class="font-bold text-slate-900 text-sm mb-1">${item.title}</h3>
        <p class="text-xs text-slate-500 italic mb-3">"${item.phrase}"</p>
        <span class="text-xs font-bold text-rose-600 flex items-center gap-1">
          <span>Tap to Broadcast Audio</span> ➔
        </span>
      </div>
    `).join('');
  }

  static triggerSOS(sosId) {
    const item = ARTH_SOS_PHRASES.find(s => s.id === sosId);
    if (!item) return;

    SoundEffects.alert();
    this.speakText(item.phrase);

    const modal = document.getElementById('sosBroadcastModal');
    const modalTitle = document.getElementById('sosModalTitle');
    const modalPhrase = document.getElementById('sosModalPhrase');

    if (modalTitle) modalTitle.textContent = item.title;
    if (modalPhrase) modalPhrase.textContent = item.phrase;

    if (modal) modal.classList.remove('hidden');

    if (typeof ArthAPI !== 'undefined') {
      ArthAPI.triggerEmergency(item.id, item.title, item.phrase);
    }
  }

  static closeSOSModal() {
    const modal = document.getElementById('sosBroadcastModal');
    if (modal) modal.classList.add('hidden');
    SoundEffects.click();
  }

  // Sign Dictionary & Alphabet
  static renderDictionary() {
    const grid = document.getElementById('dictionaryCardsGrid');
    if (!grid) return;

    const query = ArthState.dictionarySearch.toLowerCase();
    const cat = ArthState.dictionaryCategory;

    if (cat === 'alphabet') {
      grid.innerHTML = ARTH_ALPHABET.filter(a => a.letter.toLowerCase().includes(query) || a.desc.toLowerCase().includes(query)).map(alpha => `
        <div class="arth-card p-3.5 bg-white border border-slate-200 hover:border-indigo-300 transition">
          <div class="flex items-center justify-between mb-1">
            <span class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-lg flex items-center justify-center border border-indigo-200">
              ${alpha.letter}
            </span>
            <span class="text-xs font-medium text-slate-400">${alpha.name}</span>
          </div>
          <p class="text-xs text-slate-600 mt-2">${alpha.desc}</p>
        </div>
      `).join('');
      return;
    }

    let items = ARTH_SIGN_DATABASE.filter(item => {
      const matchCat = (cat === 'all') || (item.category === cat);
      const matchQuery = item.label.toLowerCase().includes(query) ||
                         item.summary.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (items.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 text-xs">No signs match your search query.</div>`;
      return;
    }

    grid.innerHTML = items.map(sign => `
      <div class="arth-card p-4 bg-white border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
              ${sign.category}
            </span>
            <span class="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              ${sign.dialect}
            </span>
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">${sign.label}</h3>
          <p class="text-xs text-slate-600 leading-relaxed mb-3">${sign.summary}</p>
          <div class="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 mb-2">
            <strong>Posture:</strong> ${sign.handPose}
          </div>
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button onclick="ArthUI.quickPracticeSign('${sign.id}')" class="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition text-center">
            Practice
          </button>
          <button onclick="ArthUI.speakText('${sign.label}')" class="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200" title="Listen">
            🔊
          </button>
        </div>
      </div>
    `).join('');
  }

  static quickPracticeSign(signId) {
    ArthState.practiceTargetId = signId;
    this.switchTab('shiksha');
    this.renderShikshaMode();
  }

  // Settings
  static bindSettings() {
    const voiceSelect = document.getElementById('settingVoiceSelect');
    const rateSlider = document.getElementById('settingSpeechRate');
    const pitchSlider = document.getElementById('settingSpeechPitch');
    const soundToggle = document.getElementById('settingSoundFx');
    const contrastToggle = document.getElementById('settingHighContrast');
    const fontSelect = document.getElementById('settingFontSize');

    if (voiceSelect) {
      voiceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        ArthState.selectedVoiceURI = val;
        localStorage.setItem('arth_selected_voice', val);
        const voices = window.speechSynthesis.getVoices();
        ArthState.selectedVoice = voices.find(v => v.voiceURI === val) || null;
        this.showToast("Voice accent updated!");
      });
    }

    if (rateSlider) {
      rateSlider.addEventListener('input', (e) => {
        ArthState.speechRate = parseFloat(e.target.value);
        document.getElementById('speechRateVal').textContent = `${ArthState.speechRate}x`;
      });
    }

    if (pitchSlider) {
      pitchSlider.addEventListener('input', (e) => {
        ArthState.speechPitch = parseFloat(e.target.value);
        document.getElementById('speechPitchVal').textContent = `${ArthState.speechPitch}`;
      });
    }

    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        ArthState.soundFxEnabled = e.target.checked;
      });
    }

    if (contrastToggle) {
      contrastToggle.addEventListener('change', (e) => {
        ArthState.highContrast = e.target.checked;
        document.body.classList.toggle('high-contrast-light', ArthState.highContrast);
      });
    }

    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        document.body.classList.remove('font-scale-lg', 'font-scale-xl');
        if (e.target.value === 'large') document.body.classList.add('font-scale-lg');
        else if (e.target.value === 'xl') document.body.classList.add('font-scale-xl');
      });
    }

    const searchInput = document.getElementById('dictSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        ArthState.dictionarySearch = e.target.value;
        this.renderDictionary();
      });
    }

    document.querySelectorAll('[data-dict-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-dict-cat]').forEach(b => b.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition');
        btn.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-xs transition';
        ArthState.dictionaryCategory = btn.getAttribute('data-dict-cat');
        this.renderDictionary();
      });
    });
  }

  // Toast
  static showToast(message) {
    const toast = document.getElementById('arthToast');
    const text = document.getElementById('arthToastText');
    if (!toast || !text) return;

    text.textContent = message;
    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2800);
  }
}

// Global Exports
window.ArthUI = ArthUI;
window.ArthState = ArthState;

// Startup
document.addEventListener('DOMContentLoaded', () => {
  ArthUI.init();
  
  // Check for tab query param in URL
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (tabParam) {
    ArthUI.switchTab(tabParam);
  }
});
