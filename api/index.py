import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from backend.app import app as backend_app

app = FastAPI()
app.mount("/api", backend_app)
