# ARTH Database Architecture

This directory houses the relational SQLite3 database engine and schema definitions for the **ARTH (अर्थ)** Assistive Platform.

---

## Relational Schema Overview

The database contains 9 structured relational tables optimized for fast edge performance with indexes:

```
                          +------------------------+
                          |         users          |
                          +-----------+------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+------------------+       +----------------------+     +--------------------+
|   translations   |       | conversation_sessions|     | practice_progress  |
+------------------+       +----------+-----------+     +--------------------+
                                      |
                                      v
                           +----------------------+
                           |conversation_messages |
                           +----------------------+

         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+---------------------+                                   +--------------------+
|  emergency_contacts |                                   |   user_bookmarks   |
+---------------------+                                   +----------+---------+
         |                                                           |
         v                                                           v
+---------------------+                                   +--------------------+
|  emergency_sos_logs |                                   |  sign_dictionary   |
+---------------------+                                   +--------------------+
```

---

## Tables Description

1. **`users`**: User accounts, bcrypt password hashes, accessibility preferences, dialect configurations (ASL / ISL), and timestamps.
2. **`translations`**: Real-time sign-to-speech and speech-to-sign translations with confidence metrics.
3. **`conversation_sessions`**: Two-way Dialogue Bridge consultation sessions between hearing and deaf participants.
4. **`conversation_messages`**: Synchronized chat transcripts with audio vocalization tags.
5. **`practice_progress`**: ARTH Shiksha curriculum scoring, accuracy benchmarks, and daily learning streaks.
6. **`emergency_contacts`**: Trusted emergency response contacts for one-tap SOS dispatch.
7. **`emergency_sos_logs`**: Timestamped record of emergency broadcast events and sirens.
8. **`sign_dictionary`**: Visual sign language library comprising 500+ everyday words, hand poses, and all 26 A-Z fingerspeller gestures.
9. **`user_bookmarks`**: Saved dictionary cards for quick recall.

---

## Running Migrations / Seeding

The database auto-initializes upon launching the server:
```bash
python database/database.py
```
Or view the raw schema in [`schema.sql`](./schema.sql).
