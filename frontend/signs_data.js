// ARTH - Sign Language Database (English Only)
// Comprehensive dictionary of gestures, visual instructions, and category mappings for ISL & ASL.

const ARTH_SIGN_DATABASE = [
  // GREETINGS & BASICS
  {
    id: "hello",
    label: "Hello / Welcome",
    category: "greetings",
    dialect: "ASL / ISL",
    difficulty: "Beginner",
    summary: "Open palm at forehead or chest height waving gently forward.",
    handPose: "Open flat palm, fingers extended naturally",
    confidenceDefault: 0.98,
    actionType: "Gentle Wave",
    tips: "Keep fingers together and wave smoothly from the wrist.",
    steps: [
      "Raise your dominant hand to eye or chest level.",
      "Keep your palm facing forward with fingers upright.",
      "Wave gently side to side or tilt forward in a welcoming gesture."
    ]
  },
  {
    id: "thank_you",
    label: "Thank You",
    category: "greetings",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Fingertips of flat hand touch chin/lips and move outward toward the person.",
    handPose: "Flat hand touching chin, then extending forward",
    confidenceDefault: 0.97,
    actionType: "Forward Motion",
    tips: "Move your hand gently forward with a warm smile.",
    steps: [
      "Place the fingertips of your dominant flat hand on your chin.",
      "Move your hand forward and slightly down toward the other person.",
      "Keep your palm facing slightly upward."
    ]
  },
  {
    id: "please",
    label: "Please",
    category: "greetings",
    dialect: "ASL / ISL",
    difficulty: "Beginner",
    summary: "Flat open palm rubs gently in a clockwise circle over the center of your chest.",
    handPose: "Open palm flat against center of chest",
    confidenceDefault: 0.95,
    actionType: "Circular Rub",
    tips: "Maintain light contact with chest in smooth circles.",
    steps: [
      "Place your open dominant hand flat against the center of your chest.",
      "Rub gently in a clockwise circle 2 to 3 times."
    ]
  },
  {
    id: "sorry",
    label: "Sorry / Apologies",
    category: "greetings",
    dialect: "ASL / ISL",
    difficulty: "Beginner",
    summary: "Closed fist rubbing in gentle circles over the heart/chest.",
    handPose: "Gentle fist rubbing against chest",
    confidenceDefault: 0.94,
    actionType: "Circular Fist Rub",
    tips: "An apologetic facial expression complements the sign.",
    steps: [
      "Form a gentle fist with your dominant hand.",
      "Place your knuckles against your chest.",
      "Move the fist in small circles over your heart."
    ]
  },

  // EMERGENCY & HEALTHCARE
  {
    id: "help",
    label: "Help / Emergency",
    category: "emergency",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Thumbs-up fist placed on flat non-dominant palm, lifting upward together.",
    handPose: "Fist with thumb up resting on flat palm, lifting",
    confidenceDefault: 0.99,
    actionType: "Upward Lift",
    tips: "Both hands lift firmly upward together.",
    steps: [
      "Extend your non-dominant hand flat, palm facing up.",
      "Place a thumbs-up fist on top of the flat palm.",
      "Lift both hands upward together firmly."
    ]
  },
  {
    id: "doctor",
    label: "Doctor / Hospital",
    category: "emergency",
    dialect: "Universal",
    difficulty: "Intermediate",
    summary: "Index and middle finger tapping the inside wrist of the other hand (checking pulse).",
    handPose: "Two fingertips tapping inner wrist pulse",
    confidenceDefault: 0.96,
    actionType: "Wrist Tap",
    tips: "Standard medical sign recognized worldwide.",
    steps: [
      "Hold your non-dominant arm out with palm facing up.",
      "Tap the tips of your index and middle fingers on your inner wrist twice."
    ]
  },
  {
    id: "medicine",
    label: "Medicine / Pharmacy",
    category: "emergency",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Middle finger pivots or twists in the center of the opposite open palm.",
    handPose: "Bent middle finger pivoting in palm",
    confidenceDefault: 0.93,
    actionType: "Pivoting Tap",
    tips: "Mimics grinding a pill in a mortar.",
    steps: [
      "Hold non-dominant palm flat facing up.",
      "Touch bent middle finger tip into palm center and twist back and forth."
    ]
  },
  {
    id: "pain",
    label: "Pain / Hurt",
    category: "emergency",
    dialect: "Universal",
    difficulty: "Intermediate",
    summary: "Both index fingers pointing at each other, twisting inward near the painful area.",
    handPose: "Dual pointing fingers twisting near injury",
    confidenceDefault: 0.92,
    actionType: "Twisting Points",
    tips: "Hold your hands near the body part that hurts (head, chest, stomach).",
    steps: [
      "Extend index fingers on both hands with other fingers closed.",
      "Point finger tips toward each other with a 2-inch gap.",
      "Twist wrists back and forth repeatedly with a pained facial expression."
    ]
  },

  // DAILY ESSENTIALS & QUESTIONS
  {
    id: "water",
    label: "Water",
    category: "essentials",
    dialect: "ASL / ISL",
    difficulty: "Beginner",
    summary: "'W' handshape (three middle fingers up) tapping against the chin twice.",
    handPose: "'W' three-finger shape tapping chin",
    confidenceDefault: 0.97,
    actionType: "Double Chin Tap",
    tips: "Index finger touches the corner of your bottom lip.",
    steps: [
      "Form letter 'W' with dominant hand (index, middle, ring up; thumb holds pinky).",
      "Tap your index finger against your chin twice."
    ]
  },
  {
    id: "food",
    label: "Food / Eat",
    category: "essentials",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Fingertips gathered touching the thumb, tapped twice against the mouth.",
    handPose: "Gathered fingertips tapping lips",
    confidenceDefault: 0.98,
    actionType: "Mouth Tap",
    tips: "Natural universal eating gesture.",
    steps: [
      "Gather your fingertips together touching your thumb tip.",
      "Tap your fingertips lightly against your mouth twice."
    ]
  },
  {
    id: "yes",
    label: "Yes",
    category: "essentials",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Closed fist held upright, bending at the wrist up and down like a nodding head.",
    handPose: "Fist nodding up and down",
    confidenceDefault: 0.99,
    actionType: "Fist Nod",
    tips: "Mimics a head nodding yes.",
    steps: [
      "Make a closed fist with your dominant hand at chest height.",
      "Bend your wrist downward and up twice in a nodding motion."
    ]
  },
  {
    id: "no",
    label: "No",
    category: "essentials",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Index and middle finger snap quickly downward to meet the thumb.",
    handPose: "Two fingers snapping shut against thumb",
    confidenceDefault: 0.97,
    actionType: "Finger Snap",
    tips: "Quick, crisp closing motion.",
    steps: [
      "Extend your thumb, index, and middle fingers outward.",
      "Snap the index and middle fingers down against the thumb pad firmly."
    ]
  },
  {
    id: "stop",
    label: "Stop",
    category: "essentials",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Dominant flat open hand chops downward into the open palm of non-dominant hand.",
    handPose: "Vertical palm chopping horizontal palm",
    confidenceDefault: 0.98,
    actionType: "Downward Chop",
    tips: "Firm, crisp stopping gesture.",
    steps: [
      "Hold non-dominant hand flat horizontally, palm up.",
      "Chop edge of dominant hand into the center of the palm."
    ]
  },
  {
    id: "where",
    label: "Where?",
    category: "questions",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Index finger upright, wagging side to side with inquisitive facial expression.",
    handPose: "Index finger wagging like a pendulum",
    confidenceDefault: 0.94,
    actionType: "Index Wag",
    tips: "Slightly furrow your brows to clearly indicate a question.",
    steps: [
      "Point your dominant index finger straight up.",
      "Wag the finger back and forth from the wrist."
    ]
  },

  // EMOTIONS & RELATIONSHIPS
  {
    id: "i_love_you",
    label: "I Love You",
    category: "emotions",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Thumb, index finger, and pinky finger fully extended; middle and ring folded down.",
    handPose: "Thumb + index + pinky extended ('ILY' sign)",
    confidenceDefault: 0.99,
    actionType: "Static Hold",
    tips: "Classic international deaf community emblem.",
    steps: [
      "Hold your dominant hand outward facing the viewer.",
      "Fold middle and ring fingers down to your palm.",
      "Keep thumb, index, and pinky fingers upright."
    ]
  },
  {
    id: "happy",
    label: "Happy",
    category: "emotions",
    dialect: "Universal",
    difficulty: "Beginner",
    summary: "Open flat palms brushing upward across chest twice in a cheerful motion.",
    handPose: "Open palms brushing upwards",
    confidenceDefault: 0.95,
    actionType: "Upward Brushing",
    tips: "Smile broadly while performing the upward brush.",
    steps: [
      "Place both open palms near your chest.",
      "Brush upward in circular motions twice."
    ]
  },
  {
    id: "friend",
    label: "Friend",
    category: "emotions",
    dialect: "ASL / ISL",
    difficulty: "Intermediate",
    summary: "Index fingers of both hands hooked together, then unhooked and reversed.",
    handPose: "Interlocking curved index fingers",
    confidenceDefault: 0.93,
    actionType: "Interlocking Hooks",
    tips: "Represents an unbreakable connection.",
    steps: [
      "Hook your right index finger over your left index finger.",
      "Unhook, flip hands, and hook left index finger over right index finger."
    ]
  }
];

