import { useState, useEffect } from "react";
import {
  Activity,
  Waves,
  Mountain,
  Radio,
  MapPin,
  ShieldAlert,
  BarChart3,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import AppHeader from "./AppHeader";
import Map2D from "./Map2D";
import City3DMap from "./City3DMap";
import DisasterSim from "./DisasterSim";
import ImpactAnalysis from "./ImpactAnalysis";
import EmergencyResponse from "./EmergencyResponse";
import GoogleEscapeView from "./GoogleEscapeView";
import AICopilotDrawer from "./AICopilotDrawer";
import FamilyTrackerDrawer from "./FamilyTrackerDrawer";
import { SCENARIOS } from "./data";
import {
  CITIZEN_HOTSPOTS,
  SAFE_HAVENS,
  calculateGoogleEscapeRoute,
  speakNavigationInstruction,
} from "./navigationEngine";
import {
  INITIAL_TELEMETRY,
  ANOMALY_PRESETS,
} from "./autoPilotEngine";
import { INITIAL_FAMILY_MEMBERS } from "./services/familyEngine";

const VIEWS = [
  {
    id: "Navigate",
    label: "Escape Navigator",
    icon: Navigation,
    breadcrumb: "GOOGLE MAPS ESCAPE",
    badge: "AUTO",
  },
  {
    id: "Overview",
    label: "City Overview",
    icon: MapPin,
    breadcrumb: "CITY OVERVIEW",
  },
  {
    id: "Simulation",
    label: "Disaster Simulator",
    icon: Radio,
    breadcrumb: "DISASTER SIMULATOR",
  },
  {
    id: "Response",
    label: "Emergency Facilities",
    icon: ShieldCheck,
    breadcrumb: "EMERGENCY RESPONSE",
  },
  {
    id: "Impact",
    label: "Impact Analysis",
    icon: BarChart3,
    breadcrumb: "IMPACT ANALYSIS",
  },
];

function App() {
  const [view, setView] = useState("Navigate");
  const [scenario, setScenario] = useState("Flood");
  const [params, setParams] = useState({
    waterLevel: 3.5,
    magnitude: 6.4,
    waveHeight: 12,
  });

  // Global map dimension switch (2D vs 3D)
  const [globalDimension, setGlobalDimension] = useState("2D");

  // Autonomous Intelligence state
  const [isAutoPilotEnabled, setIsAutoPilotEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [telemetry, setTelemetry] = useState(ANOMALY_PRESETS.Flood.telemetry);
  const [userLocation, setUserLocation] = useState(CITIZEN_HOTSPOTS[0].position);

  // Smart Features Drawers (Option 1 & Option 8)
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState(INITIAL_FAMILY_MEMBERS);

  // Active calculated escape route
  const activeRoute = calculateGoogleEscapeRoute(userLocation, SAFE_HAVENS[0]);

  // Background Telemetry Simulation loop
  useEffect(() => {
    if (!isAutoPilotEnabled) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const delta = (Math.random() - 0.5) * 0.04;
        const newWater = Math.max(0.6, Number((prev.waterLevel + delta).toFixed(2)));
        return {
          ...prev,
          waterLevel: newWater,
          lastUpdated: new Date().toLocaleTimeString(),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPilotEnabled]);

  // Autonomous Anomaly Trigger
  const handleTriggerAnomaly = (type) => {
    const preset = ANOMALY_PRESETS[type];
    if (!preset) return;

    setScenario(preset.scenario);
    setParams(preset.params);
    setTelemetry(preset.telemetry);
    setView("Navigate");

    if (voiceEnabled) {
      speakNavigationInstruction(preset.voiceAnnouncement, voiceEnabled);
    }
  };

  const selectScenario = (name) => {
    setScenario(name);
    const preset = ANOMALY_PRESETS[name];
    if (preset) {
      setTelemetry(preset.telemetry);
      setParams(preset.params);
    }
  };

  const currentView = VIEWS.find((v) => v.id === view) || VIEWS[0];

  return (
    <div className="app-root">
      {/* 1. UNIFIED EXECUTIVE TOP NAVBAR */}
      <AppHeader
        currentView={currentView}
        globalDimension={globalDimension}
        onToggleDimension={setGlobalDimension}
        isAutoPilotEnabled={isAutoPilotEnabled}
        onToggleAutoPilot={setIsAutoPilotEnabled}
        telemetry={telemetry}
        onTriggerAnomaly={handleTriggerAnomaly}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenFamily={() => setIsFamilyOpen(true)}
        familyCount={familyMembers.length}
      />

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN WORKSPACE) */}
      <div className="app-workspace-body">
        {/* SLIM STANDARD SIDEBAR */}
        <aside className="sidebar-standard">
          <div className="sidebar-section-title">NAVIGATION</div>
          <nav className="sidebar-nav-list">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  className={`nav-button ${view === v.id ? "active" : ""}`}
                  onClick={() => setView(v.id)}
                >
                  <Icon size={17} />
                  <span>{v.label}</span>
                  {v.badge && <span className="nav-auto-badge">{v.badge}</span>}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-section-title">ACTIVE HAZARD MODE</div>
          <div className="sidebar-scenario-chips">
            {Object.entries(SCENARIOS).map(([key, s]) => {
              const Icon =
                key === "Flood"
                  ? Waves
                  : key === "Earthquake"
                  ? Mountain
                  : Waves;
              return (
                <button
                  key={key}
                  className={`scenario-chip-btn ${scenario === key ? "selected" : ""}`}
                  onClick={() => selectScenario(key)}
                >
                  <Icon size={15} />
                  <span>{s.label.replace(" Scenario", "")}</span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-bottom-card">
            <ShieldAlert size={16} />
            <p>
              Autonomous municipal twin for Mumbai. Turn guidance avoids active flood corridors.
            </p>
          </div>
        </aside>

        {/* FULL-CANVAS MAIN CONTENT */}
        <main className="main-viewport-standard">
          {/* 1. GOOGLE MAPS ESCAPE NAVIGATOR */}
          {view === "Navigate" && (
            <GoogleEscapeView
              scenario={scenario}
              params={params}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              mapDimension={globalDimension}
              onToggleMapDimension={setGlobalDimension}
              userLocation={userLocation}
              onLocationChange={setUserLocation}
              familyMembers={familyMembers}
            />
          )}

          {/* 2. CITY OVERVIEW */}
          {view === "Overview" && (
            <div className="standard-map-card">
              <div className="standard-card-header">
                <div>
                  <h3>City Overview — {globalDimension} View</h3>
                  <small>Real OpenStreetMap basemap & 3D building extrusions</small>
                </div>
                <div className="card-header-actions">
                  <div className="segmented-dimension-control">
                    <button
                      className={`seg-btn ${globalDimension === "2D" ? "active" : ""}`}
                      onClick={() => setGlobalDimension("2D")}
                    >
                      2D
                    </button>
                    <button
                      className={`seg-btn ${globalDimension === "3D" ? "active" : ""}`}
                      onClick={() => setGlobalDimension("3D")}
                    >
                      3D
                    </button>
                  </div>
                </div>
              </div>
              <div className="standard-map-container">
                {globalDimension === "3D" ? (
                  <City3DMap showFacilities={true} familyMembers={familyMembers} />
                ) : (
                  <Map2D />
                )}
              </div>
            </div>
          )}

          {/* 3. DISASTER SIMULATOR */}
          {view === "Simulation" && (
            <div className="standard-map-card">
              <DisasterSim
                scenario={scenario}
                params={params}
                setParams={setParams}
                mapDimension={globalDimension}
                onToggleMapDimension={setGlobalDimension}
              />
            </div>
          )}

          {/* 4. EMERGENCY FACILITIES */}
          {view === "Response" && (
            <div className="standard-map-card">
              <EmergencyResponse
                scenario={scenario}
                params={params}
                mapDimension={globalDimension}
                onToggleMapDimension={setGlobalDimension}
              />
            </div>
          )}

          {/* 5. IMPACT ANALYSIS */}
          {view === "Impact" && (
            <div className="standard-map-card">
              <ImpactAnalysis
                scenario={scenario}
                params={params}
                mapDimension={globalDimension}
                onToggleMapDimension={setGlobalDimension}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. OPTION 1: SMART AI CITY COPILOT FLOATING WINDOW */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onOpen={() => setIsCopilotOpen(true)}
        onClose={() => setIsCopilotOpen(false)}
        scenario={scenario}
        params={params}
        telemetry={telemetry}
        activeRoute={activeRoute}
        voiceEnabled={voiceEnabled}
      />

      {/* 4. OPTION 8: FAMILY & COMMUNITY TRACKER DRAWER */}
      <FamilyTrackerDrawer
        isOpen={isFamilyOpen}
        onClose={() => setIsFamilyOpen(false)}
        userLocation={userLocation}
        currentHaven={SAFE_HAVENS[0]}
        activeRoute={activeRoute}
        onSelectFamilyMember={(member) => {
          setUserLocation(member.position);
          setView("Navigate");
        }}
      />
    </div>
  );
}

export default App;
