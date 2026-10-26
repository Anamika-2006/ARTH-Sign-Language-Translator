"""
ARTH - Pre-seeded Core Data for Sign Dictionary, Emergency SOS, and Alphabet
"""

INITIAL_SIGNS = [
    # GREETINGS & BASICS
    {
        "sign_id": "hello",
        "label": "Hello / Welcome",
        "category": "greetings",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "Open palm at forehead or chest height waving gently forward.",
        "hand_pose": "Open flat palm, fingers extended naturally",
        "action_type": "Gentle Wave",
        "tips": "Keep fingers together and wave smoothly from the wrist.",
        "steps": "1. Raise dominant hand to eye or chest level. 2. Keep palm facing forward with fingers upright. 3. Wave gently side to side.",
        "confidence_default": 0.98
    },
    {
        "sign_id": "thank_you",
        "label": "Thank You",
        "category": "greetings",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Fingertips of flat hand touch chin/lips and move outward toward the person.",
        "hand_pose": "Flat hand touching chin, then extending forward",
        "action_type": "Forward Motion",
        "tips": "Move your hand gently forward with a warm smile.",
        "steps": "1. Place fingertips of dominant flat hand on chin. 2. Move hand forward and slightly down toward the other person. 3. Palm faces slightly upward.",
        "confidence_default": 0.97
    },
    {
        "sign_id": "please",
        "label": "Please",
        "category": "greetings",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "Flat open palm rubs gently in a clockwise circle over the center of your chest.",
        "hand_pose": "Open palm flat against center of chest",
        "action_type": "Circular Rub",
        "tips": "Maintain light contact with chest in smooth circles.",
        "steps": "1. Place open dominant hand flat against center of chest. 2. Rub gently in clockwise circle 2 to 3 times.",
        "confidence_default": 0.95
    },
    {
        "sign_id": "sorry",
        "label": "Sorry / Apologies",
        "category": "greetings",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "Closed fist rubbing in gentle circles over the heart/chest.",
        "hand_pose": "Gentle fist rubbing against chest",
        "action_type": "Circular Fist Rub",
        "tips": "An apologetic facial expression complements the sign.",
        "steps": "1. Form gentle fist with dominant hand. 2. Place knuckles against chest. 3. Move fist in small circles over heart.",
        "confidence_default": 0.94
    },
    {
        "sign_id": "nice_to_meet_you",
        "label": "Nice to Meet You",
        "category": "greetings",
        "dialect": "ASL / ISL",
        "difficulty": "Intermediate",
        "summary": "Slide flat dominant hand across flat non-dominant hand, then bring both index fingers together.",
        "hand_pose": "Sliding palms followed by pointing index fingers meeting",
        "action_type": "Compound Sign",
        "tips": "Sign 'Nice' (palms slide) followed immediately by 'Meet' (index fingers touch).",
        "steps": "1. Dominant palm slides forward across base palm. 2. Raise both index fingers facing each other and bring them together.",
        "confidence_default": 0.93
    },

    # EMERGENCY & HEALTHCARE
    {
        "sign_id": "help",
        "label": "Help / Emergency",
        "category": "emergency",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Thumbs-up fist placed on flat non-dominant palm, lifting upward together.",
        "hand_pose": "Fist with thumb up resting on flat palm, lifting",
        "action_type": "Upward Lift",
        "tips": "Both hands lift firmly upward together.",
        "steps": "1. Extend non-dominant hand flat, palm facing up. 2. Place a thumbs-up fist on top of the flat palm. 3. Lift both hands upward together firmly.",
        "confidence_default": 0.99
    },
    {
        "sign_id": "doctor",
        "label": "Doctor / Hospital",
        "category": "emergency",
        "dialect": "Universal",
        "difficulty": "Intermediate",
        "summary": "Index and middle finger tapping the inside wrist of the other hand (checking pulse).",
        "hand_pose": "Two fingertips tapping inner wrist pulse",
        "action_type": "Wrist Tap",
        "tips": "Standard medical sign recognized worldwide.",
        "steps": "1. Hold non-dominant arm out with palm facing up. 2. Tap tips of index and middle fingers on inner wrist twice.",
        "confidence_default": 0.96
    },
    {
        "sign_id": "medicine",
        "label": "Medicine / Pharmacy",
        "category": "emergency",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Middle finger pivots or twists in the center of the opposite open palm.",
        "hand_pose": "Bent middle finger pivoting in palm",
        "action_type": "Pivoting Tap",
        "tips": "Mimics grinding a pill in a mortar.",
        "steps": "1. Hold non-dominant palm flat facing up. 2. Touch bent middle finger tip into palm center and twist back and forth.",
        "confidence_default": 0.93
    },
    {
        "sign_id": "pain",
        "label": "Pain / Hurt",
        "category": "emergency",
        "dialect": "Universal",
        "difficulty": "Intermediate",
        "summary": "Both index fingers pointing at each other, twisting inward near the painful area.",
        "hand_pose": "Dual pointing fingers twisting near injury",
        "action_type": "Twisting Points",
        "tips": "Hold your hands near the body part that hurts (head, chest, stomach).",
        "steps": "1. Extend index fingers on both hands. 2. Point fingertips toward each other with a 2-inch gap. 3. Twist wrists back and forth repeatedly.",
        "confidence_default": 0.92
    },
    {
        "sign_id": "police",
        "label": "Police / Security",
        "category": "emergency",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "'C' shaped hand tapping twice over the left chest where an officer's badge sits.",
        "hand_pose": "Curved 'C' hand shape tapping chest badge area",
        "action_type": "Badge Tap",
        "tips": "Firm double tap over heart area.",
        "steps": "1. Form a 'C' with your dominant hand. 2. Tap it over your left chest twice.",
        "confidence_default": 0.95
    },

    # DAILY ESSENTIALS & QUESTIONS
    {
        "sign_id": "water",
        "label": "Water",
        "category": "essentials",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "'W' handshape (three middle fingers up) tapping against the chin twice.",
        "hand_pose": "'W' three-finger shape tapping chin",
        "action_type": "Double Chin Tap",
        "tips": "Index finger touches the corner of your bottom lip.",
        "steps": "1. Form letter 'W' with dominant hand (index, middle, ring up). 2. Tap index finger against chin twice.",
        "confidence_default": 0.97
    },
    {
        "sign_id": "food",
        "label": "Food / Eat",
        "category": "essentials",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Fingertips gathered touching the thumb, tapped twice against the mouth.",
        "hand_pose": "Gathered fingertips tapping lips",
        "action_type": "Mouth Tap",
        "tips": "Natural universal eating gesture.",
        "steps": "1. Gather fingertips together touching thumb tip. 2. Tap fingertips lightly against mouth twice.",
        "confidence_default": 0.98
    },
    {
        "sign_id": "yes",
        "label": "Yes",
        "category": "essentials",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Closed fist held upright, bending at the wrist up and down like a nodding head.",
        "hand_pose": "Fist nodding up and down",
        "action_type": "Fist Nod",
        "tips": "Mimics a head nodding yes.",
        "steps": "1. Make a closed fist with dominant hand at chest height. 2. Bend wrist downward and up twice in nodding motion.",
        "confidence_default": 0.99
    },
    {
        "sign_id": "no",
        "label": "No",
        "category": "essentials",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Index and middle finger snap quickly downward to meet the thumb.",
        "hand_pose": "Two fingers snapping shut against thumb",
        "action_type": "Finger Snap",
        "tips": "Sharp, definitive movement.",
        "steps": "1. Hold hand up with index and middle finger extended open. 2. Snap both fingertips down onto thumb pad quickly.",
        "confidence_default": 0.97
    },
    {
        "sign_id": "where",
        "label": "Where / Location",
        "category": "questions",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "Index finger pointing upright, waving gently side to side with furrowed brow.",
        "hand_pose": "Index finger waving side to side",
        "action_type": "Side to Side Wag",
        "tips": "In sign language, facial expression indicates question tone.",
        "steps": "1. Point index finger upright at shoulder height. 2. Wag side to side gently.",
        "confidence_default": 0.94
    },
    {
        "sign_id": "stop",
        "label": "Stop / Halt",
        "category": "essentials",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Chop edge of flat dominant hand sharply down into the palm of non-dominant hand.",
        "hand_pose": "Hand chopping down onto flat palm",
        "action_type": "Sharp Chop",
        "tips": "Firm, crisp downward motion.",
        "steps": "1. Non-dominant hand flat, palm facing up. 2. Dominant hand chops down perpendicular into center palm.",
        "confidence_default": 0.98
    },

    # EMOTIONS & SOCIAL
    {
        "sign_id": "i_love_you",
        "label": "I Love You",
        "category": "emotions",
        "dialect": "Universal",
        "difficulty": "Beginner",
        "summary": "Thumb, index finger, and pinky finger extended upright (combines I, L, Y).",
        "hand_pose": "Thumb, index, and pinky extended upright",
        "action_type": "Static Posture",
        "tips": "Middle and ring finger stay closed against the palm.",
        "steps": "1. Raise dominant hand. 2. Extend thumb, index, and pinky. 3. Fold middle and ring fingers into palm.",
        "confidence_default": 0.99
    },
    {
        "sign_id": "happy",
        "label": "Happy / Joy",
        "category": "emotions",
        "dialect": "ASL / ISL",
        "difficulty": "Beginner",
        "summary": "Open flat hands brushing upward along chest repeatedly in an uplifting motion.",
        "hand_pose": "Open palms sweeping upward along chest",
        "action_type": "Upward Sweeps",
        "tips": "Smile brightly while performing the sign.",
        "steps": "1. Place flat hands near chest. 2. Sweep hands upward in circular motions.",
        "confidence_default": 0.95
    },
    {
        "sign_id": "understand",
        "label": "Understand / Got It",
        "category": "essentials",
        "dialect": "ASL / ISL",
        "difficulty": "Intermediate",
        "summary": "Fist near temple flicking index finger upward like a light bulb turning on.",
        "hand_pose": "Index finger flicking up from fist near forehead",
        "action_type": "Upward Flick",
        "tips": "Nod along with the flick.",
        "steps": "1. Place fist near right temple. 2. Flick index finger up like an idea popping into your head.",
        "confidence_default": 0.93
    }
]