// FULL A-Z ALPHABET FINGERSPELLING (English)
const ARTH_ALPHABET = [
  { letter: "A", name: "Alpha", desc: "Closed fist with thumb resting alongside index finger." },
  { letter: "B", name: "Bravo", desc: "Four fingers held upright together, thumb folded across palm." },
  { letter: "C", name: "Charlie", desc: "Curved hand forming the letter 'C'." },
  { letter: "D", name: "Delta", desc: "Index finger upright, others touch thumb forming a circle." },
  { letter: "E", name: "Echo", desc: "Fingers curled downward with tips resting on top of thumb." },
  { letter: "F", name: "Foxtrot", desc: "Index and thumb touch forming 'OK' circle; three fingers up." },
  { letter: "G", name: "Golf", desc: "Index finger and thumb pointing horizontally parallel." },
  { letter: "H", name: "Hotel", desc: "Index and middle finger held horizontally together." },
  { letter: "I", name: "India", desc: "Pinky finger held upright, other fingers closed in fist." },
  { letter: "J", name: "Juliet", desc: "Pinky finger traces letter 'J' in the air." },
  { letter: "K", name: "Kilo", desc: "Index finger upright, middle angled forward, thumb in between." },
  { letter: "L", name: "Lima", desc: "Index finger up, thumb extended sideways forming 'L'." },
  { letter: "M", name: "Mike", desc: "Thumb tucked under first three fingers in closed fist." },
  { letter: "N", name: "November", desc: "Thumb tucked under first two fingers in closed fist." },
  { letter: "O", name: "Oscar", desc: "All fingers curved to touch thumb creating an 'O' ring." },
  { letter: "P", name: "Papa", desc: "Handshape like 'K' pointing downward." },
  { letter: "Q", name: "Quebec", desc: "Handshape like 'G' pointing downward." },
  { letter: "R", name: "Romeo", desc: "Index and middle fingers crossed tightly over each other." },
  { letter: "S", name: "Sierra", desc: "Fist with thumb wrapped across front of fingers." },
  { letter: "T", name: "Tango", desc: "Thumb tucked between index and middle finger." },
  { letter: "U", name: "Uniform", desc: "Index and middle fingers held upright together." },
  { letter: "V", name: "Victor", desc: "Index and middle fingers spread in a 'V' peace sign." },
  { letter: "W", name: "Whiskey", desc: "Index, middle, and ring fingers spread upright." },
  { letter: "X", name: "X-ray", desc: "Index finger bent like a hook, others folded." },
  { letter: "Y", name: "Yankee", desc: "Thumb and pinky extended, middle three folded." },
  { letter: "Z", name: "Zulu", desc: "Index finger traces letter 'Z' in the air." }
];

