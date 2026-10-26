# ARTH Backend API Server

Production-grade **FastAPI** backend powering the ARTH Assistive Intelligence platform with 37 RESTful endpoints, JWT security, and SQLite persistence.

---

## Capabilities

- **Authentication & User Management**: Secure bcrypt password hashing, PyJWT HS256 authentication tokens, session validation, and profile management.
- **Real-Time Translation Log**: Synchronizes sign-to-voice and voice-to-sign translations with timestamping and accuracy tracking.
- **Two-Way Dialogue Bridge**: Creates consultation and conversation sessions between deaf and hearing users with full transcripts.
- **Practice Shiksha Engine**: Tracks learning modules, user performance scores, and daily practice streaks.
- **Emergency SOS Dispatch**: Broadcasts one-tap emergency alerts and coordinates trusted contact responses.
- **Interactive OpenAPI Documentation**: Auto-generated Swagger UI and ReDoc specifications available on server start.

---

## File Directory

| File | Description |
| :--- | :--- |
| `server.py` | Core FastAPI application serving all 37 API routes, middleware, and dynamic static asset fallback handlers. |
| `auth.py` | Password encryption (bcrypt) and PyJWT bearer token creation and dependency guards. |
| `database.py` | SQLite connection layer, table initialization, and CRUD query handlers. |
| `seed_data.py` | Built-in seed data for gestures, emergency cards, and default demo user accounts. |
| `requirements.txt` | Python package dependencies for backend runtime. |

---

## API Endpoints Overview

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register a new user account |
| **Auth** | `/api/auth/login` | `POST` | Authenticate and obtain JWT access token |
| **Auth** | `/api/auth/me` | `GET` | Get profile details of authenticated user |
| **Translations** | `/api/translations` | `GET/POST` | List recent translations or record a new gesture |
| **Dialogue** | `/api/conversations` | `GET/POST` | Manage two-way dialogue consultation sessions |
| **Practice** | `/api/practice/stats` | `GET` | Retrieve learning streaks, accuracy, and completed modules |
| **Emergency** | `/api/sos/broadcast` | `POST` | Dispatch emergency distress signal |
| **Dictionary** | `/api/dictionary` | `GET` | Search and filter sign vocabulary and fingerspeller poses |

---

## Running Standalone

From this directory:
```bash
pip install -r requirements.txt
python server.py
```
Or with Uvicorn:
```bash
uvicorn server:app --host 0.0.0.0 --port 3000 --reload
```
Interactive API documentation will be available at `http://localhost:3000/docs`.