# ALPHABET A-Z (Complete 26 Letters)
INITIAL_ALPHABET = [
    {"letter": "A", "name": "Letter A", "desc": "Closed fist with thumb resting alongside the outer index finger."},
    {"letter": "B", "name": "Letter B", "desc": "Four fingers straight up and together; thumb folded across palm."},
    {"letter": "C", "name": "Letter C", "desc": "Curved fingers and thumb forming a 'C' shape."},
    {"letter": "D", "name": "Letter D", "desc": "Index finger pointing up; other fingers and thumb touch forming a circle."},
    {"letter": "E", "name": "Letter E", "desc": "All fingertips curled down touching thumb pad."},
    {"letter": "F", "name": "Letter F", "desc": "Index finger and thumb form a circle; remaining 3 fingers straight up."},
    {"letter": "G", "name": "Letter G", "desc": "Index finger and thumb extend parallel horizontally pointing forward."},
    {"letter": "H", "name": "Letter H", "desc": "Index and middle fingers extend horizontally together; thumb tucked."},
    {"letter": "I", "name": "Letter I", "desc": "Pinky finger points straight up; other fingers folded into a fist with thumb across."},
    {"letter": "J", "name": "Letter J", "desc": "Pinky points up and traces a 'J' hook shape in the air."},
    {"letter": "K", "name": "Letter K", "desc": "Index finger up, middle finger forward at 90°, thumb rests between them."},
    {"letter": "L", "name": "Letter L", "desc": "Index finger up and thumb extended outward forming an 'L' shape."},
    {"letter": "M", "name": "Letter M", "desc": "Thumb tucked under first three fingers (index, middle, ring)."},
    {"letter": "N", "name": "Letter N", "desc": "Thumb tucked under first two fingers (index and middle)."},
    {"letter": "O", "name": "Letter O", "desc": "All fingertips touch thumb tip forming an 'O' circle."},
    {"letter": "P", "name": "Letter P", "desc": "Like 'K' but tilted downward with index pointing forward and middle down."},
    {"letter": "Q", "name": "Letter Q", "desc": "Like 'G' but pointing downward toward the ground."},
    {"letter": "R", "name": "Letter R", "desc": "Index and middle fingers crossed together pointing straight up."},
    {"letter": "S", "name": "Letter S", "desc": "Tight closed fist with thumb wrapped securely across the front of fingers."},
    {"letter": "T", "name": "Letter T", "desc": "Thumb tucked between index and middle finger of closed fist."},
    {"letter": "U", "name": "Letter U", "desc": "Index and middle fingers straight up and pressed tightly together."},
    {"letter": "V", "name": "Letter V", "desc": "Index and middle fingers straight up spread apart in a 'V' peace sign."},
    {"letter": "W", "name": "Letter W", "desc": "Index, middle, and ring fingers straight up and spread in a 'W' shape."},
    {"letter": "X", "name": "Letter X", "desc": "Index finger bent into a hook; other fingers folded into fist."},
    {"letter": "Y", "name": "Letter Y", "desc": "Thumb and pinky extended out ('hang loose' sign); middle three fingers folded."},
    {"letter": "Z", "name": "Letter Z", "desc": "Index finger traces the letter 'Z' in the air."}
]

