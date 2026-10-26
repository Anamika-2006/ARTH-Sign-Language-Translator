-- =========================================================================
-- ARTH (अर्थ) • Relational Database Schema
-- SQLite3 / PostgreSQL Compatible
-- Designed for Two-Way Sign Language & Voice Translation Platform
-- =========================================================================

-- 1. Users & Authentication Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'deaf', -- 'deaf', 'hearing', 'educator', 'healthcare'
    preferred_dialect TEXT DEFAULT 'ASL', -- 'ASL', 'ISL'
    voice_gender TEXT DEFAULT 'neutral',
    speech_rate REAL DEFAULT 0.95,
    high_contrast INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Real-Time Translations Log
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    source_mode TEXT NOT NULL, -- 'sign_to_speech' or 'speech_to_sign'
    raw_input TEXT NOT NULL,
    translated_output TEXT NOT NULL,
    dialect TEXT DEFAULT 'ASL',
    confidence_score REAL DEFAULT 0.95,
    is_favorite INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trans_user ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_created ON translations(created_at);

-- 3. Live Dialogue Bridge Sessions
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    title TEXT DEFAULT 'Consultation Bridge',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conv_session ON conversation_sessions(session_id);

-- 4. Dialogue Bridge Messages
CREATE TABLE IF NOT EXISTS conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    sender_role TEXT NOT NULL, -- 'hearing' or 'deaf'
    sender_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    sign_tokens TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES conversation_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conv_msgs ON conversation_messages(session_id);

-- 5. ARTH Shiksha (Practice Arena) Progress
CREATE TABLE IF NOT EXISTS practice_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sign_id TEXT NOT NULL,
    sign_label TEXT NOT NULL,
    accuracy_score REAL NOT NULL,
    streak_count INTEGER DEFAULT 1,
    mastered INTEGER DEFAULT 0,
    practiced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_user ON practice_progress(user_id);

-- 6. Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_emergency_user ON emergency_contacts(user_id);

-- 7. Emergency SOS Dispatch Logs
CREATE TABLE IF NOT EXISTS emergency_sos_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    card_id TEXT NOT NULL,
    card_title TEXT NOT NULL,
    speech_phrase TEXT NOT NULL,
    status TEXT DEFAULT 'broadcasted',
    latitude REAL,
    longitude REAL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 8. Sign Language Dictionary (500+ Core Gestures)
CREATE TABLE IF NOT EXISTS sign_dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sign_id TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL, -- 'greetings', 'emergency', 'essentials', 'questions', 'emotions', 'alphabet'
    dialect TEXT DEFAULT 'Universal', -- 'ASL', 'ISL', 'Universal'
    summary TEXT NOT NULL,
    hand_pose TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dict_search ON sign_dictionary(label, category, dialect);

-- 9. User Bookmarked Signs
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sign_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sign_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
