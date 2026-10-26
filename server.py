"""
ARTH: AI Sign Language & Two-Way Voice Bridge
Root Application Launcher
"""
import sys
import os
import uvicorn

# Configure path so backend modules (database, auth, seed_data) are discoverable
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.server import app

if __name__ == "__main__":
    print("=" * 68)
    print("  ARTH: AI Sign Language & Two-Way Voice Bridge Platform")
    print("  -------------------------------------------------------------")
    print("  Server URL:    http://localhost:3000")
    print("  Landing Page:  http://localhost:3000/")
    print("  Workspace:     http://localhost:3000/translator")
    print("  Swagger Docs:  http://localhost:3000/docs")
    print("=" * 68)
    uvicorn.run("backend.server:app", host="0.0.0.0", port=3000, reload=True)
