"""
ARTH - Database Management Layer (SQLite3)
Complete schema definition, relational tables, migrations, and seeding.
"""

import sqlite3
import os
import bcrypt
from datetime import datetime
from seed_data import INITIAL_SIGNS, INITIAL_ALPHABET, INITIAL_SOS

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "arth.db")

def get_connection():
    """Create and return a SQLite database connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initialize all relational tables, indexes, and pre-seed initial data."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'deaf',
        preferred_dialect TEXT DEFAULT 'ASL',
        voice_gender TEXT DEFAULT 'neutral',
        speech_rate REAL DEFAULT 1.0,
        high_contrast INTEGER DEFAULT 0,
        streak_count INTEGER DEFAULT 1,
        total_translations INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Translations History Table
    cursor.execute("""
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
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
    """)

    # 3. Conversation Sessions (Dialogue Bridge)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        title TEXT DEFAULT 'Dialogue Bridge Consultation',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
    """)

    # 4. Conversation Messages
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS conversation_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        sender_type TEXT NOT NULL, -- 'hearing' or 'deaf'
        sender_name TEXT DEFAULT 'Participant',
        message_text TEXT NOT NULL,
        sign_tokens TEXT, -- JSON array of matched tokens
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES conversation_sessions (id) ON DELETE CASCADE
    )
    """)

    # 5. Practice Progress (ARTH Shiksha)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS practice_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sign_id TEXT NOT NULL,
        sign_label TEXT NOT NULL,
        accuracy_score REAL NOT NULL,
        streak_count INTEGER DEFAULT 1,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
    """)

    # 6. Emergency Contacts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        relation TEXT NOT NULL,
        phone TEXT NOT NULL,
        notify_sms INTEGER DEFAULT 1,
        custom_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)

    # 7. Emergency SOS Trigger Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_sos_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        emergency_id TEXT NOT NULL,
        title TEXT NOT NULL,
        phrase TEXT NOT NULL,
        audio_broadcast_played INTEGER DEFAULT 1,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
    """)

    # 8. Sign Dictionary
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sign_dictionary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sign_id TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        category TEXT NOT NULL,
        dialect TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Beginner',
        summary TEXT NOT NULL,
        hand_pose TEXT NOT NULL,
        action_type TEXT,
        tips TEXT,
        steps TEXT,
        confidence_default REAL DEFAULT 0.95,
        views_count INTEGER DEFAULT 0
    )
    """)

    # 9. User Bookmarks
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sign_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, sign_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (sign_id) REFERENCES sign_dictionary (sign_id) ON DELETE CASCADE
    )
    """)

    # Create Indexes for lightning fast lookups
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_translations_user ON translations(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chat_session ON conversation_messages(session_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_category ON sign_dictionary(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_dialect ON sign_dictionary(dialect)")

    conn.commit()

    # Pre-seed initial dictionary signs if empty
    cursor.execute("SELECT COUNT(*) as count FROM sign_dictionary")
    count = cursor.fetchone()["count"]
    if count == 0:
        print("[Database] Seeding initial sign dictionary...")
        for sign in INITIAL_SIGNS:
            cursor.execute("""
            INSERT OR IGNORE INTO sign_dictionary 
            (sign_id, label, category, dialect, difficulty, summary, hand_pose, action_type, tips, steps, confidence_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                sign["sign_id"], sign["label"], sign["category"], sign["dialect"],
                sign["difficulty"], sign["summary"], sign["hand_pose"],
                sign.get("action_type", "Standard Pose"), sign.get("tips", ""),
                sign.get("steps", ""), sign.get("confidence_default", 0.95)
            ))
        
        # Seed Alphabet
        for alpha in INITIAL_ALPHABET:
            cursor.execute("""
            INSERT OR IGNORE INTO sign_dictionary 
            (sign_id, label, category, dialect, difficulty, summary, hand_pose, action_type, tips, steps, confidence_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"letter_{alpha['letter'].lower()}", f"Letter {alpha['letter']}", "alphabet", "Universal",
                "Beginner", alpha["desc"], f"Finger spelling pose for '{alpha['letter']}'",
                "Single Handshape", "Hold hand steady at shoulder height.",
                f"Form '{alpha['letter']}' with dominant hand.", 0.98
            ))
        conn.commit()

    # Pre-seed demo user if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'demo@arth.ai'")
    demo_user = cursor.fetchone()
    if not demo_user:
        print("[Database] Creating verified demo user account (demo@arth.ai)...")
        salt = bcrypt.gensalt()
        pw_hash = bcrypt.hashpw("password123".encode('utf-8'), salt).decode('utf-8')
        cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, preferred_dialect, streak_count, total_translations)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ('demo@arth.ai', pw_hash, 'Aarav Sharma', 'deaf', 'ASL', 5, 42))
        demo_user_id = cursor.lastrowid
        conn.commit()

        # Seed initial emergency contacts for demo user
        cursor.execute("""
        INSERT INTO emergency_contacts (user_id, name, relation, phone, custom_message)
        VALUES (?, ?, ?, ?, ?)
        """, (demo_user_id, "Dr. Priya Sen", "Family Doctor (General Clinic)", "+91 98765 43210", "Patient is Deaf, uses ARTH sign translator."))
        cursor.execute("""
        INSERT INTO emergency_contacts (user_id, name, relation, phone, custom_message)
        VALUES (?, ?, ?, ?, ?)
        """, (demo_user_id, "Kavita Sharma", "Sister (Emergency Guardian)", "+91 98111 22334", "Call or text immediately in case of hospitalization."))
        
        # Seed initial sample translations
        cursor.execute("""
        INSERT INTO translations (user_id, source_mode, raw_input, translated_output, dialect, confidence_score, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (demo_user_id, 'sign_to_speech', 'Hello Water Please', 'Hello! Could you please provide drinking water?', 'ASL', 0.98, 1))
        cursor.execute("""
        INSERT INTO translations (user_id, source_mode, raw_input, translated_output, dialect, confidence_score, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (demo_user_id, 'speech_to_sign', 'Take this medicine twice a day after lunch', 'Medicine Twice Day After Food', 'Universal', 0.96, 1))

        # Seed initial dialogue bridge session
        session_id = "demo-consult-001"
        cursor.execute("""
        INSERT INTO conversation_sessions (id, user_id, title)
        VALUES (?, ?, ?)
        """, (session_id, demo_user_id, "Cardiology Intake Consultation"))
        cursor.execute("""
        INSERT INTO conversation_messages (session_id, sender_type, sender_name, message_text, sign_tokens)
        VALUES (?, ?, ?, ?, ?)
        """, (session_id, 'hearing', 'Dr. Ramesh (Cardiology)', 'Good morning Aarav. How have you been feeling since last Thursday?', '["Hello", "How", "Feel"]'))
        cursor.execute("""
        INSERT INTO conversation_messages (session_id, sender_type, sender_name, message_text, sign_tokens)
        VALUES (?, ?, ?, ?, ?)
        """, (session_id, 'deaf', 'Aarav Sharma (ARTH)', 'Good morning Doctor. The chest pain has stopped, but I feel tired after walking.', '["Doctor", "Pain", "Stop", "Walk"]'))

        # Seed practice progress
        cursor.execute("""
        INSERT INTO practice_progress (user_id, sign_id, sign_label, accuracy_score, streak_count)
        VALUES (?, ?, ?, ?, ?)
        """, (demo_user_id, 'hello', 'Hello / Welcome', 0.98, 5))
        cursor.execute("""
        INSERT INTO practice_progress (user_id, sign_id, sign_label, accuracy_score, streak_count)
        VALUES (?, ?, ?, ?, ?)
        """, (demo_user_id, 'thank_you', 'Thank You', 0.96, 4))

        conn.commit()

    conn.close()
    print(f"[Database] SQLite DB ready at: {DB_PATH}")

if __name__ == "__main__":
    init_db()
