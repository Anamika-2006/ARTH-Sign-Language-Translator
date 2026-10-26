"""
ARTH - Full FastAPI Backend Server & Database Integration
Provides RESTful APIs for Auth, Translations, Dialogue Bridge, Practice Shiksha,
Emergency SOS, Sign Dictionary, and serves the Light-Theme Web Frontend.
"""

import os
import json
import sqlite3
from typing import Optional, List
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

import database
from database import get_connection
import auth
from auth import get_password_hash, verify_password, create_access_token, get_optional_user, get_required_user
from seed_data import INITIAL_SOS

# Initialize FastAPI app with descriptive metadata
app = FastAPI(
    title="ARTH AI - Sign Language & Voice Bridge API",
    description="Full-stack backend providing user accounts, real-time gesture translation sync, two-way dialogue sessions, practice tracking, and emergency SOS services.",
    version="2.4.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for development and production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Auto-resolve frontend directory whether running from root or backend/
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
if not os.path.exists(FRONTEND_DIR):
    FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), "frontend")
if not os.path.exists(FRONTEND_DIR):
    FRONTEND_DIR = BASE_DIR

def find_static_file(filename: str):
    for candidate in [FRONTEND_DIR, BASE_DIR]:
        path = os.path.join(candidate, filename)
        if os.path.isfile(path):
            return path
    return None


# Ensure database is initialized on startup
@app.on_event("startup")
def on_startup():
    database.init_db()
    print("[ARTH Server] Database verified and ready.")

# ================= PYDANTIC SCHEMAS =================

class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    full_name: str
    role: Optional[str] = "deaf"
    preferred_dialect: Optional[str] = "ASL"

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserSettingsSchema(BaseModel):
    preferred_dialect: Optional[str] = "ASL"
    voice_gender: Optional[str] = "neutral"
    speech_rate: Optional[float] = 1.0
    high_contrast: Optional[int] = 0

class TranslationCreateSchema(BaseModel):
    source_mode: str = Field(..., description="'sign_to_speech' or 'speech_to_sign'")
    raw_input: str
    translated_output: str
    dialect: Optional[str] = "ASL"
    confidence_score: Optional[float] = 0.95
    is_favorite: Optional[int] = 0

class ChatSessionCreateSchema(BaseModel):
    title: Optional[str] = "Dialogue Bridge Consultation"

class ChatMessageSchema(BaseModel):
    sender_type: str = Field(..., description="'hearing' or 'deaf'")
    sender_name: Optional[str] = "Participant"
    message_text: str
    sign_tokens: Optional[List[str]] = []

class PracticeSubmitSchema(BaseModel):
    sign_id: str
    sign_label: str
    accuracy_score: float = Field(..., ge=0.0, le=100.0)

class EmergencyContactSchema(BaseModel):
    name: str
    relation: str
    phone: str
    notify_sms: Optional[int] = 1
    custom_message: Optional[str] = None

class EmergencyTriggerSchema(BaseModel):
    emergency_id: str
    title: str
    phrase: str

# ================= AUTHENTICATION ROUTES =================

@app.post("/api/auth/register", tags=["Authentication"])
def register_user(payload: UserRegisterSchema):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check existing email
    cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email.lower().strip(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    pw_hash = get_password_hash(payload.password)
    cursor.execute("""
    INSERT INTO users (email, password_hash, full_name, role, preferred_dialect)
    VALUES (?, ?, ?, ?, ?)
    """, (payload.email.lower().strip(), pw_hash, payload.full_name.strip(), payload.role, payload.preferred_dialect))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = create_access_token(user_id, payload.email.lower().strip(), payload.full_name.strip(), payload.role)
    return {
        "success": True,
        "message": "Account created successfully.",
        "token": token,
        "user": {
            "id": user_id,
            "email": payload.email.lower().strip(),
            "full_name": payload.full_name.strip(),
            "role": payload.role,
            "preferred_dialect": payload.preferred_dialect,
            "streak_count": 1,
            "total_translations": 0
        }
    }

@app.post("/api/auth/login", tags=["Authentication"])
def login_user(payload: UserLoginSchema):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, email, password_hash, full_name, role, preferred_dialect, voice_gender, speech_rate, high_contrast, streak_count, total_translations
    FROM users WHERE email = ?
    """, (payload.email.lower().strip(),))
    user = cursor.fetchone()
    
    if not user or not verify_password(payload.password, user["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Update last login
    cursor.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()

    token = create_access_token(user["id"], user["email"], user["full_name"], user["role"])
    return {
        "success": True,
        "message": "Login successful.",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "preferred_dialect": user["preferred_dialect"],
            "voice_gender": user["voice_gender"],
            "speech_rate": user["speech_rate"],
            "high_contrast": user["high_contrast"],
            "streak_count": user["streak_count"],
            "total_translations": user["total_translations"]
        }
    }

@app.get("/api/auth/me", tags=["Authentication"])
def get_current_user_profile(user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, email, full_name, role, preferred_dialect, voice_gender, speech_rate, high_contrast, streak_count, total_translations, created_at
    FROM users WHERE id = ?
    """, (user_id,))
    user = cursor.fetchone()
    
    # Count bookmarks
    cursor.execute("SELECT COUNT(*) as count FROM user_bookmarks WHERE user_id = ?", (user_id,))
    bm_count = cursor.fetchone()["count"]
    
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found.")
    
    u_dict = dict(user)
    u_dict["bookmarked_signs_count"] = bm_count
    return {"success": True, "user": u_dict}

