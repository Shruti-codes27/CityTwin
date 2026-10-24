import { useEffect, useRef, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { ZONES, SCENARIOS, SEVERITY, getActiveZones, getEarthquakeRadii, HOSPITALS, SHELTERS } from "./data";

maplibregl.setWorkerUrl(workerUrl);

// Helper: Convert [lat, lng] array to GeoJSON polygon [lng, lat]
function coordsToGeoJsonPolygon(coords) {
  if (!coords || coords.length < 3) return null;
  const ring = coords.map(([lat, lng]) => [lng, lat]);
  // Close the ring if not already closed
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push(ring[0]);
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

// Helper: Generate GeoJSON circle polygon for earthquake rings
function createGeoJSONCircle(center, radiusKm, points = 48) {
  const [lat, lng] = center;
  const ring = [];
  const dX = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  const dY = radiusKm / 110.574;
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    ring.push([lng + dX * Math.cos(theta), lat + dY * Math.sin(theta)]);
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

export default function City3DMap({
  center = [72.835, 19.045], // [lng, lat] for MapLibre
  zoom = 13.5,
  pitch = 60,
  bearing = -15,
  scenario = "None",
  params = {},
  userLocation = null,
  routeCoordinates = null, // array of [lat, lng]
  avatarPosition = null, // current moving avatar [lat, lng]
  avatarHeading = 0,
  showFacilities = true,
  dronePosition = null,
  followAvatar = false,
  familyMembers = [],
  className = "city3d-map-viewport",
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const isLoadedRef = useRef(false);

  // Markers refs
  const userMarkerRef = useRef(null);
  const avatarMarkerRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const facilityMarkersRef = useRef([]);
  const familyMarkersRef = useRef([]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: center,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      maxPitch: 85,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("load", () => {
      isLoadedRef.current = true;

      // 1. Add 3D Extruded Buildings
      const style = map.getStyle();
      const buildingLayer = style.layers?.find(
        (l) => l["source-layer"] === "building" && l.type === "fill"
      );

      if (buildingLayer && !map.getLayer("citytwin-3d-buildings")) {
        map.addLayer(
          {
            id: "citytwin-3d-buildings",
            source: buildingLayer.source,
            "source-layer": buildingLayer["source-layer"],
            type: "fill-extrusion",
            minzoom: 12,
            filter: ["!=", ["get", "hide_3d"], true],
            paint: {
              "fill-extrusion-color": [
                "interpolate",
                ["linear"],
                ["coalesce", ["get", "render_height"], ["get", "height"], 12],
                0, "#829eb8",
                30, "#9ab3cf",
                70, "#b8cfe8",
                120, "#d8e6f8",
              ],
              "fill-extrusion-height": [
                "coalesce",
                ["get", "render_height"],
                ["get", "height"],
                12,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                ["get", "min_height"],
                0,
              ],
              "fill-extrusion-opacity": 0.88,
            },
          },
          buildingLayer.id
        );
      }

      // 2. Add Hazard GeoJSON Sources & Layers
      initHazardLayers(map);

      // 3. Add Escape Route Source & Layer
      initRouteLayers(map);

      // Initial data update
      updateHazardData(map, scenario, params);
      updateRouteData(map, routeCoordinates);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isLoadedRef.current = false;
      }
    };
  }, []);

  // Initialize Hazard Sources and Layers
  const initHazardLayers = (map) => {
    if (!map.getSource("hazard-zones-source")) {
      map.addSource("hazard-zones-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Fill layer
      map.addLayer({
        id: "hazard-zones-fill",
        type: "fill",
        source: "hazard-zones-source",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      });

      // Glowing stroke line layer
      map.addLayer({
        id: "hazard-zones-stroke",
        type: "line",
        source: "hazard-zones-source",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.5,
          "line-dasharray": [3, 1],
          "line-opacity": 0.9,
        },
      });
    }
  };

  // Initialize Escape Route Line Layers
  const initRouteLayers = (map) => {
    if (!map.getSource("escape-route-source")) {
      map.addSource("escape-route-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Outer glow casing
      map.addLayer({
        id: "escape-route-casing",
        type: "line",
        source: "escape-route-source",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 10,
          "line-opacity": 0.45,
          "line-blur": 3,
        },
      });

      // Inner high-visibility Google Maps blue/green line
      map.addLayer({
        id: "escape-route-line",
        type: "line",
        source: "escape-route-source",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#38bdf8",
          "line-width": 5.5,
          "line-opacity": 0.95,
        },
      });
    }
  };

  // Update Hazard GeoJSON when scenario or params change
  const updateHazardData = useCallback((map, curScenario, curParams) => {
    if (!map || !isLoadedRef.current) return;
    const source = map.getSource("hazard-zones-source");
    if (!source) return;

    if (!curScenario || curScenario === "None") {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const activeLevels = getActiveZones(curScenario, curParams);
    const features = [];

    if (curScenario === "Earthquake") {
      const radii = getEarthquakeRadii(curParams?.magnitude ?? 6);
      const epicenter = SCENARIOS.Earthquake.epicenter; // [lat, lng]
      const order = ["light", "moderate", "severe"]; // outer to inner
      order.forEach((lvl) => {
        if (radii[lvl]) {
          const circle = createGeoJSONCircle(epicenter, radii[lvl]);
          circle.properties = {
            color: SEVERITY[lvl].color,
            opacity: SEVERITY[lvl].fillOpacity * 1.5,
            level: lvl,
          };
          features.push(circle);
        }
      });
    } else if (ZONES[curScenario]) {
      const order = ["light", "moderate", "severe"];
      order.forEach((lvl) => {
        if (activeLevels.includes(lvl) && ZONES[curScenario][lvl]) {
          const poly = coordsToGeoJsonPolygon(ZONES[curScenario][lvl]);
          if (poly) {
            poly.properties = {
              color: SEVERITY[lvl].color,
              opacity: SEVERITY[lvl].fillOpacity * 1.6,
              level: lvl,
            };
            features.push(poly);
          }
        }
      });
    }

    source.setData({ type: "FeatureCollection", features });
  }, []);

  // Update Route GeoJSON
  const updateRouteData = useCallback((map, coords) => {
    if (!map || !isLoadedRef.current) return;
    const source = map.getSource("escape-route-source");
    if (!source) return;

    if (!coords || coords.length < 2) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    // Convert [lat, lng] to GeoJSON [lng, lat]
    const lngLatLine = coords.map(([lat, lng]) => [lng, lat]);
    source.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: lngLatLine,
          },
        },
      ],
    });
  }, []);

  // Sync hazard changes
  useEffect(() => {
    if (mapRef.current) {
      updateHazardData(mapRef.current, scenario, params);
    }
  }, [scenario, params, updateHazardData]);

  // Sync route changes
  useEffect(() => {
    if (mapRef.current) {
      updateRouteData(mapRef.current, routeCoordinates);
    }
  }, [routeCoordinates, updateRouteData]);

  // Render User Marker
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    const map = mapRef.current;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    const [uLat, uLng] = userLocation;
    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "maplibre-user-marker";
      el.innerHTML = `
        <div class="user-pulse-ring"></div>
        <div class="user-dot-center"></div>
      `;
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([uLng, uLat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([uLng, uLat]);
    }
  }, [userLocation]);

  // Render Moving Navigation Avatar (Car / Citizen Icon)
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    const map = mapRef.current;

    if (!avatarPosition) {
      if (avatarMarkerRef.current) {
        avatarMarkerRef.current.remove();
        avatarMarkerRef.current = null;
      }
      return;
    }

    const [aLat, aLng] = avatarPosition;

    if (!avatarMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "maplibre-nav-avatar";
      el.innerHTML = `
        <div class="nav-avatar-icon" style="transform: rotate(${avatarHeading}deg)">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="white" stroke-width="2.5" fill="#3b82f6">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
        <div class="nav-avatar-halo"></div>
      `;
      avatarMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([aLng, aLat])
        .addTo(map);
    } else {
      avatarMarkerRef.current.setLngLat([aLng, aLat]);
      const iconEl = avatarMarkerRef.current.getElement().querySelector(".nav-avatar-icon");
      if (iconEl) {
        iconEl.style.transform = `rotate(${avatarHeading}deg)`;
      }
    }

    // Follow camera if enabled
    if (followAvatar) {
      map.easeTo({
        center: [aLng, aLat],
        duration: 300,
        pitch: 65,
        zoom: Math.max(15, map.getZoom()),
      });
    }
  }, [avatarPosition, avatarHeading, followAvatar]);

  // Render Autonomous Drone Marker
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current) return;
    const map = mapRef.current;

    if (!dronePosition) {
      if (droneMarkerRef.current) {
        droneMarkerRef.current.remove();
        droneMarkerRef.current = null;
      }
      return;
    }

    const [dLat, dLng] = dronePosition;
    if (!droneMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "maplibre-drone-marker";
      el.innerHTML = `
        <div class="drone-blade-spin">
          <span class="drone-dot"></span>
        </div>
        <div class="drone-label">DRONE-01</div>
      `;
      droneMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([dLng, dLat])
        .addTo(map);
    } else {
      droneMarkerRef.current.setLngLat([dLng, dLat]);
    }
  }, [dronePosition]);

  // Render Facilities (Shelters & Hospitals)
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current || !showFacilities) return;
    const map = mapRef.current;

    // Clear previous
    facilityMarkersRef.current.forEach((m) => m.remove());
    facilityMarkersRef.current = [];

    // Add Shelters
    SHELTERS.forEach((shelter) => {
      const el = document.createElement("div");
      el.className = "maplibre-shelter-marker";
      el.innerHTML = `
        <div class="facility-badge shelter-badge" title="${shelter.name}">
          🛡️
        </div>
      `;
      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
          <strong style="color: #059669;">🛡️ ${shelter.name}</strong><br/>
          <span>Type: ${shelter.type}</span><br/>
          <span>Capacity: <strong>${shelter.capacity} citizens</strong></span>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([shelter.position[1], shelter.position[0]])
        .setPopup(popup)
        .addTo(map);

      facilityMarkersRef.current.push(marker);
    });

    // Add top hospitals
    HOSPITALS.slice(0, 6).forEach((hosp) => {
      const el = document.createElement("div");
      el.className = "maplibre-hospital-marker";
      el.innerHTML = `
        <div class="facility-badge hospital-badge" title="${hosp.name}">
          🏥
        </div>
      `;
      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
          <strong style="color: #2563eb;">🏥 ${hosp.name}</strong><br/>
          <span>Beds: <strong>${hosp.beds}</strong> (${hosp.type})</span><br/>
          <span>Contact: ${hosp.phone}</span>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hosp.position[1], hosp.position[0]])
        .setPopup(popup)
        .addTo(map);

      facilityMarkersRef.current.push(marker);
    });

    return () => {
      facilityMarkersRef.current.forEach((m) => m.remove());
      facilityMarkersRef.current = [];
    };
  }, [showFacilities]);

  // Render Family Markers in 3D
  useEffect(() => {
    if (!mapRef.current || !isLoadedRef.current || !familyMembers) return;
    const map = mapRef.current;

    familyMarkersRef.current.forEach((m) => m.remove());
    familyMarkersRef.current = [];

    familyMembers.forEach((fam) => {
      const el = document.createElement("div");
      el.className = "maplibre-family-marker";
      el.innerHTML = `
        <div class="family-3d-pin" style="background: ${fam.avatarColor}">
          <span>${fam.avatarIcon}</span>
        </div>
        <div class="family-3d-label">${fam.name.split(" ")[0]}</div>
      `;

      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="color: #0f172a; font-family: sans-serif; font-size: 13px;">
          <strong style="color: ${fam.avatarColor};">${fam.avatarIcon} ${fam.name}</strong><br/>
          <span>Status: <strong>${fam.statusLabel}</strong></span><br/>
          <span>Location: ${fam.locationName}</span><br/>
          <span>Battery: ${fam.battery} · Ping: ${fam.lastPing}</span>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([fam.position[1], fam.position[0]])
        .setPopup(popup)
        .addTo(map);

      familyMarkersRef.current.push(marker);
    });

    return () => {
      familyMarkersRef.current.forEach((m) => m.remove());
      familyMarkersRef.current = [];
    };
  }, [familyMembers]);

  return (
    <div className={`city3d-wrapper ${className}`}>
      <div ref={mapContainer} className="city3d-map-canvas" />

      {/* Floating 3D camera quick toggle buttons */}
      <div className="map-3d-floating-hud">
        <button
          className="hud-tilt-btn"
          onClick={() => {
            if (!mapRef.current) return;
            const curPitch = mapRef.current.getPitch();
            mapRef.current.easeTo({ pitch: curPitch > 30 ? 0 : 62, duration: 600 });
          }}
          title="Toggle 3D Camera Tilt (Top-down vs Isometric)"
        >
          📐 3D Tilt
        </button>
        <button
          className="hud-tilt-btn"
          onClick={() => {
            if (!mapRef.current) return;
            mapRef.current.easeTo({ center: [72.835, 19.045], zoom: 13.5, pitch: 60, bearing: -15, duration: 800 });
          }}
          title="Reset Camera to City Center"
        >
          🔄 Reset 3D
        </button>
      </div>
    </div>
  );
}
