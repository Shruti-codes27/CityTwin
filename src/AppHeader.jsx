import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Bot,
  Users,
  Volume2,
  VolumeX,
  Zap,
  ChevronDown,
  RotateCcw,
  Waves,
  Mountain,
  Radio,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function AppHeader({
  currentView,
  globalDimension,
  onToggleDimension,
  isAutoPilotEnabled,
  onToggleAutoPilot,
  telemetry,
  onTriggerAnomaly,
  onResetToCalm,
  voiceEnabled,
  onToggleVoice,
  onOpenCopilot,
  onOpenFamily,
  familyCount = 3,
}) {
  const [showIncidentMenu, setShowIncidentMenu] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowIncidentMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCritical = telemetry?.statusLevel === "CRITICAL";

  return (
    <header className="app-unified-header">
      {/* 1. Left: Brand & View Context */}
      <div className="header-left-zone">
        <div className="header-brand">
          <div className="brand-logo-gem">
            <Activity size={18} />
          </div>
          <span className="brand-title">CityTwin</span>
        </div>

        <div className="header-divider" />

        <div className="header-status-badge">
          <span className={`live-pulse-dot ${isAutoPilotEnabled ? "active" : "idle"}`} />
          <span className="status-text">
            {isAutoPilotEnabled ? "AUTO-PILOT ACTIVE" : "MANUAL MODE"}
          </span>
        </div>
      </div>

      {/* 2. Center: Sleek Live Telemetry Strip & Incident Trigger */}
      <div className="header-center-zone">
        <div className={`compact-telemetry-chip ${isCritical ? "critical" : ""}`}>
          <div className="telemetry-sensor-group">
            <span className="sensor-pill">
              <Waves size={12} /> Mithi: <strong>{telemetry?.waterLevel?.toFixed(2) || "1.10"}m</strong>
            </span>
            <span className="sensor-pill">
              <Mountain size={12} /> Richter: <strong>{telemetry?.seismicRichter?.toFixed(1) || "1.2"}M</strong>
            </span>
            <span className="sensor-pill safety">
              <ShieldCheck size={12} /> Safety: <strong>{telemetry?.urbanSafetyScore || 85}%</strong>
            </span>
          </div>

          {/* Compact Incident Simulator Dropdown */}
          <div className="incident-dropdown-wrapper" ref={menuRef}>
            <button
              className="btn-incident-trigger"
              onClick={() => setShowIncidentMenu(!showIncidentMenu)}
              title="Test Autonomous Incident Reactions"
            >
              <Zap size={13} />
              <span>Simulate Incident</span>
              <ChevronDown size={12} />
            </button>

            {showIncidentMenu && (
              <div className="incident-menu-popup">
                <div className="menu-header">AUTO-DETECT HAZARDS</div>
                <button
                  className="menu-item"
                  onClick={() => {
                    onTriggerAnomaly("Flood");
                    setShowIncidentMenu(false);
                  }}
                >
                  <Waves size={14} color="#38bdf8" />
                  <div>
                    <strong>Mithi River Flash Flood</strong>
                    <small>Water surge &gt; 3.5m</small>
                  </div>
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    onTriggerAnomaly("Earthquake");
                    setShowIncidentMenu(false);
                  }}
                >
                  <Mountain size={14} color="#fb923c" />
                  <div>
                    <strong>6.4M Seismic Tremor</strong>
                    <small>Epicenter structural alert</small>
                  </div>
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    onTriggerAnomaly("Tsunami");
                    setShowIncidentMenu(false);
                  }}
                >
                  <Radio size={14} color="#c084fc" />
                  <div>
                    <strong>14m Coastal Tsunami Surge</strong>
                    <small>Western coast evacuation</small>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Right: Standard Controls (2D/3D, Family, AI Copilot, Audio) */}
      <div className="header-right-zone">
        {/* Standard 2D / 3D Segmented Control */}
        <div className="segmented-dimension-control">
          <button
            className={`seg-btn ${globalDimension === "2D" ? "active" : ""}`}
            onClick={() => onToggleDimension("2D")}
            title="Switch to 2D Plan View"
          >
            2D
          </button>
          <button
            className={`seg-btn ${globalDimension === "3D" ? "active" : ""}`}
            onClick={() => onToggleDimension("3D")}
            title="Switch to 3D Extruded City View"
          >
            3D
          </button>
        </div>

        {/* Family Tracking Pill Button */}
        <button
          className="btn-header-pill family-pill"
          onClick={onOpenFamily}
          title="Open Family & Community Tracking"
        >
          <Users size={15} />
          <span>Family</span>
          <span className="pill-badge-count">{familyCount}</span>
        </button>

        {/* AI Copilot Button */}
        <button
          className="btn-header-pill copilot-pill"
          onClick={onOpenCopilot}
          title="Open CityAI Emergency Assistant"
        >
          <Bot size={15} />
          <span>AI Copilot</span>
        </button>

        {/* Voice Audio Toggle */}
        <button
          className={`btn-header-icon ${voiceEnabled ? "voice-on" : ""}`}
          onClick={onToggleVoice}
          title={voiceEnabled ? "Voice Guidance: ON (Click to Mute)" : "Voice Guidance: OFF (Click to Enable)"}
        >
          {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </header>
  );
}