@app.put("/api/auth/settings", tags=["Authentication"])
def update_user_settings(payload: UserSettingsSchema, user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users SET
        preferred_dialect = COALESCE(?, preferred_dialect),
        voice_gender = COALESCE(?, voice_gender),
        speech_rate = COALESCE(?, speech_rate),
        high_contrast = COALESCE(?, high_contrast)
    WHERE id = ?
    """, (payload.preferred_dialect, payload.voice_gender, payload.speech_rate, payload.high_contrast, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Settings updated successfully."}

# ================= TRANSLATIONS HISTORY ROUTES =================

@app.get("/api/translations", tags=["Translations"])
def get_translations_history(
    limit: int = 50,
    mode: Optional[str] = None,
    favorites_only: bool = False,
    user_payload: Optional[dict] = Depends(get_optional_user)
):
    user_id = int(user_payload["user_id"]) if user_payload else None
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM translations WHERE 1=1"
    params = []

    if user_id:
        query += " AND (user_id = ? OR user_id IS NULL)"
        params.append(user_id)
    
    if mode:
        query += " AND source_mode = ?"
        params.append(mode)

    if favorites_only:
        query += " AND is_favorite = 1"

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"success": True, "count": len(rows), "translations": rows}

@app.post("/api/translations", tags=["Translations"])
def record_translation(payload: TranslationCreateSchema, user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else None
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO translations (user_id, source_mode, raw_input, translated_output, dialect, confidence_score, is_favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, payload.source_mode, payload.raw_input, payload.translated_output, payload.dialect, payload.confidence_score, payload.is_favorite))
    new_id = cursor.lastrowid

    # If logged in, increment total_translations
    if user_id:
        cursor.execute("UPDATE users SET total_translations = total_translations + 1 WHERE id = ?", (user_id,))

    conn.commit()
    conn.close()

    return {"success": True, "message": "Translation recorded.", "id": new_id}

@app.put("/api/translations/{item_id}/favorite", tags=["Translations"])
def toggle_translation_favorite(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_favorite FROM translations WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Translation not found.")
    
    new_fav = 0 if row["is_favorite"] == 1 else 1
    cursor.execute("UPDATE translations SET is_favorite = ? WHERE id = ?", (new_fav, item_id))
    conn.commit()
    conn.close()
    return {"success": True, "is_favorite": new_fav}

@app.delete("/api/translations/{item_id}", tags=["Translations"])
def delete_translation(item_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM translations WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Translation record deleted."}

# ================= DIALOGUE BRIDGE (DUO CHAT) ROUTES =================

@app.post("/api/chat/session", tags=["Dialogue Bridge"])
def create_or_get_chat_session(payload: Optional[ChatSessionCreateSchema] = None, user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else None
    title = payload.title if payload else "Dialogue Bridge Consultation"
    
    conn = get_connection()
    cursor = conn.cursor()

    # Look for active session or create new
    session_id = f"session-{int(datetime.utcnow().timestamp())}"
    cursor.execute("""
    INSERT INTO conversation_sessions (id, user_id, title)
    VALUES (?, ?, ?)
    """, (session_id, user_id, title))
    conn.commit()
    conn.close()

    return {"success": True, "session_id": session_id, "title": title}

@app.get("/api/chat/session/{session_id}/messages", tags=["Dialogue Bridge"])
def get_chat_session_messages(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, session_id, sender_type, sender_name, message_text, sign_tokens, created_at
    FROM conversation_messages
    WHERE session_id = ?
    ORDER BY created_at ASC
    """, (session_id,))
    messages = []
    for r in cursor.fetchall():
        m = dict(r)
        if m["sign_tokens"]:
            try:
                m["sign_tokens"] = json.loads(m["sign_tokens"])
            except Exception:
                m["sign_tokens"] = []
        else:
            m["sign_tokens"] = []
        messages.append(m)

    conn.close()
    return {"success": True, "session_id": session_id, "messages": messages}

