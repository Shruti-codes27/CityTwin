import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { RotateCcw, MapPin, LocateFixed } from "lucide-react";
import { MUMBAI, LANDMARKS } from "./data";
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

const landmarkColors = {
  Monument: "#f472b6",
  Heritage: "#fbbf24",
  Waterfront: "#38bdf8",
  Infrastructure: "#a78bfa",
  Airport: "#fb923c",
  Lake: "#22d3ee",
};

export default function Map2D() {
  const { location, loading, requestLocation } = useGeolocation();

  return (
    <>
      <div className="locate-bar">
        <button
          className="locate-btn"
          onClick={requestLocation}
          disabled={loading}
        >
          <LocateFixed size={18} />
          {loading ? "Locating..." : "Find My Location"}
        </button>
      </div>

      <div className="map-wrapper">
        <MapContainer
          key="citytwin-2d-overview"
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

          {LANDMARKS.map((lm) => (
            <CircleMarker
              key={lm.name}
              center={lm.position}
              radius={7}
              pathOptions={{
                color: "#fff",
                fillColor: landmarkColors[lm.type] || "#94a3b8",
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{lm.name}</strong>
                <br />
                {lm.type}
              </Popup>
            </CircleMarker>
          ))}

          {location && (
            <CircleMarker
              center={location}
              radius={12}
              pathOptions={{
                color: "#fff",
                fillColor: "#3b82f6",
                fillOpacity: 0.5,
                weight: 3,
              }}
            >
              <CircleMarker
                center={location}
                radius={5}
                pathOptions={{
                  color: "#fff",
                  fillColor: "#3b82f6",
                  fillOpacity: 1,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>You are here</strong>
                </Popup>
              </CircleMarker>
            </CircleMarker>
          )}
        </MapContainer>

        <div className="map-legend">
          <strong>MAP LEGEND</strong>
          <span>
            <i className="legend-dot green-dot" />
            Mumbai City Center
          </span>
          <span>
            <i className="legend-dot" style={{ background: "#f472b6" }} />
            Key Landmarks
          </span>
          {location && (
            <span>
              <i className="legend-dot" style={{ background: "#3b82f6" }} />
              Your Location
            </span>
          )}
          <span style={{ marginTop: 6, color: "#8290aa" }}>
            Streets & coastline from OpenStreetMap
          </span>
        </div>
      </div>
    </>
  );
}