// QUICK EMERGENCY SOS PHRASES (100% English)
const ARTH_SOS_PHRASES = [
  {
    id: "sos_deaf_card",
    title: "I am Deaf / Hard of Hearing",
    phrase: "Hello, I am deaf and communicate through sign language and this screen. Please read or type your reply.",
    badge: "Identity Notice",
    iconColor: "indigo"
  },
  {
    id: "sos_medical",
    title: "Medical Assistance Needed",
    phrase: "I am unwell and require urgent medical help or an ambulance. Please call emergency services immediately.",
    badge: "Urgent Medical",
    iconColor: "rose"
  },
  {
    id: "sos_hospital",
    title: "Where is the Nearest Hospital?",
    phrase: "Could you please direct me to the nearest hospital, clinic, or pharmacy?",
    badge: "Navigation",
    iconColor: "blue"
  },
  {
    id: "sos_police",
    title: "Please Call the Police",
    phrase: "I feel unsafe or need emergency assistance. Please call 911 / Police for me.",
    badge: "Safety Alert",
    iconColor: "amber"
  },
  {
    id: "sos_water_food",
    title: "Need Clean Water & Food",
    phrase: "I need clean drinking water and food. Could you please show me where I can find them?",
    badge: "Daily Need",
    iconColor: "emerald"
  },
  {
    id: "sos_lost",
    title: "I Am Lost / Need Direction",
    phrase: "I am lost and cannot hear announcements. Can you please point me toward the main exit or station?",
    badge: "Transit",
    iconColor: "sky"
  }
];