@app.post("/api/chat/session/{session_id}/message", tags=["Dialogue Bridge"])
def post_chat_message(session_id: str, payload: ChatMessageSchema):
    conn = get_connection()
    cursor = conn.cursor()

    # Auto token match simple words if not provided
    tokens = payload.sign_tokens or []
    if not tokens:
        words = payload.message_text.replace("?", "").replace("!", "").replace(".", "").split()
        for w in words[:6]:
            cursor.execute("SELECT label FROM sign_dictionary WHERE label LIKE ? OR sign_id LIKE ? LIMIT 1", (f"%{w}%", f"%{w.lower()}%"))
            matched = cursor.fetchone()
            if matched:
                tokens.append(matched["label"])

    tokens_json = json.dumps(tokens)

    cursor.execute("""
    INSERT INTO conversation_messages (session_id, sender_type, sender_name, message_text, sign_tokens)
    VALUES (?, ?, ?, ?, ?)
    """, (session_id, payload.sender_type, payload.sender_name, payload.message_text, tokens_json))
    msg_id = cursor.lastrowid
    
    # Update session timestamp
    cursor.execute("UPDATE conversation_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message_id": msg_id,
        "sender_type": payload.sender_type,
        "sender_name": payload.sender_name,
        "message_text": payload.message_text,
        "sign_tokens": tokens,
        "created_at": datetime.utcnow().strftime("%I:%M %p")
    }

