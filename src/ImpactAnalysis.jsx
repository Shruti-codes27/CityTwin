import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import { RotateCcw, BarChart3, Users, Building2, AlertTriangle } from "lucide-react";
import City3DMap from "./City3DMap";
import {
  MUMBAI,
  SCENARIOS,
  SEVERITY,
  ZONES,
  getActiveZones,
  getEarthquakeRadii,
  getAffectedArea,
  calculatePolygonArea,
  estimatePopulation,
  formatNumber,
  getAffectedFacilities,
} from "./data";

function MapController() {
  const map = useMap();
  const reset = () => map.setView(MUMBAI.center, MUMBAI.zoom);
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

export default function ImpactAnalysis({ scenario, params, mapDimension = "2D", onToggleMapDimension }) {
  const [localDimension, setLocalDimension] = useState(mapDimension);
  const activeDim = onToggleMapDimension ? mapDimension : localDimension;
  const setDim = onToggleMapDimension || setLocalDimension;

  if (scenario === "None") {
    return (
      <div className="empty-state">
        <AlertTriangle size={32} />
        <h3>No scenario selected</h3>
        <p>
          Select a disaster scenario from the sidebar to view its impact
          analysis.
        </p>
      </div>
    );
  }

  const cfg = SCENARIOS[scenario];
  const activeZones = getActiveZones(scenario, params);
  const totalArea = getAffectedArea(scenario, params);
  const totalPop = estimatePopulation(totalArea);
  const affectedFacilities = getAffectedFacilities(scenario, params);
  const totalAffected =
    affectedFacilities.severe.length +
    affectedFacilities.moderate.length +
    affectedFacilities.light.length;

  // Per-severity breakdown
  const breakdown = activeZones.map((level) => {
    let area = 0;
    if (scenario === "Earthquake") {
      const radii = getEarthquakeRadii(params?.magnitude ?? 6);
      const sorted = [...activeZones].sort(
        (a, b) => radii[b] - radii[a]
      );
      const idx = sorted.indexOf(level);
      const outerR = radii[level];
      const innerR = idx > 0 ? radii[sorted[idx - 1]] : 0;
      area = Math.PI * (outerR * outerR - innerR * innerR);
    } else if (ZONES[scenario]) {
      const sorted = [...activeZones].sort(
        (a, b) =>
          calculatePolygonArea(ZONES[scenario][b]) -
          calculatePolygonArea(ZONES[scenario][a])
      );
      const idx = sorted.indexOf(level);
      const outerArea = calculatePolygonArea(ZONES[scenario][level]);
      const innerArea =
        idx > 0
          ? calculatePolygonArea(ZONES[scenario][sorted[idx - 1]])
          : 0;
      area = outerArea - innerArea;
    }
    return {
      level,
      area,
      population: estimatePopulation(area),
      facilities: affectedFacilities[level]?.length || 0,
      color: SEVERITY[level].color,
      label: SEVERITY[level].label,
    };
  });

  const maxArea = Math.max(...breakdown.map((b) => b.area), 1);

  return (
    <>
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon orange">
            <BarChart3 size={20} />
          </span>
          <div>
            <p>Affected Area</p>
            <h3>{totalArea.toFixed(1)} km²</h3>
            <small>
              {((totalArea / MUMBAI.area) * 100).toFixed(1)}% of Mumbai
            </small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon blue">
            <Users size={20} />
          </span>
          <div>
            <p>Est. Population Affected</p>
            <h3>{formatNumber(totalPop)}</h3>
            <small>Based on avg density {formatNumber(MUMBAI.avgDensity)}/km²</small>
          </div>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">
            <Building2 size={20} />
          </span>
          <div>
            <p>Facilities in Zone</p>
            <h3>{totalAffected}</h3>
            <small>Hospitals & shelters affected</small>
          </div>
        </article>
      </section>

      <section className="map-section">
        <div className="map-heading">
          <div>
            <h3>Impact Zone Map — {cfg.label}</h3>
            <p>{cfg.description}</p>
          </div>

          {/* 2D / 3D Switch for Impact Analysis Field */}
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
              showFacilities={true}
            />
          ) : (
            <MapContainer
              key="citytwin-impact-analysis"
              center={MUMBAI.center}
              zoom={MUMBAI.zoom}
              scrollWheelZoom
              className="city-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController />

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
                      Area:{" "}
                      {(() => {
                        const b = breakdown.find((x) => x.level === level);
                        return b ? `${b.area.toFixed(1)} km²` : "N/A";
                      })()}
                    </Popup>
                  </Polygon>
                ))}

              {scenario === "Earthquake" &&
                activeZones.map((level) => {
                  const radii = getEarthquakeRadii(params?.magnitude ?? 6);
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
                    />
                  );
                })}

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
                  <Popup>Epicenter — Magnitude {params?.magnitude ?? 6}</Popup>
                </CircleMarker>
              )}
            </MapContainer>
          )}
        </div>
      </section>

      <section className="breakdown-section">
        <h3>Severity Breakdown</h3>
        <div className="breakdown-table">
          <div className="breakdown-header">
            <span>Severity</span>
            <span>Area (km²)</span>
            <span>Est. Population</span>
            <span>Facilities</span>
            <span>Bar</span>
          </div>
          {breakdown.map((b) => (
            <div className="breakdown-row" key={b.level}>
              <span className="bd-level">
                <i
                  className="legend-dot"
                  style={{ background: b.color }}
                />
                {b.label}
              </span>
              <span>{b.area.toFixed(1)}</span>
              <span>{formatNumber(b.population)}</span>
              <span>{b.facilities}</span>
              <span className="bd-bar">
                <div
                  className="bd-bar-fill"
                  style={{
                    width: `${(b.area / maxArea) * 100}%`,
                    background: b.color,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </section>

      <p className="map-disclaimer">
        <AlertTriangle size={15} />
        Impact estimates use simplified geographic assumptions and average
        population density. Not for real-world emergency use.
      </p>
    </>
  );
}
