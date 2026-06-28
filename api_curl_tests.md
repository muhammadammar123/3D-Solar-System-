# Solar System API testing with `curl`

This document details the usage of `curl` to interact with the **Solar System Interactive Encyclopedia API** (FastAPI backend).

---

## 🚀 Running the API Server

Before executing `curl` requests, ensure the backend server is running:

```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

---

## 📡 API Endpoint Testing

### 1. Get Celestial Bodies (`GET /api/celestial-bodies`)

Fetches the list of all celestial bodies along with their physical and core/mantle/crust configurations.

#### Command
```bash
curl -s http://127.0.0.1:8000/api/celestial-bodies
```

#### Response (JSON)
```json
[
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
```

---

### 2. Get Exploration Logs (`GET /api/logs`)

Fetches the saved history of space exploration logs.

#### Command
```bash
curl -s http://127.0.0.1:8000/api/logs
```

#### Response (JSON)
```json
[
  {
    "id": 1,
    "body_id": 3,
    "body_name": "Earth",
    "user_note": "Initial baseline telemetry recorded. Liquid water levels are stable.",
    "timestamp": "2026-06-28 19:25:45"
  },
  {
    "id": 2,
    "body_id": 0,
    "body_name": "Sun",
    "user_note": "Observed moderate solar flare activity. Thermal output is nominal.",
    "timestamp": "2026-06-28 19:35:45"
  }
]
```

---

### 3. Create Exploration Log (`POST /api/logs`)

Submits a new exploration log, validates the celestial body, registers it in memory, and returns the updated list.

#### Command (Git Bash / Linux / macOS)
```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"body_id": 4, "user_note": "Testing mars telemetry with curl."}' \
  http://127.0.0.1:8000/api/logs
```

#### Command (Windows PowerShell)
```powershell
curl.exe -s -X POST -H "Content-Type: application/json" -d "{\`"body_id\`": 4, \`"user_note\`": \`"Testing mars telemetry with curl.\`"}" http://127.0.0.1:8000/api/logs
```

#### Response (JSON - HTTP 201 Created)
```json
[
  {
    "id": 1,
    "body_id": 3,
    "body_name": "Earth",
    "user_note": "Initial baseline telemetry recorded. Liquid water levels are stable.",
    "timestamp": "2026-06-28 19:25:45"
  },
  {
    "id": 2,
    "body_id": 0,
    "body_name": "Sun",
    "user_note": "Observed moderate solar flare activity. Thermal output is nominal.",
    "timestamp": "2026-06-28 19:35:45"
  },
  {
    "id": 3,
    "body_id": 4,
    "body_name": "Mars",
    "user_note": "Testing mars telemetry with curl.",
    "timestamp": "2026-06-28 19:41:02"
  }
]
```

---

### 4. Create Exploration Log Error Handling (Invalid Body ID)

Tests validation by attempting to submit a log with an invalid celestial body ID.

#### Command (Git Bash / Linux / macOS)
```bash
curl -i -s -X POST -H "Content-Type: application/json" \
  -d '{"body_id": 99, "user_note": "Testing error response."}' \
  http://127.0.0.1:8000/api/logs
```

#### Command (Windows PowerShell)
```powershell
curl.exe -i -s -X POST -H "Content-Type: application/json" -d "{\`"body_id\`": 99, \`"user_note\`": \`"Testing error response.\`"}" http://127.0.0.1:8000/api/logs
```

#### Response (Headers & JSON - HTTP 404 Not Found)
```http
HTTP/1.1 404 Not Found
date: Sun, 28 Jun 2026 14:41:05 GMT
server: uvicorn
content-length: 54
content-type: application/json

{"detail":"Celestial body with ID 99 does not exist."}
```
