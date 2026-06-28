import { useState, useEffect } from 'react';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';
import SpaceCanvas from './components/SpaceCanvas';
import Sidebar from './components/Sidebar';

const API_BASE_URL = 'http://localhost:8000/api';

export default function App() {
  const [celestialBodies, setCelestialBodies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedBodyId, setSelectedBodyId] = useState(3); // Default focus: Earth (id = 3)
  const [timeScale, setTimeScale] = useState(1.0);
  const [explodedView, setExplodedView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch celestial body configurations
      const bodiesResponse = await fetch(`${API_BASE_URL}/celestial-bodies`);
      if (!bodiesResponse.ok) {
        throw new Error(`Failed to load astrophysical data (Status: ${bodiesResponse.status})`);
      }
      const bodiesData = await bodiesResponse.json();
      setCelestialBodies(bodiesData);

      // 2. Fetch exploration logs
      const logsResponse = await fetch(`${API_BASE_URL}/logs`);
      if (!logsResponse.ok) {
        throw new Error(`Failed to load chronicles data (Status: ${logsResponse.status})`);
      }
      const logsData = await logsResponse.json();
      setLogs(logsData);
    } catch (err) {
      console.error('Data Fetch Error:', err);
      setError(
        'Telemetry network link offline. Please ensure the FastAPI backend is running on http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler to post a new log entry
  const handleAddLog = async (logPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to transmit log.');
      }

      // API returns the complete updated list of logs
      const updatedLogs = await response.json();
      setLogs(updatedLogs);
      return true;
    } catch (err) {
      console.error('Log Transmission Error:', err);
      setError(`Transmission interrupted: ${err.message}`);
      return false;
    }
  };

  // Selector functions
  const handlePlanetSelect = (body) => {
    setSelectedBodyId(body.id);
    // Auto-disable exploded view when changing target to avoid visual jarring, unless desired
    setExplodedView(false);
  };

  return (
    <div className="app-container">
      {/* 1. Loading HUD Indicator Overlay */}
      {loading && (
        <div className="hud-loader">
          <div className="loader-spinner" />
          <span>Syncing Universe Telemetry...</span>
        </div>
      )}

      {/* 2. Connection Error Banner Overlay */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            className="btn-outline"
            onClick={fetchData}
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.75rem',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <RefreshCw size={12} />
            Retry
          </button>
          <button
            className="error-close-btn"
            onClick={() => setError(null)}
            style={{ marginLeft: '1rem' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* 3. Outer Space Viewport Panel */}
      <main style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Absolute Centered Ambient System Title */}
        <div className="system-title">
          <h1>Solar System Exploration</h1>
          <p>Interactive 3D Astrophysical Encyclopedia</p>
        </div>

        {/* Planet Quick Select Pills (Bottom Left Overlay) */}
        {celestialBodies.length > 0 && (
          <div className="celestial-list-overlay">
            {celestialBodies.map((body) => (
              <button
                key={body.id}
                className={`planet-pill ${selectedBodyId === body.id ? 'active' : ''}`}
                onClick={() => handlePlanetSelect(body)}
              >
                {body.name}
              </button>
            ))}
          </div>
        )}

        {/* WebGL 3D Canvas */}
        {celestialBodies.length > 0 ? (
          <SpaceCanvas
            celestialBodies={celestialBodies}
            selectedBodyId={selectedBodyId}
            timeScale={timeScale}
            explodedView={explodedView}
            onPlanetSelect={handlePlanetSelect}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-hud)',
              gap: '1rem',
            }}
          >
            <Compass className="animate-spin-slow" size={48} />
            <span>Establishing connection with Cosmos DB...</span>
          </div>
        )}
      </main>

      {/* 4. Controls HUD Sidebar Panel */}
      <Sidebar
        celestialBodies={celestialBodies}
        selectedBodyId={selectedBodyId}
        timeScale={timeScale}
        explodedView={explodedView}
        logs={logs}
        onTimeScaleChange={setTimeScale}
        onToggleExplodedView={() => setExplodedView(!explodedView)}
        onAddLog={handleAddLog}
      />
    </div>
  );
}
