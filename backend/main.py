import csv
import datetime
import os
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Solar System Interactive Encyclopedia API",
    description="Backend API serving astrophysical profiles and registering logs for the 3D Solar System.",
    version="1.0.0"
)

# CORS Enforcement: Explicitly accept requests from React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY DATA STORAGE ---

# Astrophysical Profiles for Celestial Bodies
CELESTIAL_BODIES_DB = [
    {
        "id": 0,
        "name": "Sun",
        "color": "#ffdd00",
        "radius_scale": 3.0,
        "orbit_speed": 0.0,
        "distance_from_sun": 0.0,
        "fun_fact": "The Sun accounts for 99.86% of the mass in the Solar System and generates energy via nuclear fusion.",
        "core_color": "#ffcc00",
        "mantle_color": "#ff9900",
        "crust_color": "#ff3300"
    },
    {
        "id": 1,
        "name": "Mercury",
        "color": "#888888",
        "radius_scale": 0.8,
        "orbit_speed": 1.5,
        "distance_from_sun": 6.0,
        "fun_fact": "Mercury is the smallest planet in our solar system and experiences extreme temperature fluctuations.",
        "core_color": "#555555",
        "mantle_color": "#777777",
        "crust_color": "#999999"
    },
    {
        "id": 2,
        "name": "Venus",
        "color": "#e3bb76",
        "radius_scale": 1.2,
        "orbit_speed": 1.1,
        "distance_from_sun": 9.0,
        "fun_fact": "Venus is the hottest planet in our solar system due to a runaway greenhouse effect from its thick atmosphere.",
        "core_color": "#b8860b",
        "mantle_color": "#d2b48c",
        "crust_color": "#f5deb3"
    },
    {
        "id": 3,
        "name": "Earth",
        "color": "#287ab8",
        "radius_scale": 1.3,
        "orbit_speed": 0.8,
        "distance_from_sun": 13.0,
        "fun_fact": "Earth is the only known planet to harbor liquid water on its surface and sustain complex living ecosystems.",
        "core_color": "#ff4500",
        "mantle_color": "#e9967a",
        "crust_color": "#006400"
    },
    {
        "id": 4,
        "name": "Mars",
        "color": "#c1440e",
        "radius_scale": 1.0,
        "orbit_speed": 0.6,
        "distance_from_sun": 17.0,
        "fun_fact": "Mars is known as the Red Planet due to iron oxide rust on its surface and possesses the tallest volcano in the solar system.",
        "core_color": "#8b0000",
        "mantle_color": "#cd5c5c",
        "crust_color": "#a0522d"
    }
]

# --- CSV DATABASE CONFIGURATION ---
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), "logs.csv")

def load_logs_from_csv() -> List[dict]:
    logs = []
    if not os.path.exists(CSV_FILE_PATH):
        # Initialize the CSV database file with seed data if it doesn't exist
        default_logs = [
            {
                "id": 1,
                "body_id": 3,
                "body_name": "Earth",
                "user_note": "Initial baseline telemetry recorded. Liquid water levels are stable.",
                "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": 2,
                "body_id": 0,
                "body_name": "Sun",
                "user_note": "Observed moderate solar flare activity. Thermal output is nominal.",
                "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
        save_all_logs_to_csv(default_logs)
        return default_logs

    try:
        with open(CSV_FILE_PATH, mode="r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                logs.append({
                    "id": int(row["id"]),
                    "body_id": int(row["body_id"]),
                    "body_name": row["body_name"],
                    "user_note": row["user_note"],
                    "timestamp": row["timestamp"]
                })
    except Exception as e:
        print(f"Error loading logs from CSV: {e}")
    return logs

def save_all_logs_to_csv(logs: List[dict]):
    try:
        with open(CSV_FILE_PATH, mode="w", encoding="utf-8", newline="") as f:
            fieldnames = ["id", "body_id", "body_name", "user_note", "timestamp"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for log in logs:
                writer.writerow(log)
    except Exception as e:
        print(f"Error saving logs to CSV: {e}")

def append_log_to_csv(log: dict):
    file_exists = os.path.exists(CSV_FILE_PATH)
    try:
        with open(CSV_FILE_PATH, mode="a", encoding="utf-8", newline="") as f:
            fieldnames = ["id", "body_id", "body_name", "user_note", "timestamp"]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerow(log)
    except Exception as e:
        print(f"Error appending log to CSV: {e}")

# --- PYDANTIC SCHEMAS ---

class CelestialBodyResponse(BaseModel):
    id: int
    name: str
    color: str
    radius_scale: float
    orbit_speed: float
    distance_from_sun: float
    fun_fact: str
    core_color: str
    mantle_color: str
    crust_color: str

class LogCreate(BaseModel):
    body_id: int = Field(..., description="ID of the celestial body being explored")
    user_note: str = Field(..., min_length=1, max_length=1000, description="Exploration notes by the researcher")

class LogResponse(BaseModel):
    id: int
    body_id: int
    body_name: str
    user_note: str
    timestamp: str

# --- API ROUTES ---

@app.get("/api/celestial-bodies", response_model=List[CelestialBodyResponse])
async def get_celestial_bodies():
    """Fetches the list of all celestial bodies and their physical configurations."""
    return CELESTIAL_BODIES_DB

@app.get("/api/logs", response_model=List[LogResponse])
async def get_logs():
    """Fetches the history of saved space exploration logs from the CSV database."""
    return load_logs_from_csv()

@app.post("/api/logs", response_model=List[LogResponse], status_code=status.HTTP_201_CREATED)
async def create_log(payload: LogCreate):
    """
    Accepts an exploration log, validates the celestial body existence,
    registers the log in the CSV database, and returns the complete updated list of logs.
    """
    # Verify the body_id exists in the database
    matched_body = next((body for body in CELESTIAL_BODIES_DB if body["id"] == payload.body_id), None)
    if not matched_body:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Celestial body with ID {payload.body_id} does not exist."
        )
    
    # Load current logs to compute the next incremental ID
    current_logs = load_logs_from_csv()
    new_id = (current_logs[-1]["id"] + 1) if current_logs else 1
    
    # Create the log object
    new_log = {
        "id": new_id,
        "body_id": payload.body_id,
        "body_name": matched_body["name"],
        "user_note": payload.user_note,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Append the log to the CSV database file
    append_log_to_csv(new_log)
    
    # Return the updated list of logs
    return load_logs_from_csv()
