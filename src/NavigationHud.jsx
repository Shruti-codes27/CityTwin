import { useState } from "react";
import {
  Navigation,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Route,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  MapPin,
  Bot,
  PhoneCall,
  Download,
  ListOrdered,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

export default function NavigationHud({
  route,
  currentStepIndex = 0,
  isNavigating = false,
  onToggleNavigation,
  onResetNavigation,
  onToggleAlternateRoute,
  isAlternate = false,
  voiceEnabled = true,
  onToggleVoice,
  onDispatchDrone,
  isDroneDispatched = false,
  onSelectHotspot,
  selectedHotspotId,
  hotspots = [],
}) {
  const [showStepDrawer, setShowStepDrawer] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showHotspotSelect, setShowHotspotSelect] = useState(false);

  if (!route || !route.instructions || route.instructions.length === 0) {
    return null;
  }

  const currentInstruction =
    route.instructions[currentStepIndex] || route.instructions[0];
  const nextInstruction = route.instructions[currentStepIndex + 1];

  const getManeuverIcon = (maneuver) => {
    switch (maneuver) {
      case "turn-right":
      case "fork-right":
        return <CornerUpRight size={26} />;
      case "turn-left":
      case "fork-left":
        return <CornerUpLeft size={26} />;
      case "slight-left":
        return <CornerUpLeft size={24} style={{ transform: "rotate(20deg)" }} />;
      case "slight-right":
        return <CornerUpRight size={24} style={{ transform: "rotate(-20deg)" }} />;
      case "arrive":
        return <CheckCircle2 size={26} />;
      case "depart":
      case "straight":
      default:
        return <ArrowUp size={26} />;
    }
  };

  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  return (
    <div className="google-nav-hud-overlay">
      {/* 1. TOP-LEFT: MINIMAL CITIZEN SECTOR SELECTOR */}
      <div className="gmaps-sector-selector">
        <button
          className="btn-sector-dropdown"
          onClick={() => setShowHotspotSelect(!showHotspotSelect)}
        >
          <MapPin size={13} color="#38bdf8" />
          <span>Sector: <strong>{selectedHotspot?.name?.split(" ")[0]}</strong></span>
          <ChevronDown size={12} />
        </button>

        {showHotspotSelect && (
          <div className="sector-dropdown-menu">
            <div className="sector-dropdown-label">SELECT CITIZEN SECTOR</div>
            {hotspots.map((h) => (
              <button
                key={h.id}
                className={`sector-option ${selectedHotspotId === h.id ? "active" : ""}`}
                onClick={() => {
                  onSelectHotspot(h);
                  setShowHotspotSelect(false);
                }}
              >
                <strong>{h.name}</strong>
                <small>{h.riskProfile}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. TOP-CENTER: STANDARD GOOGLE MAPS GUIDANCE BANNER */}
      <div className="gmaps-top-banner">
        <div className="gmaps-maneuver-icon">
          {getManeuverIcon(currentInstruction.maneuver)}
        </div>

        <div className="gmaps-direction-info">
          <div className="gmaps-step-distance">
            In {currentInstruction.distanceMeters} m
          </div>
          <div className="gmaps-step-road">
            {currentInstruction.instruction}
          </div>
          {nextInstruction && (
            <div className="gmaps-next-step">
              Then: {nextInstruction.road}
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM-CENTER: STANDARD FLOATING GOOGLE MAPS TRIP BAR */}
      <div className="gmaps-bottom-trip-card">
        {/* Progress bar */}
        <div className="gmaps-progress-bar-bg">
          <div
            className="gmaps-progress-bar-fill"
            style={{
              width: `${Math.round(((currentStepIndex + 1) / route.instructions.length) * 100)}%`,
            }}
          />
        </div>

        <div className="gmaps-trip-main-row">
          {/* ETA & Distance */}
          <div className="gmaps-eta-block">
            <div className="gmaps-eta-minutes">{route.totalMinutes} min</div>
            <div className="gmaps-eta-meta">
              <span>{route.totalDistanceKm} km</span>
              <span className="meta-dot">·</span>
              <span>ETA {route.etaString}</span>
              <span className="meta-dot">·</span>
              <span className="safety-tag">High Ground</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="gmaps-control-buttons">
            <button
              className={`btn-nav-primary ${isNavigating ? "active-drive" : ""}`}
              onClick={onToggleNavigation}
              title={isNavigating ? "Pause Drive" : "Start Live Driving Navigation"}
            >
              {isNavigating ? (
                <>
                  <Pause size={16} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Start Nav</span>
                </>
              )}
            </button>

            <button
              className="btn-nav-secondary"
              onClick={onToggleAlternateRoute}
              title="Toggle Elevated Flyover Detour"
            >
              <Route size={15} />
              <span>{isAlternate ? "Main Route" : "Detour"}</span>
            </button>

            <button
              className="btn-nav-icon"
              onClick={() => setShowStepDrawer(!showStepDrawer)}
              title="Turn Directions"
            >
              <ListOrdered size={16} />
            </button>

            <button
              className={`btn-nav-icon drone-btn ${isDroneDispatched ? "active-drone" : ""}`}
              onClick={onDispatchDrone}
              title="Dispatch Rescue Drone"
            >
              <Bot size={16} />
            </button>

            <button
              className="btn-nav-icon sos-btn"
              onClick={() => setShowSosModal(true)}
              title="Emergency SOS"
            >
              <PhoneCall size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. STEP-BY-STEP DIRECTIONS DRAWER */}
      {showStepDrawer && (
        <div className="gmaps-steps-drawer">
          <div className="drawer-header">
            <div>
              <h3>Turn-by-turn Navigation</h3>
              <p>
                {route.totalDistanceKm} km · {route.totalMinutes} min escape corridor
              </p>
            </div>
            <button
              className="btn-close-drawer"
              onClick={() => setShowStepDrawer(false)}
            >
              <X size={18} />
            </button>
          </div>

          <div className="drawer-steps-list">
            {route.instructions.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`drawer-step-item ${isCurrent ? "current" : ""} ${
                    isPassed ? "passed" : ""
                  }`}
                >
                  <div className="step-number-badge">
                    {isPassed ? "✓" : idx + 1}
                  </div>
                  <div className="step-body">
                    <div className="step-instruction-text">
                      {step.instruction}
                    </div>
                    <div className="step-sub-meta">
                      <span>{step.distanceMeters} m</span>
                      <span className="safety-tag">{step.safetyStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="drawer-footer">
            <button
              className="btn-download-card"
              onClick={() => {
                setShowStepDrawer(false);
                setShowOfflineModal(true);
              }}
            >
              <Download size={15} /> Save Offline Evacuation Card
            </button>
          </div>
        </div>
      )}

      {/* 5. OFFLINE EVACUATION CARD MODAL */}
      {showOfflineModal && (
        <div className="modal-backdrop" onClick={() => setShowOfflineModal(false)}>
          <div
            className="offline-card-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="offline-card-header">
              <ShieldCheck size={24} color="#10b981" />
              <div>
                <h3>OFFLINE EMERGENCY ESCAPE CARD</h3>
                <small>Mumbai Disaster Management Protocol</small>
              </div>
              <button
                className="btn-close-modal"
                onClick={() => setShowOfflineModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="offline-card-body">
              <div className="card-info-box">
                <strong>SAFE REFUGE DESTINATION:</strong>
                <div>{route.destination?.name}</div>
                <small>{route.destination?.supplies}</small>
              </div>

              <div className="card-route-summary">
                <div>
                  <strong>Estimated Distance:</strong> {route.totalDistanceKm} km
                </div>
                <div>
                  <strong>Estimated Escape Time:</strong> {route.totalMinutes} min
                </div>
                <div>
                  <strong>Corridor Security:</strong> Monitored Elevated Roadway
                </div>
              </div>

              <h4>TURN-BY-TURN PROTOCOL:</h4>
              <ol className="card-steps-ol">
                {route.instructions.map((step) => (
                  <li key={step.id}>
                    <strong>{step.instruction}</strong> ({step.distanceMeters}m)
                  </li>
                ))}
              </ol>

              <div className="card-emergency-contacts">
                <strong>EMERGENCY HOTLINES:</strong>
                <div className="contact-pills">
                  <span>Ambulance: 108</span>
                  <span>National SOS: 112</span>
                  <span>Disaster Control: 1070</span>
                  <span>Coast Guard: 1554</span>
                </div>
              </div>
            </div>

            <div className="offline-card-footer">
              <button
                className="btn-print-action"
                onClick={() => window.print()}
              >
                <Download size={15} /> Print / Save PDF
              </button>
              <button
                className="btn-dismiss-action"
                onClick={() => setShowOfflineModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMERGENCY SOS CALL MODAL */}
      {showSosModal && (
        <div className="modal-backdrop" onClick={() => setShowSosModal(false)}>
          <div className="sos-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sos-modal-header">
              <AlertTriangle size={26} color="#ef4444" />
              <div>
                <h3>EMERGENCY SOS DISPATCH</h3>
                <small>Transmit GPS Coordinates to Mumbai Control Room</small>
              </div>
            </div>

            <div className="sos-modal-body">
              <p>
                Transmitting distress beacon with your live coordinates, safety
                elevation, and nearest shelter request to NDRF & Disaster Command.
              </p>

              <div className="sos-status-box">
                <div className="sos-status-item">
                  <span className="sos-label">COORDINATES:</span>
                  <span className="sos-value">
                    {route.waypoints[0][0].toFixed(4)}° N,{" "}
                    {route.waypoints[0][1].toFixed(4)}° E
                  </span>
                </div>
                <div className="sos-status-item">
                  <span className="sos-label">NEAREST REFUGE:</span>
                  <span className="sos-value">{route.destination?.name}</span>
                </div>
                <div className="sos-status-item">
                  <span className="sos-label">BEACON STATUS:</span>
                  <span className="sos-value ok-green">ACTIVE BROADCAST</span>
                </div>
              </div>

              <div className="emergency-call-actions">
                <a href="tel:112" className="btn-call-emergency">
                  <PhoneCall size={16} /> Call 112 (National Emergency)
                </a>
                <a href="tel:108" className="btn-call-emergency ambulance">
                  <PhoneCall size={16} /> Call 108 (Medical Ambulance)
                </a>
              </div>
            </div>

            <div className="sos-modal-footer">
              <button
                className="btn-dismiss-action"
                onClick={() => setShowSosModal(false)}
              >
                Cancel / Return to Navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
