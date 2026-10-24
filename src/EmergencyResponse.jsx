import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import {
  RotateCcw,
  Hospital,
  Building2,
  Users,
  Bed,
  Route,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Phone,
  LocateFixed,
  Navigation2,
} from "lucide-react";
import City3DMap from "./City3DMap";
import {
  MUMBAI,
  SCENARIOS,
  SEVERITY,
  ZONES,
  HOSPITALS,
  SHELTERS,
  EMERGENCY_NUMBERS,
  getActiveZones,
  getAffectedArea,
  estimatePopulation,
  formatNumber,
  haversineDistance,
  getAffectedFacilities,
  getEscapeRoute,
  isUserInZone,
} from "./data";
import { useGeolocation } from "./useGeolocation";

function MapController({ userLocation }) {
  const map = useMap();

  const reset = () => map.setView(MUMBAI.center, MUMBAI.zoom);

  // Pan to user location when it updates
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

// Simple polygon centroid
function polygonCentroid(coords) {
  let lat = 0,
    lng = 0;
  for (const [la, ln] of coords) {
    lat += la;
    lng += ln;
  }
  return [lat / coords.length, lng / coords.length];
}

export default function EmergencyResponse({ scenario, params, mapDimension = "2D", onToggleMapDimension }) {
  const [localDimension, setLocalDimension] = useState(mapDimension);
  const activeDim = onToggleMapDimension ? mapDimension : localDimension;
  const setDim = onToggleMapDimension || setLocalDimension;

  const hasScenario = scenario !== "None";
  const cfg = SCENARIOS[scenario];

  const { location, loading, error, requestLocation } = useGeolocation();

  // Escape route calculation
  let escapeRoute = null;
  let zoneCheck = null;
  if (location && hasScenario) {
    escapeRoute = getEscapeRoute(location, scenario, params);
    zoneCheck = isUserInZone(location, scenario, params);
  }

  // Calculate affected zone center for evacuation routes
  let zoneCenter = MUMBAI.center;
  let evacuationRoutes = [];

  if (hasScenario) {
    const activeZones = getActiveZones(scenario, params);

    if (scenario === "Earthquake") {
      zoneCenter = SCENARIOS.Earthquake.epicenter;
    } else if (ZONES[scenario] && activeZones.length > 0) {
      const primaryZone = ZONES[scenario][activeZones[0]];
      if (primaryZone) zoneCenter = polygonCentroid(primaryZone);
    }

    const nearestShelters = SHELTERS.map((s) => ({
      ...s,
      distance: haversineDistance(zoneCenter, s.position),
    }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    evacuationRoutes = nearestShelters.map((s) => ({
      shelter: s,
      path: [zoneCenter, s.position],
    }));
  }

  // Capacity analysis
  const totalBeds = HOSPITALS.reduce((sum, h) => sum + h.beds, 0);
  const totalShelterCapacity = SHELTERS.reduce(
    (sum, s) => sum + s.capacity,
    0
  );

  let displacedPop = 0;
  let affectedHospitals = [];
  let affectedShelters = [];

  if (hasScenario) {
    const area = getAffectedArea(scenario, params);
    const pop = estimatePopulation(area);
    displacedPop = Math.round(pop * 0.15);
    const affected = getAffectedFacilities(scenario, params);
    affectedHospitals = [
      ...affected.severe,
      ...affected.moderate,
      ...affected.light,
    ].filter((f) => HOSPITALS.some((h) => h.name === f.name));
    affectedShelters = [
      ...affected.severe,
      ...affected.moderate,
      ...affected.light,
    ].filter((f) => SHELTERS.some((s) => s.name === f.name));
  }

  const availableShelters = SHELTERS.filter(
    (s) => !affectedShelters.some((a) => a.name === s.name)
  );
  const availableCapacity = availableShelters.reduce(
    (sum, s) => sum + s.capacity,
    0
  );
  const capacityRatio =
    displacedPop > 0 ? (availableCapacity / displacedPop) * 100 : 0;
  const bedRatio = displacedPop > 0 ? (totalBeds / displacedPop) * 100 : 0;

  return (
    <>
      {/* Emergency quick call */}
      <section className="emergency-call-section">
        {EMERGENCY_NUMBERS.map((e) => (
          <a
            key={e.number}
            href={`tel:${e.number}`}
            className="emergency-call-btn"
          >
            <Phone size={16} />
            <span>
              <strong>{e.number}</strong>
              <small>{e.label}</small>
            </span>
          </a>
        ))}

        <button
          className="locate-btn"
          onClick={requestLocation}
          disabled={loading}
        >
          <LocateFixed size={18} />
          {loading ? "Locating..." : "Find My Location"}
        </button>
      </section>

      {/* Geolocation error */}
      {error && (
        <div className="geo-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Escape route alert */}
      {escapeRoute?.inZone && (
        <div className="escape-alert danger">
          <AlertTriangle size={24} />
          <div>
            <strong>
              You are inside the {SEVERITY[escapeRoute.level].label} zone!
            </strong>
            <p>
              Follow the dark green route on the map to reach{" "}
              {escapeRoute.shelter.name} safely.
            </p>
            <small>
              Exit zone: {escapeRoute.exitDistance.toFixed(1)} km · To shelter:{" "}
              {escapeRoute.shelterDistance.toFixed(1)} km · Total:{" "}
              {escapeRoute.totalDistance.toFixed(1)} km
            </small>
          </div>
        </div>
      )}

      {location && !escapeRoute?.inZone && hasScenario && (
        <div className="escape-alert safe">
          <ShieldCheck size={24} />
          <div>
            <strong>You are safe.</strong>
            <p>Your location is outside the disaster impact zone.</p>
          </div>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon green">
            <Hospital size={20} />
          </span>
          <div>
            <p>Hospitals Mapped</p>
            <h3>{HOSPITALS.length}</h3>
            <small>{formatNumber(totalBeds)} total beds</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon blue">
            <Building2 size={20} />
          </span>
          <div>
            <p>Emergency Shelters</p>
            <h3>{SHELTERS.length}</h3>
            <small>{formatNumber(totalShelterCapacity)} capacity</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">
            <Users size={20} />
          </span>
          <div>
            <p>Est. Displaced</p>
            <h3>{hasScenario ? formatNumber(displacedPop) : "—"}</h3>
            <small>
              {hasScenario ? "15% of affected pop." : "Select a scenario"}
            </small>
          </div>
        </article>
      </section>

      <section className="map-section">
        <div className="map-heading">
          <div>
            <h3>
              Emergency Response Map
              {hasScenario ? ` — ${cfg.label}` : ""}
            </h3>
            <p>
              {hasScenario
                ? "Hospitals, shelters, evacuation routes, and your escape path."
                : "View all mapped hospitals and emergency shelters across Mumbai."}
            </p>
          </div>

          {/* 2D / 3D Switch for Response Field */}
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

        <div className="map-wrapper">
          {activeDim === "3D" ? (
            <City3DMap
              scenario={scenario}
              params={params}
              userLocation={location}
              routeCoordinates={escapeRoute?.inZone ? escapeRoute.route : (evacuationRoutes[0] ? evacuationRoutes[0].path : null)}
              showFacilities={true}
            />
          ) : (
            <MapContainer
              key="citytwin-emergency-response"
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

            {/* Evacuation routes */}
            {evacuationRoutes.map((route, i) => (
              <Polyline
                key={i}
                positions={route.path}
                pathOptions={{
                  color: "#22d3ee",
                  weight: 3,
                  dashArray: "8 6",
                  opacity: 0.8,
                }}
              >
                <Popup>
                  <strong>Evacuation Route</strong>
                  <br />
                  To: {route.shelter.name}
                  <br />
                  Distance: {route.shelter.distance.toFixed(1)} km
                </Popup>
              </Polyline>
            ))}

            {/* Escape route - white casing (under) */}
            {escapeRoute?.inZone && (
              <Polyline
                positions={escapeRoute.route}
                pathOptions={{
                  color: "#ffffff",
                  weight: 8,
                  opacity: 0.7,
                }}
              />
            )}

            {/* Escape route - dark green (on top) */}
            {escapeRoute?.inZone && (
              <Polyline
                positions={escapeRoute.route}
                pathOptions={{
                  color: "#065f46",
                  weight: 5,
                  opacity: 0.95,
                }}
              >
                <Popup>
                  <strong>Safe Escape Route</strong>
                  <br />
                  Total distance: {escapeRoute.totalDistance.toFixed(1)} km
                  <br />
                  Destination: {escapeRoute.shelter.name}
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
                  Leave the affected area from here.
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
                      : "Your current location"}
                  </Popup>
                </CircleMarker>
              </CircleMarker>
            )}

            {/* Evacuation origin marker */}
            {hasScenario && (
              <CircleMarker
                center={zoneCenter}
                radius={10}
                pathOptions={{
                  color: "#ef4444",
                  fillColor: "#ef4444",
                  fillOpacity: 0.5,
                  weight: 3,
                }}
              >
                <Popup>
                  <strong>Evacuation Origin</strong>
                  <br />
                  {cfg.label}
                </Popup>
              </CircleMarker>
            )}

            {/* Hospital markers */}
            {HOSPITALS.map((h) => {
              const isAffected = affectedHospitals.some(
                (a) => a.name === h.name
              );
              return (
                <CircleMarker
                  key={h.name}
                  center={h.position}
                  radius={8}
                  pathOptions={{
                    color: isAffected ? "#ef4444" : "#fff",
                    fillColor: "#22c55e",
                    fillOpacity: 0.9,
                    weight: isAffected ? 4 : 2,
                  }}
                >
                  <Popup>
                    <strong>{h.name}</strong>
                    <br />
                    {h.type} · {h.beds} beds
                    <br />
                    {isAffected ? (
                      <span style={{ color: "#ef4444" }}>
                        ⚠ Within disaster zone
                      </span>
                    ) : (
                      <span style={{ color: "#22c55e" }}>✓ Operational</span>
                    )}
                    <br />
                    <a href={`tel:${h.phone}`} className="call-link">
                      <Phone size={13} /> Call {h.phone}
                    </a>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Shelter markers */}
            {SHELTERS.map((s) => {
              const isAffected = affectedShelters.some(
                (a) => a.name === s.name
              );
              const isEscapeTarget = escapeRoute?.shelter?.name === s.name;
              return (
                <CircleMarker
                  key={s.name}
                  center={s.position}
                  radius={isEscapeTarget ? 9 : 6}
                  pathOptions={{
                    color: isEscapeTarget ? "#fff" : isAffected ? "#ef4444" : "#fff",
                    fillColor: isEscapeTarget ? "#065f46" : "#a78bfa",
                    fillOpacity: 0.9,
                    weight: isEscapeTarget || isAffected ? 4 : 2,
                  }}
                >
                  <Popup>
                    <strong>{s.name}</strong>
                    <br />
                    {s.type} · Capacity: {s.capacity}
                    <br />
                    {isEscapeTarget ? (
                      <span style={{ color: "#065f46" }}>
                        ★ Your safe escape destination
                      </span>
                    ) : isAffected ? (
                      <span style={{ color: "#ef4444" }}>
                        ⚠ Within disaster zone
                      </span>
                    ) : (
                      <span style={{ color: "#22c55e" }}>✓ Available</span>
                    )}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          )}

          <div className="map-legend">
            <strong>RESPONSE LEGEND</strong>
            <span>
              <i className="legend-dot green-dot" />
              Hospital
            </span>
            <span>
              <i className="legend-dot purple-dot" />
              Emergency Shelter
            </span>
            {hasScenario && (
              <>
                <span>
                  <i
                    className="legend-dot"
                    style={{ background: "#ef4444" }}
                  />
                  Affected Facility
                </span>
                <span>
                  <i
                    className="legend-dot"
                    style={{ background: "#22d3ee" }}
                  />
                  Evacuation Route
                </span>
                <span>
                  <i
                    className="legend-dot"
                    style={{ background: "#065f46" }}
                  />
                  Safe Escape Route
                </span>
              </>
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
      </section>

      {/* Response plan comparison */}
      {hasScenario && (
        <section className="response-plan">
          <h3>
            <ShieldCheck size={18} />
            Response Plan Comparison
          </h3>

          <div className="plan-grid">
            <div className="plan-card">
              <div className="plan-card-header">
                <Bed size={20} />
                <span>Medical Capacity</span>
              </div>
              <div className="plan-metric">
                <span className="plan-value">{formatNumber(totalBeds)}</span>
                <span className="plan-unit">hospital beds</span>
              </div>
              <div className="plan-vs">
                vs {formatNumber(displacedPop)} displaced
              </div>
              <div className="plan-bar">
                <div
                  className="plan-bar-fill green"
                  style={{ width: `${Math.min(bedRatio, 100)}%` }}
                />
              </div>
              <small>{bedRatio.toFixed(0)}% coverage ratio</small>
            </div>

            <div className="plan-card">
              <div className="plan-card-header">
                <Building2 size={20} />
                <span>Shelter Capacity</span>
              </div>
              <div className="plan-metric">
                <span className="plan-value">
                  {formatNumber(availableCapacity)}
                </span>
                <span className="plan-unit">available spaces</span>
              </div>
              <div className="plan-vs">
                vs {formatNumber(displacedPop)} displaced
              </div>
              <div className="plan-bar">
                <div
                  className="plan-bar-fill blue"
                  style={{ width: `${Math.min(capacityRatio, 100)}%` }}
                />
              </div>
              <small>{capacityRatio.toFixed(0)}% coverage ratio</small>
            </div>

            <div className="plan-card">
              <div className="plan-card-header">
                <Route size={20} />
                <span>Evacuation Routes</span>
              </div>
              <div className="plan-metric">
                <span className="plan-value">{evacuationRoutes.length}</span>
                <span className="plan-unit">routes to shelters</span>
              </div>
              <div className="plan-vs">
                Avg:{" "}
                {evacuationRoutes.length > 0
                  ? (
                      evacuationRoutes.reduce(
                        (s, r) => s + r.shelter.distance,
                        0
                      ) / evacuationRoutes.length
                    ).toFixed(1)
                  : "—"}{" "}
                km
              </div>
              <div className="plan-bar">
                <div
                  className="plan-bar-fill cyan"
                  style={{ width: "100%" }}
                />
              </div>
              <small>Routes planned from zone center</small>
            </div>
          </div>

          <div className="plan-note">
            <AlertTriangle size={15} />
            <span>
              {capacityRatio >= 100
                ? "Available shelter capacity exceeds estimated displaced population."
                : `Shelter capacity covers ${capacityRatio.toFixed(0)}% of estimated displaced population. Additional shelters may be needed.`}
            </span>
          </div>
        </section>
      )}

      {/* Hospital list with call buttons */}
      <section className="facility-section">
        <h3>
          <Stethoscope size={18} />
          Hospital Network
        </h3>
        <div className="facility-list">
          {HOSPITALS.map((h) => {
            const isAffected = affectedHospitals.some(
              (a) => a.name === h.name
            );
            return (
              <div
                key={h.name}
                className={`facility-item ${isAffected ? "affected" : ""}`}
              >
                <span className="facility-icon hospital">
                  <Hospital size={16} />
                </span>
                <div className="facility-info">
                  <strong>{h.name}</strong>
                  <small>
                    {h.type} · {h.beds} beds
                  </small>
                </div>
                <a
                  href={`tel:${h.phone}`}
                  className="facility-call-btn"
                  title={`Call ${h.phone}`}
                >
                  <Phone size={14} />
                  Call
                </a>
                <span
                  className={`facility-status ${isAffected ? "warn" : "ok"}`}
                >
                  {isAffected ? "In Zone" : "OK"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="facility-section">
        <h3>
          <Building2 size={18} />
          Emergency Shelters
        </h3>
        <div className="facility-list">
          {SHELTERS.map((s) => {
            const isAffected = affectedShelters.some(
              (a) => a.name === s.name
            );
            const distFromZone = hasScenario
              ? haversineDistance(zoneCenter, s.position).toFixed(1)
              : null;
            return (
              <div
                key={s.name}
                className={`facility-item ${isAffected ? "affected" : ""}`}
              >
                <span className="facility-icon shelter">
                  <Building2 size={16} />
                </span>
                <div className="facility-info">
                  <strong>{s.name}</strong>
                  <small>
                    {s.type} · Capacity {s.capacity}
                    {distFromZone && ` · ${distFromZone} km from zone`}
                  </small>
                </div>
                <span
                  className={`facility-status ${isAffected ? "warn" : "ok"}`}
                >
                  {isAffected ? "In Zone" : "Available"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="map-disclaimer">
        <AlertTriangle size={15} />
        Hospital phone numbers and shelter data are approximate and must be
        verified before real-world use. Geolocation requires browser permission.
      </p>
    </>
  );
}
