import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  CircleMarker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import {
  RotateCcw,
  Waves,
  Mountain,
  Radio,
  AlertTriangle,
  ShieldCheck,
  LocateFixed,
  Box,
  MapPin,
} from "lucide-react";
import City3DMap from "./City3DMap";
import {
  MUMBAI,
  SCENARIOS,
  SEVERITY,
  ZONES,
  getActiveZones,
  getEarthquakeRadii,
  getAffectedArea,
  estimatePopulation,
  formatNumber,
  getAffectedFacilities,
  getEscapeRoute,
  isUserInZone,
} from "./data";
import { useGeolocation } from "./useGeolocation";

function MapController({ userLocation }) {
  const map = useMap();
  const reset = () => map.setView(MUMBAI.center, MUMBAI.zoom);

  if (userLocation && map._lastUserLocation !== userLocation) {
    map._lastUserLocation = userLocation;
    map.setView(userLocation, 14, { animate: true });
  }

  return (
    <div
      className="map-reset"
      onClick={reset}
      title="Reset map view"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") reset();
      }}
    >
      <RotateCcw size={17} />
    </div>
  );
}

export default function DisasterSim({ scenario, params, setParams, mapDimension = "2D", onToggleMapDimension }) {
  const [localDimension, setLocalDimension] = useState(mapDimension);
  const activeDim = onToggleMapDimension ? mapDimension : localDimension;
  const setDim = onToggleMapDimension || setLocalDimension;

  const cfg = SCENARIOS[scenario];
  const activeZones = getActiveZones(scenario, params);
  const affectedArea = getAffectedArea(scenario, params);
  const affectedPop = estimatePopulation(affectedArea);
  const affectedFacilities = getAffectedFacilities(scenario, params);
  const totalAffectedFacilities =
    affectedFacilities.severe.length +
    affectedFacilities.moderate.length +
    affectedFacilities.light.length;

  const { location, loading, error, requestLocation } = useGeolocation();

  let escapeRoute = null;
  if (location) {
    escapeRoute = getEscapeRoute(location, scenario, params);
  }

  const paramValue = params?.[cfg.paramName] ?? cfg.paramDefault;

  const handleParam = (val) => {
    setParams((prev) => ({ ...prev, [cfg.paramName]: val }));
  };

  return (
    <>
      <div className="sim-controls">
        <div className="sim-controls-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {scenario === "Flood" ? (
              <Waves size={18} />
            ) : scenario === "Earthquake" ? (
              <Mountain size={18} />
            ) : (
              <Radio size={18} />
            )}
            <span>{cfg.label}</span>
          </div>

          {/* 2D / 3D Switch for Simulation Field */}
          <div className="hud-dimension-toggle">
            <button
              className={`dim-btn ${activeDim === "2D" ? "active" : ""}`}
              onClick={() => setDim("2D")}
            >
              2D Map
            </button>
            <button
              className={`dim-btn ${activeDim === "3D" ? "active" : ""}`}
              onClick={() => setDim("3D")}
            >
              3D Map
            </button>
          </div>
        </div>
        <p className="sim-description">{cfg.description}</p>

        <div className="param-slider">
          <label>
            {cfg.paramLabel}:{" "}
            <strong>
              {paramValue}
              {cfg.paramUnit}
            </strong>
          </label>
          <input
            type="range"
            min={cfg.paramMin}
            max={cfg.paramMax}
            step={cfg.paramStep}
            value={paramValue}
            onChange={(e) => handleParam(parseFloat(e.target.value))}
          />
          <div className="param-range">
            <small>
              {cfg.paramMin}
              {cfg.paramUnit}
            </small>
            <small>
              {cfg.paramMax}
              {cfg.paramUnit}
            </small>
          </div>
        </div>

        <button
          className="locate-btn"
          onClick={requestLocation}
          disabled={loading}
        >
          <LocateFixed size={18} />
          {loading ? "Locating..." : "Find My Location"}
        </button>

        {error && (
          <div className="geo-error">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="sim-impact-summary">
          <div className="sim-impact-item">
            <span className="impact-value">{affectedArea.toFixed(1)}</span>
            <span className="impact-label">km² affected</span>
          </div>
          <div className="sim-impact-item">
            <span className="impact-value">{formatNumber(affectedPop)}</span>
            <span className="impact-label">est. people affected</span>
          </div>
          <div className="sim-impact-item">
            <span className="impact-value">{totalAffectedFacilities}</span>
            <span className="impact-label">facilities in zone</span>
          </div>
        </div>
      </div>

      {/* Escape route alert */}
      {escapeRoute?.inZone && (
        <div className="escape-alert danger">
          <AlertTriangle size={24} />
          <div>
            <strong>
              You are inside the {SEVERITY[escapeRoute.level].label} zone!
            </strong>
            <p>
              Follow the dark green route to reach {escapeRoute.shelter.name}{" "}
              safely. Distance: {escapeRoute.totalDistance.toFixed(1)} km.
            </p>
          </div>
        </div>
      )}

      {location && !escapeRoute?.inZone && (
        <div className="escape-alert safe">
          <ShieldCheck size={24} />
          <div>
            <strong>You are safe.</strong>
            <p>Your location is outside the disaster impact zone.</p>
          </div>
        </div>
      )}

      <div className="map-wrapper">
        {activeDim === "3D" ? (
          <City3DMap
            scenario={scenario}
            params={params}
            userLocation={location}
            routeCoordinates={escapeRoute?.inZone ? escapeRoute.route : null}
            showFacilities={true}
          />
        ) : (
          <MapContainer
          key="citytwin-disaster-sim"
          center={MUMBAI.center}
          zoom={MUMBAI.zoom}
          scrollWheelZoom
          className="city-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController userLocation={location} />

          {/* Flood & Tsunami zones */}
          {ZONES[scenario] &&
            activeZones.map((level) => (
              <Polygon
                key={level}
                positions={ZONES[scenario][level]}
                pathOptions={{
                  color: SEVERITY[level].color,
                  fillColor: SEVERITY[level].color,
                  fillOpacity: SEVERITY[level].fillOpacity,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>{SEVERITY[level].label}</strong>
                  <br />
                  {cfg.label} — Illustrative zone only.
                </Popup>
              </Polygon>
            ))}

          {/* Earthquake rings */}
          {scenario === "Earthquake" &&
            activeZones.map((level) => {
              const radii = getEarthquakeRadii(paramValue);
              return (
                <Circle
                  key={level}
                  center={SCENARIOS.Earthquake.epicenter}
                  radius={radii[level] * 1000}
                  pathOptions={{
                    color: SEVERITY[level].color,
                    fillColor: SEVERITY[level].color,
                    fillOpacity: SEVERITY[level].fillOpacity,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <strong>{SEVERITY[level].label}</strong>
                    <br />
                    Radius: {radii[level].toFixed(1)} km
                  </Popup>
                </Circle>
              );
            })}

          {/* Earthquake epicenter marker */}
          {scenario === "Earthquake" && (
            <CircleMarker
              center={SCENARIOS.Earthquake.epicenter}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#ef4444",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <strong>Earthquake Epicenter</strong>
                <br />
                Magnitude: {paramValue}
              </Popup>
            </CircleMarker>
          )}

          {/* Escape route - white casing */}
          {escapeRoute?.inZone && (
            <Polyline
              positions={escapeRoute.route}
              pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.7 }}
            />
          )}

          {/* Escape route - dark green */}
          {escapeRoute?.inZone && (
            <Polyline
              positions={escapeRoute.route}
              pathOptions={{ color: "#065f46", weight: 5, opacity: 0.95 }}
            >
              <Popup>
                <strong>Safe Escape Route</strong>
                <br />
                Total: {escapeRoute.totalDistance.toFixed(1)} km · To:{" "}
                {escapeRoute.shelter.name}
              </Popup>
            </Polyline>
          )}

          {/* Exit point marker */}
          {escapeRoute?.inZone && (
            <CircleMarker
              center={escapeRoute.exitPoint}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#f59e0b",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <strong>Exit Disaster Zone</strong>
                <br />
                {escapeRoute.exitDistance.toFixed(1)} km from your location
              </Popup>
            </CircleMarker>
          )}

          {/* Safe shelter marker */}
          {escapeRoute?.inZone && (
            <CircleMarker
              center={escapeRoute.shelter.position}
              radius={9}
              pathOptions={{
                color: "#fff",
                fillColor: "#065f46",
                fillOpacity: 1,
                weight: 4,
              }}
            >
              <Popup>
                <strong>Safe Shelter: {escapeRoute.shelter.name}</strong>
                <br />
                {escapeRoute.shelter.type} · Capacity:{" "}
                {escapeRoute.shelter.capacity}
                <br />
                {escapeRoute.shelterDistance.toFixed(1)} km from zone exit
              </Popup>
            </CircleMarker>
          )}

          {/* User location marker */}
          {location && (
            <CircleMarker
              center={location}
              radius={12}
              pathOptions={{
                color: "#fff",
                fillColor: escapeRoute?.inZone ? "#ef4444" : "#3b82f6",
                fillOpacity: 0.5,
                weight: 3,
              }}
            >
              <CircleMarker
                center={location}
                radius={5}
                pathOptions={{
                  color: "#fff",
                  fillColor: escapeRoute?.inZone ? "#ef4444" : "#3b82f6",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>You are here</strong>
                  <br />
                  {escapeRoute?.inZone
                    ? `Inside ${SEVERITY[escapeRoute.level].label} — follow escape route`
                    : "Outside disaster zone — safe"}
                </Popup>
              </CircleMarker>
            </CircleMarker>
          )}
        </MapContainer>
        )}

        <div className="map-legend">
          <strong>IMPACT LEGEND</strong>
          {activeZones.map((level) => (
            <span key={level}>
              <i
                className="legend-dot"
                style={{ background: SEVERITY[level].color }}
              />
              {SEVERITY[level].label}
            </span>
          ))}
          {scenario === "Earthquake" && (
            <span>
              <i className="legend-dot" style={{ background: "#ef4444" }} />
              Epicenter
            </span>
          )}
          {escapeRoute?.inZone && (
            <span>
              <i className="legend-dot" style={{ background: "#065f46" }} />
              Safe Escape Route
            </span>
          )}
          {location && (
            <span>
              <i
                className="legend-dot"
                style={{
                  background: escapeRoute?.inZone ? "#ef4444" : "#3b82f6",
                }}
              />
              Your Location
            </span>
          )}
        </div>
      </div>
    </>
  );
}
