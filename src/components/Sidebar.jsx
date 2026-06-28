import { useState } from 'react';
import {
  Activity,
  Database,
  Layers,
  FileText,
  Send,
  Globe,
  Compass
} from 'lucide-react';

export default function Sidebar({
  celestialBodies,
  selectedBodyId,
  timeScale,
  explodedView,
  logs,
  onTimeScaleChange,
  onToggleExplodedView,
  onAddLog
}) {
  const [logNote, setLogNote] = useState('');
  const [formBodyId, setFormBodyId] = useState(selectedBodyId || 3); // Default to Earth (3)
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active selected body details
  const activeBody = celestialBodies.find((b) => b.id === selectedBodyId);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Strict validation
    if (!logNote.trim()) {
      setFormError('Exploration note cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddLog({
        body_id: parseInt(formBodyId, 10),
        user_note: logNote.trim()
      });
      if (success) {
        setLogNote('');
      } else {
        setFormError('Failed to submit log. Server returned an error.');
      }
    } catch (err) {
      setFormError('Network error: Unable to reach the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="sidebar-panel">
      {/* Title Header */}
      <div>
        <h1>
          <Compass className="animate-spin-slow" size={24} color="var(--accent-cyan)" />
          <span>COSMOS CORE</span>
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'var(--font-hud)', letterSpacing: '0.1em' }}>
          3D ASTROPHYSICAL HUD v1.0.0
        </p>
      </div>

      {/* Physics Profile Section */}
      <section className="section-card">
        <h2>
          <Database size={18} color="var(--accent-cyan)" />
          <span>ASTROPHYSICAL DATA</span>
        </h2>
        {activeBody ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Globe size={20} color={activeBody.color} />
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'var(--font-hud)' }}>
                {activeBody.name}
              </span>
            </div>

            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">Radius Scale</div>
                <div className="metric-value">{activeBody.radius_scale}x</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Orbit Speed</div>
                <div className="metric-value">{activeBody.orbit_speed} AU/s</div>
              </div>
              <div className="metric-item" style={{ gridColumn: 'span 2' }}>
                <div className="metric-label">Distance from Sun</div>
                <div className="metric-value">{activeBody.distance_from_sun} AU</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '0.25rem' }}>
              <strong>Fact:</strong> {activeBody.fun_fact}
            </div>

            {/* Geological Layers Exploded View (Only for planets, i.e., ID != 0) */}
            {activeBody.id !== 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className={`btn-outline ${explodedView ? 'active' : ''}`}
                  onClick={onToggleExplodedView}
                >
                  <Layers size={16} />
                  <span>{explodedView ? 'Collapse Layers' : 'Inspect Geology'}</span>
                </button>

                {explodedView && (
                  <div className="layers-container">
                    <div className="layer-tag" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span>Crust</span>
                      <div className="layer-color-dot" style={{ backgroundColor: activeBody.crust_color, color: activeBody.crust_color }} />
                    </div>
                    <div className="layer-tag" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span>Mantle</span>
                      <div className="layer-color-dot" style={{ backgroundColor: activeBody.mantle_color, color: activeBody.mantle_color }} />
                    </div>
                    <div className="layer-tag" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span>Core</span>
                      <div className="layer-color-dot" style={{ backgroundColor: activeBody.core_color, color: activeBody.core_color }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
            Select a celestial body in the scene to load its physical profile.
          </div>
        )}
      </section>

      {/* Simulation Speed warp controls */}
      <section className="section-card">
        <h2>
          <Activity size={18} color="var(--accent-purple)" />
          <span>TIME ACCELERATOR</span>
        </h2>
        <div className="control-group">
          <div className="control-label">
            <span>WARP FACTOR</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{timeScale.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.1"
            value={timeScale}
            onChange={(e) => onTimeScaleChange(parseFloat(e.target.value))}
            className="warp-slider"
          />
        </div>
      </section>

      {/* Exploration Logging Form */}
      <section className="section-card">
        <h2>
          <FileText size={18} color="var(--accent-orange)" />
          <span>LOG MISSION NOTES</span>
        </h2>
        <form onSubmit={handleSubmit} className="log-form">
          <div className="control-group">
            <label className="control-label" htmlFor="body-select">Target Celestial Body</label>
            <select
              id="body-select"
              className="form-select"
              value={formBodyId}
              onChange={(e) => setFormBodyId(e.target.value)}
            >
              {celestialBodies.map((body) => (
                <option key={body.id} value={body.id}>
                  {body.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="note-textarea">Telemetry Note</label>
            <textarea
              id="note-textarea"
              className="form-textarea"
              rows="3"
              placeholder="Record geological observations or core temperature data..."
              value={logNote}
              onChange={(e) => {
                setLogNote(e.target.value);
                if (formError) setFormError(null);
              }}
            />
          </div>

          {formError && (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.75rem', fontWeight: 500 }}>
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Transmitting...' : 'Transmit Telemetry'}</span>
          </button>
        </form>
      </section>

      {/* Scrollable event history feed */}
      <section className="section-card" style={{ flexGrow: 1, minHeight: '180px' }}>
        <h2>
          <FileText size={18} color="var(--accent-yellow)" />
          <span>CHRONICLE DATA FEEDS</span>
        </h2>
        <div className="logs-list">
          {logs.length > 0 ? (
            logs.slice().reverse().map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-meta">
                  <span className="log-body-name">{log.body_name}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="log-note">{log.user_note}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
              No exploration logs recorded.
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}
