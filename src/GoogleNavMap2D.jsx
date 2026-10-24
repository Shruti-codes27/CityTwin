import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Polygon,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { RotateCcw, ShieldCheck, Hospital, AlertTriangle, Navigation } from "lucide-react";
import { MUMBAI, ZONES, SEVERITY, getActiveZones, getEarthquakeRadii, HOSPITALS, SHELTERS } from "./data";

// Map click listener to pick new starting position
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Controller to auto-fit route bounds or follow the moving avatar
function RouteCameraController({ routeCoordinates, avatarPosition, followAvatar }) {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length >= 2 && !hasFittedRef.current) {
      const bounds = routeCoordinates.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [60, 60], animate: true });
      hasFittedRef.current = true;
    }
  }, [routeCoordinates, map]);

  useEffect(() => {
    if (followAvatar && avatarPosition) {
      map.panTo(avatarPosition, { animate: true, duration: 0.3 });
    }
  }, [avatarPosition, followAvatar, map]);

  return null;
}

export default function GoogleNavMap2D({
  userLocation,
  routeCoordinates,
  avatarPosition,
  avatarHeading = 0,
  destinationHaven,
  scenario = "None",
  params = {},
  followAvatar = false,
  dronePosition = null,
  onLocationSelect = null,
  showFacilities = true,
  familyMembers = [],
  className = "google-nav-map-container",
}) {
  const activeZones = getActiveZones(scenario, params);

  return (
    <div className={`nav-2d-wrapper ${className}`}>
      <MapContainer
        center={userLocation || MUMBAI.center}
        zoom={13}
        scrollWheelZoom
        className="google-nav-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RouteCameraController
          routeCoordinates={routeCoordinates}
          avatarPosition={avatarPosition}
          followAvatar={followAvatar}
        />

        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* 1. Hazard Zones Overlays */}
        {scenario === "Earthquake" && (
          <>
            {(() => {
              const radii = getEarthquakeRadii(params?.magnitude ?? 6);
              const epicenter = [19.06, 72.85];
              return (
                <>
                  <Circle
                    center={epicenter}
                    radius={radii.light * 1000}
                    pathOptions={{ color: SEVERITY.light.color, fillColor: SEVERITY.light.color, fillOpacity: 0.15, weight: 1.5 }}
                  />
                  <Circle
                    center={epicenter}
                    radius={radii.moderate * 1000}
                    pathOptions={{ color: SEVERITY.moderate.color, fillColor: SEVERITY.moderate.color, fillOpacity: 0.25, weight: 2 }}
                  />
                  <Circle
                    center={epicenter}
                    radius={radii.severe * 1000}
                    pathOptions={{ color: SEVERITY.severe.color, fillColor: SEVERITY.severe.color, fillOpacity: 0.38, weight: 2.5 }}
                  />
                </>
              );
            })()}
          </>
        )}

        {scenario !== "None" && scenario !== "Earthquake" && ZONES[scenario] && (
          <>
            {activeZones.map((level) => {
              const poly = ZONES[scenario][level];
              if (!poly) return null;
              return (
                <Polygon
                  key={level}
                  positions={poly}
                  pathOptions={{
                    color: SEVERITY[level].color,
                    fillColor: SEVERITY[level].color,
                    fillOpacity: SEVERITY[level].fillOpacity * 1.5,
                    weight: 2,
                    dashArray: level === "light" ? "4, 4" : undefined,
                  }}
                >
                  <Popup>
                    <strong>{scenario} {level.toUpperCase()} HAZARD ZONE</strong>
                    <br />
                    Evacuation advised. Follow emergency escape route.
                  </Popup>
                </Polygon>
              );
            })}
          </>
        )}

        {/* 2. Google Maps Navigation Polyline */}
        {routeCoordinates && routeCoordinates.length >= 2 && (
          <>
            {/* Outer high-contrast casing (dark blue / glow) */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#1e3a8a",
                weight: 9,
                opacity: 0.7,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Inner vibrant route line */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: "#3b82f6",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {/* 3. Starting Citizen Location Marker */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={9}
            pathOptions={{ color: "#ffffff", fillColor: "#2563eb", fillOpacity: 1, weight: 3 }}
          >
            <CircleMarker
              center={userLocation}
              radius={18}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.25, weight: 1 }}
            />
            <Popup>
              <strong>Your Starting Location</strong>
              <br />
              Tap anywhere on the map to test another location.
            </Popup>
          </CircleMarker>
        )}

        {/* 4. Moving Navigation Avatar (Simulated Vehicle / User Puck) */}
        {avatarPosition && (
          <CircleMarker
            center={avatarPosition}
            radius={10}
            pathOptions={{ color: "#ffffff", fillColor: "#10b981", fillOpacity: 1, weight: 3 }}
          >
            <CircleMarker
              center={avatarPosition}
              radius={24}
              pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.25, weight: 1.5 }}
            />
            <Popup>
              <div style={{ textAlign: "center" }}>
                <strong style={{ color: "#10b981" }}>🚘 Live Navigation In Progress</strong>
                <br />
                Speed: 28 km/h · En Route to Shelter
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* 5. Safe Shelter Destination Pin */}
        {destinationHaven && (
          <CircleMarker
            center={destinationHaven.position}
            radius={14}
            pathOptions={{ color: "#ffffff", fillColor: "#059669", fillOpacity: 1, weight: 3 }}
          >
            <Popup>
              <strong style={{ color: "#059669" }}>🛡️ {destinationHaven.name}</strong>
              <br />
              Status: <strong>{destinationHaven.status || "OPEN"}</strong>
              <br />
              Capacity: {destinationHaven.capacity} citizens
              <br />
              Elevation: {destinationHaven.elevation || "Safe High Ground"}
            </Popup>
          </CircleMarker>
        )}

        {/* 6. Autonomous Emergency Drone */}
        {dronePosition && (
          <CircleMarker
            center={dronePosition}
            radius={8}
            pathOptions={{ color: "#facc15", fillColor: "#ca8a04", fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <strong style={{ color: "#ca8a04" }}>🚁 Autonomous Rescue Drone 01</strong>
              <br />
              Aerial escort & reconnaissance unit active.
            </Popup>
          </CircleMarker>
        )}

        {/* 6b. Family Tracking Markers */}
        {familyMembers && familyMembers.map((fam) => (
          <CircleMarker
            key={fam.id}
            center={fam.position}
            radius={9}
            pathOptions={{ color: "#ffffff", fillColor: fam.avatarColor, fillOpacity: 1, weight: 2.5 }}
          >
            <Popup>
              <strong>{fam.avatarIcon} {fam.name}</strong><br />
              Status: <span style={{ color: fam.status === "SAFE" ? "#10b981" : "#3b82f6", fontWeight: "bold" }}>{fam.statusLabel}</span><br />
              Location: {fam.locationName}<br />
              Battery: {fam.battery} · Ping: {fam.lastPing}
            </Popup>
          </CircleMarker>
        ))}

        {/* 7. Nearby Safe Shelters & Hospitals */}
        {showFacilities && (
          <>
            {SHELTERS.slice(0, 5).map((s) => (
              <CircleMarker
                key={s.name}
                center={s.position}
                radius={6}
                pathOptions={{ color: "#ffffff", fillColor: "#10b981", fillOpacity: 0.8, weight: 1.5 }}
              >
                <Popup>
                  <strong>🛡️ {s.name}</strong> ({s.type})<br />
                  Capacity: {s.capacity} people
                </Popup>
              </CircleMarker>
            ))}

            {HOSPITALS.slice(0, 4).map((h) => (
              <CircleMarker
                key={h.name}
                center={h.position}
                radius={6}
                pathOptions={{ color: "#ffffff", fillColor: "#ef4444", fillOpacity: 0.8, weight: 1.5 }}
              >
                <Popup>
                  <strong>🏥 {h.name}</strong><br />
                  Beds: {h.beds} · Ph: {h.phone}
                </Popup>
              </CircleMarker>
            ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