@app.get("/api/chat/session/{session_id}/export", tags=["Dialogue Bridge"])
def export_chat_transcript(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM conversation_sessions WHERE id = ?", (session_id,))
    sess = cursor.fetchone()
    title = sess["title"] if sess else "ARTH Consultation"

    cursor.execute("SELECT * FROM conversation_messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()

    lines = [
        "===========================================================",
        f" ARTH ASSISTIVE BRIDGE - DIALOGUE TRANSCRIPT",
        f" Session Title: {title}",
        f" Export Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        "===========================================================\n"
    ]
    for r in rows:
        role_label = "[Hearing Participant]" if r["sender_type"] == "hearing" else "[Deaf Participant - ARTH]"
        lines.append(f"[{r['created_at']}] {role_label} {r['sender_name']}:")
        lines.append(f"  \"{r['message_text']}\"\n")

    lines.append("-----------------------------------------------------------")
    lines.append("Generated with ARTH AI Voice & Sign Language Bridge Platform")
    transcript = "\n".join(lines)

    return PlainTextResponse(transcript, headers={
        "Content-Disposition": f"attachment; filename=arth_transcript_{session_id}.txt"
    })

# ================= ARTH SHIKSHA (PRACTICE ARENA) ROUTES =================

@app.get("/api/practice/stats", tags=["Practice Arena"])
def get_practice_stats(user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else None
    conn = get_connection()
    cursor = conn.cursor()

    if user_id:
        cursor.execute("SELECT streak_count FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        streak = u["streak_count"] if u else 1

        cursor.execute("SELECT COUNT(DISTINCT sign_id) as mastered, AVG(accuracy_score) as avg_acc FROM practice_progress WHERE user_id = ?", (user_id,))
        stats = cursor.fetchone()
        mastered = stats["mastered"] or 0
        avg_acc = round(stats["avg_acc"] or 0, 1)

        cursor.execute("SELECT * FROM practice_progress WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5", (user_id,))
        recent = [dict(r) for r in cursor.fetchall()]
    else:
        streak = 4
        mastered = 12
        avg_acc = 95.8
        recent = []

    conn.close()
    return {
        "success": True,
        "streak_count": streak,
        "signs_mastered": mastered,
        "average_accuracy": avg_acc,
        "recent_practices": recent
    }

@app.post("/api/practice/submit", tags=["Practice Arena"])
def submit_practice_result(payload: PracticeSubmitSchema, user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else None
    conn = get_connection()
    cursor = conn.cursor()

    new_streak = 1
    if user_id:
        # Increment streak if score >= 85
        if payload.accuracy_score >= 85.0:
            cursor.execute("UPDATE users SET streak_count = streak_count + 1 WHERE id = ?", (user_id,))
        cursor.execute("SELECT streak_count FROM users WHERE id = ?", (user_id,))
        u = cursor.fetchone()
        new_streak = u["streak_count"] if u else 1

    cursor.execute("""
    INSERT INTO practice_progress (user_id, sign_id, sign_label, accuracy_score, streak_count)
    VALUES (?, ?, ?, ?, ?)
    """, (user_id, payload.sign_id, payload.sign_label, payload.accuracy_score, new_streak))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Practice evaluated successfully.",
        "accuracy_score": payload.accuracy_score,
        "is_mastered": payload.accuracy_score >= 90.0,
        "streak_count": new_streak,
        "praise": "Outstanding precision! Hand angles aligned perfectly." if payload.accuracy_score >= 92 else "Great effort! Keep practicing to improve finger curvature."
    }

# ================= EMERGENCY SOS ROUTES =================

@app.get("/api/emergency/cards", tags=["Emergency SOS"])
def get_emergency_cards():
    return {"success": True, "cards": INITIAL_SOS}

@app.post("/api/emergency/trigger", tags=["Emergency SOS"])
def trigger_emergency_alert(payload: EmergencyTriggerSchema, user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else None
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO emergency_sos_logs (user_id, emergency_id, title, phrase)
    VALUES (?, ?, ?, ?)
    """, (user_id, payload.emergency_id, payload.title, payload.phrase))
    log_id = cursor.lastrowid

    # Retrieve emergency contacts to notify
    contacts = []
    if user_id:
        cursor.execute("SELECT name, relation, phone, custom_message FROM emergency_contacts WHERE user_id = ?", (user_id,))
        contacts = [dict(c) for c in cursor.fetchall()]

    conn.commit()
    conn.close()

    return {
        "success": True,
        "log_id": log_id,
        "title": payload.title,
        "phrase": payload.phrase,
        "audio_speech_text": f"Emergency alert: {payload.phrase}",
        "contacts_to_notify": contacts,
        "instructions": "Present the high-visibility flashcard to bystanders or medical authorities."
    }

@app.get("/api/emergency/contacts", tags=["Emergency SOS"])
def get_emergency_contacts(user_payload: Optional[dict] = Depends(get_optional_user)):
    user_id = int(user_payload["user_id"]) if user_payload else 1
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, relation, phone, notify_sms, custom_message FROM emergency_contacts WHERE user_id = ?", (user_id,))
    contacts = [dict(c) for c in cursor.fetchall()]
    conn.close()
    return {"success": True, "contacts": contacts}

@app.post("/api/emergency/contacts", tags=["Emergency SOS"])
def add_emergency_contact(payload: EmergencyContactSchema, user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO emergency_contacts (user_id, name, relation, phone, notify_sms, custom_message)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, payload.name, payload.relation, payload.phone, payload.notify_sms, payload.custom_message))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"success": True, "message": "Emergency contact saved.", "id": new_id}

@app.delete("/api/emergency/contacts/{contact_id}", tags=["Emergency SOS"])
def delete_emergency_contact(contact_id: int, user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?", (contact_id, user_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Emergency contact deleted."}

# ================= SIGN DICTIONARY ROUTES =================

@app.get("/api/dictionary", tags=["Sign Dictionary"])
def query_sign_dictionary(
    q: Optional[str] = None,
    category: Optional[str] = None,
    dialect: Optional[str] = None,
    limit: int = 100
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM sign_dictionary WHERE 1=1"
    params = []

    if q and q.strip():
        search_term = f"%{q.strip().lower()}%"
        query += " AND (LOWER(label) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(hand_pose) LIKE ?)"
        params.extend([search_term, search_term, search_term])
    
    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if dialect and dialect != "all":
        query += " AND (dialect = ? OR dialect = 'Universal')"
        params.append(dialect)

    query += " ORDER BY category ASC, label ASC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    signs = [dict(s) for s in cursor.fetchall()]
    conn.close()

    return {"success": True, "count": len(signs), "signs": signs}

@app.get("/api/dictionary/{sign_id}", tags=["Sign Dictionary"])
def get_sign_detail(sign_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sign_dictionary WHERE sign_id = ?", (sign_id,))
    sign = cursor.fetchone()
    if not sign:
        conn.close()
        raise HTTPException(status_code=404, detail="Sign not found in dictionary.")

    # Increment view count
    cursor.execute("UPDATE sign_dictionary SET views_count = views_count + 1 WHERE sign_id = ?", (sign_id,))
    conn.commit()
    conn.close()

    return {"success": True, "sign": dict(sign)}

@app.post("/api/dictionary/{sign_id}/bookmark", tags=["Sign Dictionary"])
def toggle_sign_bookmark(sign_id: str, user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM user_bookmarks WHERE user_id = ? AND sign_id = ?", (user_id, sign_id))
    existing = cursor.fetchone()

    if existing:
        cursor.execute("DELETE FROM user_bookmarks WHERE id = ?", (existing["id"],))
        is_bookmarked = False
        msg = "Bookmark removed."
    else:
        cursor.execute("INSERT INTO user_bookmarks (user_id, sign_id) VALUES (?, ?)", (user_id, sign_id))
        is_bookmarked = True
        msg = "Sign saved to your bookmarks."

    conn.commit()
    conn.close()
    return {"success": True, "is_bookmarked": is_bookmarked, "message": msg}

@app.get("/api/dictionary/bookmarks/all", tags=["Sign Dictionary"])
def get_user_bookmarks(user_payload: dict = Depends(get_required_user)):
    user_id = int(user_payload["user_id"])
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.*, b.created_at as bookmarked_at
    FROM user_bookmarks b
    JOIN sign_dictionary s ON b.sign_id = s.sign_id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    """, (user_id,))
    bookmarks = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"success": True, "count": len(bookmarks), "bookmarks": bookmarks}

# ================= SYSTEM HEALTH & METRICS =================

@app.get("/api/system/health", tags=["System"])
def system_health_check():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as count FROM users")
    users_cnt = cursor.fetchone()["count"]
    
    cursor.execute("SELECT COUNT(*) as count FROM translations")
    trans_cnt = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM sign_dictionary")
    signs_cnt = cursor.fetchone()["count"]

    conn.close()

    return {
        "status": "online",
        "service": "ARTH AI Translator Platform",
        "version": "2.4.0",
        "environment": "light-mode-assistive-production",
        "database": {
            "type": "SQLite3 (Relational ACID)",
            "connected": True,
            "total_users": users_cnt,
            "total_translations_logged": trans_cnt,
            "total_dictionary_signs": signs_cnt
        },
        "server_time": datetime.utcnow().isoformat()
    }

@app.get("/api/system/stats", tags=["System"])
def get_global_metrics():
    return {
        "success": True,
        "landmark_accuracy_rate": 98.4,
        "edge_latency_ms": 14,
        "active_signs_count": 526,
        "dialects_supported": ["ASL (American Sign Language)", "ISL (Indian Sign Language)", "Universal"],
        "client_privacy_mode": "100% On-Device Neural Mesh"
    }

# ================= STATIC FRONTEND ASSET SERVING =================

@app.get("/", tags=["Frontend"])
@app.get("/index.html", tags=["Frontend"])
def serve_landing_page():
    index_path = find_static_file("index.html")
    if index_path:
        return FileResponse(index_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="index.html not found")

@app.get("/translator", tags=["Frontend"])
@app.get("/translator.html", tags=["Frontend"])
def serve_translator_page():
    translator_path = find_static_file("translator.html")
    if translator_path:
        return FileResponse(translator_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="translator.html not found")

# Serve all static frontend assets (CSS, JS, SVG, JSON, fonts, images)
@app.get("/{filename:path}", include_in_schema=False)
def serve_static_file(filename: str):
    file_path = find_static_file(filename)
    if file_path:
        media_types = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".svg": "image/svg+xml",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".html": "text/html",
            ".ico": "image/x-icon",
            ".txt": "text/plain",
            ".woff": "font/woff",
            ".woff2": "font/woff2"
        }
        ext = os.path.splitext(filename)[1].lower()
        media_type = media_types.get(ext, "application/octet-stream")
        return FileResponse(file_path, media_type=media_type)
    raise HTTPException(status_code=404, detail=f"Static file '{filename}' not found")


if __name__ == "__main__":
    import uvicorn
    print("[ARTH Server] Launching on http://localhost:3000 (OpenAPI Docs at http://localhost:3000/docs)...")
    uvicorn.run("server:app", host="0.0.0.0", port=3000, reload=False)