# EMERGENCY SOS PRESET PHRASES
INITIAL_SOS = [
    {
        "emergency_id": "urgent_medical",
        "title": "Need Urgent Medical Help",
        "phrase": "I am Deaf. I need urgent medical assistance immediately. Please call an ambulance or get a doctor.",
        "badge": "Urgent Medical"
    },
    {
        "emergency_id": "hospital_er",
        "title": "Hospital Emergency Room",
        "phrase": "Please guide me to the nearest hospital emergency room. I need immediate medical evaluation.",
        "badge": "Hospital ER"
    },
    {
        "emergency_id": "police",
        "title": "Call Police / Security",
        "phrase": "I feel unsafe and need security or police assistance right now. Please help me report an emergency.",
        "badge": "Police Help"
    },
    {
        "emergency_id": "lost",
        "title": "I am Lost / Transit Help",
        "phrase": "I am lost and cannot hear announcements. Please point me toward the train, bus, or exit.",
        "badge": "Lost / Transit"
    },
    {
        "emergency_id": "food_water",
        "title": "Need Water & Food",
        "phrase": "I urgently need clean drinking water and food. Please help me.",
        "badge": "Basic Need"
    },
    {
        "emergency_id": "identity",
        "title": "I am Deaf - Use ARTH",
        "phrase": "I am Deaf and communicate using Sign Language. Please speak into this screen or type to talk with me.",
        "badge": "Deaf Identity"
    }
]
