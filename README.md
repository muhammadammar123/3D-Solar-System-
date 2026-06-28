# 🌌 3D Solar System Exploration & Astrophysical Encyclopedia

Welcome to the **3D Solar System Exploration & Astrophysical Encyclopedia**—a highly interactive web application combining a WebGL-powered 3D planetary simulation with a FastAPI backend. This project allows users to explore physical properties, examine the geological layers of celestial bodies (Crust, Mantle, and Core) through an animated exploded view, control orbital physics, and document their scientific observations via a persistent journaling log database.

---

## 🚀 Key Features

*   **Interactive 3D Space Simulation**: Rendered dynamically using Three.js and React Three Fiber, featuring Orbit Controls for panning, zooming, and rotation.
*   **Geological Exploded View**: Deconstruct selected celestial bodies on-the-fly to view their internal composition (Core, Mantle, and Crust layers) with smooth LERP animations.
*   **Real-Time Physics Controls**: Dynamically alter the orbital speeds of planets using HUD-based telemetry controls.
*   **Persistent Exploration Journal**: Submit, validate, and view research notes saved directly to a CSV-based database on the backend server.
*   **Futuristic HUD Design**: Styled using a premium sci-fi translucent glassmorphism theme, featuring custom telemetry loading indicators and robust network offline error handling.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19** & **Vite**: A modern, ultra-fast building tool and runtime.
*   **React Three Fiber (R3F)** & **Drei**: Declative WebGL & helper libraries wrapping Three.js.
*   **Three.js**: The underlying 3D engine for rendering meshes, orbits, materials, and lighting.
*   **Lucide React**: For sleek, modern dashboard HUD iconography.
*   **Vanilla CSS**: High-performance layout styling with glassmorphism design tokens.

### Backend
*   **FastAPI**: A high-performance Python ASGI web framework for building APIs.
*   **Pydantic**: Robust data validation and settings management using Python type annotations.
*   **Uvicorn**: A lightning-fast ASGI server implementation for Python.
*   **CSV Database**: A lightweight, file-based persistence system storing telemetry logs in `logs.csv`.

---

## 📂 Project Structure

```text
Preserve_My_World_Assesment/
├── backend/
│   ├── main.py              # FastAPI application & CSV database management
│   └── requirements.txt     # Python backend dependencies
├── src/
│   ├── assets/              # Static frontend assets
│   ├── components/          # React Components
│   │   ├── CameraController.jsx # Smooth zooming & focus target calculations
│   │   ├── Planet.jsx           # Renders 3D planet bodies, orbits, & core layers
│   │   ├── Sidebar.jsx          # Futuristic UI controller & journal form
│   │   └── SpaceCanvas.jsx      # Sets up WebGL lights, camera, & planetary loop
│   ├── App.css              # Frontend styling (HUD overlay layout)
│   ├── App.jsx              # Main App wrapper managing state & API fetch
│   ├── index.css            # Base design system tokens & animations
│   └── main.jsx             # React entry point
├── index.html               # Main HTML document template
├── package.json             # Node package configuration
├── vite.config.js           # Vite development server settings
└── api_curl_tests.md        # API testing commands & responses
```

---

## ⚙️ Getting Started & Local Setup

To run the complete system locally, you need to spin up both the FastAPI backend and the React/Vite development server.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment (recommended):
   ```bash
   python -m venv venv
   # Activate on Windows:
   .\venv\Scripts\activate
   # Activate on macOS/Linux:
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the Uvicorn web server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

---

### 2. Frontend Setup

1. In a new terminal window, navigate to the root directory:
   ```bash
   cd Preserve_My_World_Assesment
   ```

2. Install the frontend npm packages:
   ```bash
   npm install
   ```

3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open locally at [http://localhost:5173](http://localhost:5173).*

---

## 📡 API Endpoints

The backend exposes the following RESTful API endpoints:

### `GET /api/celestial-bodies`
Retrieves physical and color profiles of the celestial bodies in the encyclopedia database.
*   **Response Format**: `Array of objects` containing `id`, `name`, `radius_scale`, `distance_from_sun`, `orbit_speed`, `fun_fact`, `core_color`, `mantle_color`, `crust_color`.

### `GET /api/logs`
Fetches a list of all submitted exploration log notes ordered chronologically.
*   **Response Format**: `Array of objects` containing `id`, `body_id`, `body_name`, `user_note`, `timestamp`.

### `POST /api/logs`
Submits a new journal entry for a celestial body.
*   **Request Payload**:
    ```json
    {
      "body_id": 3,
      "user_note": "Exploration note details."
    }
    ```
*   **Response Format**: Returns the complete, updated list of logs.
*   **Status Codes**:
    *   `201 Created`: Telemetry successfully written.
    *   `404 Not Found`: Invalid celestial body ID provided.
    *   `422 Unprocessable Entity`: Validation failed (e.g. empty message).

> [!TIP]
> For complete instructions on testing endpoints directly using command-line commands, check out [api_curl_tests.md](file:///c:/Users/Muhammad%20Ammar/Desktop/Preserve_My_World_Assesment/api_curl_tests.md).

---

## 🎨 Interactive Controls & UI Controls
*   **Left Click + Drag**: Rotate camera angles around the active planetary pivot.
*   **Right Click + Drag / Shift + Drag**: Pan the viewport.
*   **Scroll Wheel**: Zoom in or out.
*   **Planet Selector Pills**: Immediately centers the camera's focus on the clicked planet.
*   **Speed Slider**: Adjust the simulation's orbital speed from `0.0x` (frozen) up to `5.0x`.
*   **Exploded View Toggle**: Expands the planet's layers to examine core geology. Only operates on the currently focused body (excluding the Sun).
