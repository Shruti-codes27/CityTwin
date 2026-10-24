import { useState, useEffect } from "react";
import {
  Bot,
  Activity,
  Waves,
  Mountain,
  Radio,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AutoPilotBanner({
  isAutoPilotEnabled,
  onToggleAutoPilot,
  telemetry,
  onTriggerAnomaly,
  onResetToCalm,
  voiceEnabled,
  onToggleVoice,
}) {
  const [expanded, setExpanded] = useState(true);

  const getStatusBadge = (statusLevel) => {
    switch (statusLevel) {
      case "CRITICAL":
        return <span className="telemetry-badge-critical">CRITICAL ALERT</span>;
      case "WARNING":
        return <span className="telemetry-badge-warning">ELEVATED WARNING</span>;
      default:
        return <span className="telemetry-badge-normal">NOMINAL STATUS</span>;
    }
  };

  return (
    <header className="autopilot-hud-header">
      <div className="autopilot-top-strip">
        <div className="autopilot-brand-badge">
          <div className={`status-beacon ${isAutoPilotEnabled ? "active-beacon" : "idle-beacon"}`} />
          <div className="autopilot-title-group">
            <span className="autopilot-label">
              <Bot size={15} /> AUTO-PILOT INTELLIGENCE
            </span>
            <span className="autopilot-state">
              {isAutoPilotEnabled ? "AUTONOMOUS MONITORING ON" : "MANUAL MODE"}
            </span>
          </div>
        </div>

        {/* Live Status Message */}
        <div className="autopilot-live-message">
          {telemetry.statusLevel === "CRITICAL" ? (
            <AlertTriangle size={16} className="pulse-danger-icon" />
          ) : (
            <ShieldCheck size={16} className="nominal-icon" />
          )}
          <span className="message-text">{telemetry.activeAlertMessage}</span>
        </div>

        {/* Action Controls */}
        <div className="autopilot-actions-group">
          {/* Rapid Test Buttons */}
          <div className="rapid-triggers-dropdown">
            <button
              className="btn-trigger-anomaly flood"
              onClick={() => onTriggerAnomaly("Flood")}
              title="Simulate rapid cloudburst and Mithi river surge"
            >
              <Waves size={14} /> Auto-Detect Flood
            </button>
            <button
              className="btn-trigger-anomaly tremor"
              onClick={() => onTriggerAnomaly("Earthquake")}
              title="Simulate 6.4 magnitude seismic tremor"
            >
              <Mountain size={14} /> Auto-Detect Quake
            </button>
            <button
              className="btn-trigger-anomaly tsunami"
              onClick={() => onTriggerAnomaly("Tsunami")}
              title="Simulate coastal tsunami wave surge"
            >
              <Waves size={14} /> Auto-Detect Tsunami
            </button>
            <button
              className="btn-trigger-reset"
              onClick={onResetToCalm}
              title="Reset telemetry to calm city baseline"
            >
              <RotateCcw size={14} /> Calm City
            </button>
          </div>

          {/* Voice Toggle */}
          <button
            className={`btn-autopilot-icon ${voiceEnabled ? "voice-on" : ""}`}
            onClick={onToggleVoice}
            title={voiceEnabled ? "Mute Spoken Audio Guidance" : "Enable Spoken Audio Guidance"}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Auto-Pilot Toggle Switch */}
          <label className="autopilot-switch" title="Toggle Autonomous City Mode">
            <input
              type="checkbox"
              checked={isAutoPilotEnabled}
              onChange={(e) => onToggleAutoPilot(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>

          {/* Expand/Collapse telemetry bar */}
          <button
            className="btn-collapse-toggle"
            onClick={() => setExpanded(!expanded)}
            title="Toggle Telemetry Stream View"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE TELEMETRY STRIP */}
      {expanded && (
        <div className="autopilot-telemetry-sensors-grid">
          <div className={`sensor-item ${telemetry.waterLevel > 2.5 ? "sensor-danger" : ""}`}>
            <div className="sensor-header">
              <Waves size={14} /> MITHI RIVER SENSOR
            </div>
            <div className="sensor-reading">
              <strong>{telemetry.waterLevel.toFixed(2)} m</strong>
              <small>{telemetry.waterLevelTrend}</small>
            </div>
          </div>

          <div className={`sensor-item ${telemetry.seismicRichter > 4.0 ? "sensor-danger" : ""}`}>
            <div className="sensor-header">
              <Mountain size={14} /> SEISMOMETER (RICHTER)
            </div>
            <div className="sensor-reading">
              <strong>{telemetry.seismicRichter.toFixed(1)} M</strong>
              <small>{telemetry.seismicTrend}</small>
            </div>
          </div>

          <div className={`sensor-item ${telemetry.coastalSurge > 5.0 ? "sensor-danger" : ""}`}>
            <div className="sensor-header">
              <Radio size={14} /> COASTAL TIDE GAUGE
            </div>
            <div className="sensor-reading">
              <strong>{telemetry.coastalSurge.toFixed(1)} m</strong>
              <small>Western Arabian Sea</small>
            </div>
          </div>

          <div className={`sensor-item ${telemetry.urbanSafetyScore < 50 ? "sensor-danger" : ""}`}>
            <div className="sensor-header">
              <ShieldCheck size={14} /> URBAN SAFETY INDEX
            </div>
            <div className="sensor-reading">
              <strong>{telemetry.urbanSafetyScore}%</strong>
              <small>{getStatusBadge(telemetry.statusLevel)}</small>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
