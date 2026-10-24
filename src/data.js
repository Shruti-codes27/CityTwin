// Mumbai geographic constants
export const MUMBAI = {
  center: [19.045, 72.835],
  zoom: 12,
  area: 603, // km²
  population: 20_700_000, // 2024 estimate
  avgDensity: 34_300, // people per km²
};

// Disaster scenario definitions
export const SCENARIOS = {
  Flood: {
    color: "#38bdf8",
    label: "Flood Scenario",
    description:
      "Hypothetical flooding along the Mithi River basin and low-lying coastal areas.",
    paramName: "waterLevel",
    paramLabel: "Water Level",
    paramUnit: "m",
    paramMin: 0.5,
    paramMax: 5,
    paramStep: 0.5,
    paramDefault: 2,
    icon: "Waves",
  },
  Earthquake: {
    color: "#fb923c",
    label: "Earthquake Scenario",
    description: "Hypothetical seismic event with an epicenter near Mumbai.",
    paramName: "magnitude",
    paramLabel: "Magnitude",
    paramUnit: "",
    paramMin: 4,
    paramMax: 8,
    paramStep: 0.5,
    paramDefault: 6,
    epicenter: [19.06, 72.85],
    icon: "Mountain",
  },
  Tsunami: {
    color: "#a78bfa",
    label: "Tsunami Scenario",
    description:
      "Hypothetical tsunami inundation advancing inland from Mumbai's western coastline.",
    paramName: "waveHeight",
    paramLabel: "Wave Height",
    paramUnit: "m",
    paramMin: 2,
    paramMax: 20,
    paramStep: 1,
    paramDefault: 10,
    icon: "Waves",
  },
};

// Severity level metadata
export const SEVERITY = {
  severe: { label: "Severe Impact", color: "#ef4444", fillOpacity: 0.35 },
  moderate: { label: "Moderate Impact", color: "#f59e0b", fillOpacity: 0.25 },
  light: { label: "Light Impact", color: "#facc15", fillOpacity: 0.15 },
};

// Flood zones — following the Mithi River basin and low-lying coastal areas
const FLOOD_ZONES = {
  severe: [
    [19.030, 72.824],
    [19.042, 72.836],
    [19.052, 72.850],
    [19.062, 72.862],
    [19.072, 72.872],
    [19.085, 72.868],
    [19.088, 72.852],
    [19.078, 72.840],
    [19.062, 72.828],
    [19.045, 72.820],
  ],
  moderate: [
    [19.018, 72.815],
    [19.034, 72.834],
    [19.048, 72.854],
    [19.062, 72.876],
    [19.082, 72.884],
    [19.096, 72.876],
    [19.100, 72.854],
    [19.090, 72.832],
    [19.068, 72.822],
    [19.040, 72.810],
  ],
  light: [
    [19.005, 72.805],
    [19.024, 72.828],
    [19.044, 72.860],
    [19.068, 72.886],
    [19.092, 72.892],
    [19.110, 72.880],
    [19.116, 72.848],
    [19.100, 72.822],
    [19.068, 72.805],
    [19.032, 72.795],
  ],
};

// Tsunami zones — coastal strip along Mumbai's western coastline
const TSUNAMI_ZONES = {
  severe: [
    [18.910, 72.808],
    [18.930, 72.808],
    [18.950, 72.808],
    [18.970, 72.810],
    [18.990, 72.812],
    [19.012, 72.816],
    [19.038, 72.818],
    [19.060, 72.820],
    [19.085, 72.822],
    [19.105, 72.800],
    [19.135, 72.778],
    [19.175, 72.755],
    [19.215, 72.742],
    [19.215, 72.758],
    [19.175, 72.770],
    [19.135, 72.790],
    [19.105, 72.808],
    [19.085, 72.830],
    [19.060, 72.828],
    [19.038, 72.824],
    [19.012, 72.820],
    [18.990, 72.818],
    [18.970, 72.816],
    [18.950, 72.814],
    [18.930, 72.814],
    [18.910, 72.814],
  ],
  moderate: [
    [18.908, 72.802],
    [18.930, 72.802],
    [18.950, 72.802],
    [18.970, 72.804],
    [18.990, 72.806],
    [19.014, 72.810],
    [19.038, 72.812],
    [19.062, 72.814],
    [19.088, 72.818],
    [19.108, 72.790],
    [19.140, 72.765],
    [19.180, 72.742],
    [19.222, 72.728],
    [19.222, 72.750],
    [19.180, 72.762],
    [19.140, 72.785],
    [19.108, 72.808],
    [19.088, 72.834],
    [19.062, 72.832],
    [19.038, 72.828],
    [19.014, 72.824],
    [18.990, 72.822],
    [18.970, 72.820],
    [18.950, 72.818],
    [18.930, 72.818],
    [18.908, 72.820],
  ],
  light: [
    [18.906, 72.795],
    [18.930, 72.795],
    [18.950, 72.795],
    [18.970, 72.798],
    [18.990, 72.800],
    [19.016, 72.804],
    [19.038, 72.806],
    [19.064, 72.810],
    [19.090, 72.814],
    [19.110, 72.782],
    [19.145, 72.752],
    [19.185, 72.728],
    [19.228, 72.715],
    [19.228, 72.742],
    [19.185, 72.755],
    [19.145, 72.780],
    [19.110, 72.800],
    [19.090, 72.838],
    [19.064, 72.836],
    [19.038, 72.832],
    [19.016, 72.828],
    [18.990, 72.826],
    [18.970, 72.824],
    [18.950, 72.822],
    [18.930, 72.822],
    [18.906, 72.826],
  ],
};

export const ZONES = {
  Flood: FLOOD_ZONES,
  Tsunami: TSUNAMI_ZONES,
};

// Verified Mumbai hospitals with approximate coordinates, bed counts,
// and public contact numbers. Phone numbers should be verified before
// real-world use.
export const HOSPITALS = [
  { name: "KEM Hospital", position: [19.003, 72.857], beds: 1800, type: "Government", phone: "+912224107000" },
  { name: "JJ Hospital", position: [18.965, 72.842], beds: 1300, type: "Government", phone: "+912223735555" },
  { name: "Nair Hospital", position: [18.970, 72.827], beds: 1000, type: "Government", phone: "+912223081490" },
  { name: "Tata Memorial Hospital", position: [19.005, 72.853], beds: 700, type: "Specialty", phone: "+912224177000" },
  { name: "Sion Hospital (LTMG)", position: [19.041, 72.860], beds: 1400, type: "Government", phone: "+912224096001" },
  { name: "Bombay Hospital", position: [18.939, 72.826], beds: 830, type: "Private", phone: "+91222069999" },
  { name: "Hinduja Hospital", position: [19.040, 72.831], beds: 400, type: "Private", phone: "+912224452222" },
  { name: "Lilavati Hospital", position: [19.049, 72.822], beds: 320, type: "Private", phone: "+912267510000" },
  { name: "Cooper Hospital", position: [19.083, 72.847], beds: 500, type: "Government", phone: "+91226246800" },
  { name: "Bhagwati Hospital", position: [19.115, 72.856], beds: 500, type: "Government", phone: "+912228671122" },
  { name: "HN Reliance Foundation", position: [18.970, 72.816], beds: 350, type: "Private", phone: "+912230645757" },
  { name: "Breach Candy Hospital", position: [18.967, 72.813], beds: 200, type: "Private", phone: "+912224673888" },
  { name: "SevenHills Hospital", position: [19.108, 72.871], beds: 300, type: "Private", phone: "+912267670000" },
  { name: "Fortis Mulund", position: [19.170, 72.872], beds: 250, type: "Private", phone: "+912267544444" },
];

// National emergency numbers (India)
export const EMERGENCY_NUMBERS = [
  { label: "Ambulance (108)", number: "108" },
  { label: "All Emergency (112)", number: "112" },
  { label: "Disaster Management (1070)", number: "1070" },
];

// Shelters — schools and community halls that could serve as emergency shelters
export const SHELTERS = [
  { name: "St. Xavier's School", position: [18.940, 72.834], capacity: 500, type: "School" },
  { name: "Cooperage Ground", position: [18.930, 72.818], capacity: 1000, type: "Open Ground" },
  { name: "Don Bosco School", position: [19.027, 72.852], capacity: 500, type: "School" },
  { name: "Narsee Monjee School", position: [19.087, 72.847], capacity: 400, type: "School" },
  { name: "Mithibai College", position: [19.083, 72.840], capacity: 600, type: "College" },
  { name: "Gokhale Education", position: [19.117, 72.857], capacity: 400, type: "School" },
  { name: "Shivaji Park Ground", position: [19.030, 72.842], capacity: 2000, type: "Open Ground" },
  { name: "NSCI Dome Worli", position: [18.990, 72.818], capacity: 800, type: "Community Hall" },
  { name: "Bombay Gymkhana", position: [18.935, 72.825], capacity: 300, type: "Community Hall" },
  { name: "Somaiya Ground", position: [19.072, 72.895], capacity: 1200, type: "Open Ground" },
];

// Mumbai landmarks for the 2D map
export const LANDMARKS = [
  { name: "Gateway of India", position: [18.922, 72.835], type: "Monument" },
  { name: "CST Station", position: [18.940, 72.836], type: "Heritage" },
  { name: "Marine Drive", position: [18.944, 72.820], type: "Waterfront" },
  { name: "Bandra-Worli Sea Link", position: [19.050, 72.818], type: "Infrastructure" },
  { name: "CSM Airport", position: [19.089, 72.866], type: "Airport" },
  { name: "Powai Lake", position: [19.099, 72.873], type: "Lake" },
  { name: "Worli Sea Face", position: [18.990, 72.817], type: "Waterfront" },
];

// ---- Utility functions ----

// Spherical polygon area (km²) for [lat, lng] coordinate arrays
export function calculatePolygonArea(coords) {
  const R = 6371; // Earth radius in km
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % n];
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const dLambda = ((lng2 - lng1) * Math.PI) / 180;
    area += dLambda * (2 + Math.sin(phi1) + Math.sin(phi2));
  }
  return Math.abs((area * R * R) / 2);
}

// Haversine distance between two [lat, lng] points in km
export function haversineDistance(p1, p2) {
  const R = 6371;
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Format large numbers for display
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.round(n).toString();
}

// Estimate population within a given area
export function estimatePopulation(areaKm2, density = MUMBAI.avgDensity) {
  return Math.round(areaKm2 * density);
}

// Earthquake impact radii (km) based on magnitude
export function getEarthquakeRadii(magnitude) {
  const severe = Math.pow(2, magnitude - 3); // M4→2, M5→4, M6→8, M7→16, M8→32
  return {
    severe: severe,
    moderate: severe * 2,
    light: severe * 4,
  };
}

// Determine which severity zones are active based on scenario and params
export function getActiveZones(scenario, params) {
  if (scenario === "Flood") {
    const wl = params?.waterLevel ?? 2;
    const zones = ["severe"];
    if (wl >= 1.5) zones.push("moderate");
    if (wl >= 2.5) zones.push("light");
    return zones;
  }
  if (scenario === "Tsunami") {
    const wh = params?.waveHeight ?? 10;
    const zones = ["severe"];
    if (wh >= 5) zones.push("moderate");
    if (wh >= 10) zones.push("light");
    return zones;
  }
  if (scenario === "Earthquake") {
    return ["severe", "moderate", "light"];
  }
  return [];
}

// Ray-casting point-in-polygon test (point: [lat,lng], polygon: [[lat,lng],...])
export function isPointInPolygon(point, polygon) {
  const x = point[1]; // lng
  const y = point[0]; // lat
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1]; // lng
    const yi = polygon[i][0]; // lat
    const xj = polygon[j][1]; // lng
    const yj = polygon[j][0]; // lat
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Check if a point is within earthquake impact radius (km from epicenter)
export function isPointInEarthquakeZone(point, epicenter, radiusKm) {
  return haversineDistance(point, epicenter) <= radiusKm;
}

// Get all affected facilities within a disaster zone
export function getAffectedFacilities(scenario, params) {
  const allFacilities = [...HOSPITALS, ...SHELTERS];
  const affected = { severe: [], moderate: [], light: [] };

  if (scenario === "Earthquake") {
    const radii = getEarthquakeRadii(params?.magnitude ?? 6);
    const epicenter = SCENARIOS.Earthquake.epicenter;
    for (const f of allFacilities) {
      const dist = haversineDistance(f.position, epicenter);
      if (dist <= radii.severe) affected.severe.push(f);
      else if (dist <= radii.moderate) affected.moderate.push(f);
      else if (dist <= radii.light) affected.light.push(f);
    }
  } else if (ZONES[scenario]) {
    const activeZones = getActiveZones(scenario, params);
    for (const f of allFacilities) {
      for (const level of activeZones) {
        const zone = ZONES[scenario][level];
        if (zone && isPointInPolygon(f.position, zone)) {
          affected[level].push(f);
          break;
        }
      }
    }
  }

  return affected;
}

// Calculate total affected area for a scenario
export function getAffectedArea(scenario, params) {
  if (scenario === "Earthquake") {
    const radii = getEarthquakeRadii(params?.magnitude ?? 6);
    const activeLevels = getActiveZones(scenario, params);
    let totalArea = 0;
    // For earthquake, area = π * (outer radius² - inner radius²) for each ring
    const ringRadii = {
      severe: radii.severe,
      moderate: radii.moderate,
      light: radii.light,
    };
    const sortedLevels = activeLevels.sort(
      (a, b) => ringRadii[b] - ringRadii[a]
    );
    let prevRadius = 0;
    for (const level of sortedLevels) {
      const r = ringRadii[level];
      totalArea += Math.PI * (r * r - prevRadius * prevRadius);
      prevRadius = r;
    }
    return totalArea;
  }

  if (ZONES[scenario]) {
    const activeZones = getActiveZones(scenario, params);
    let totalArea = 0;
    // For nested polygons, subtract inner from outer
    const sortedLevels = activeZones.sort(
      (a, b) =>
        calculatePolygonArea(ZONES[scenario][b]) -
        calculatePolygonArea(ZONES[scenario][a])
    );
    let prevArea = 0;
    for (const level of sortedLevels) {
      const area = calculatePolygonArea(ZONES[scenario][level]);
      totalArea += area - prevArea;
      prevArea = area;
    }
    return totalArea;
  }

  return 0;
}

// Get nearest shelters to a point, sorted by distance
export function getNearestShelters(point, count = 3) {
  return SHELTERS.map((s) => ({
    ...s,
    distance: haversineDistance(point, s.position),
  })).sort((a, b) => a.distance - b.distance);
}

// ---- Escape route functions ----

// Nearest point on a line segment to a given point ([lat, lng])
function nearestPointOnSegment(p, a, b) {
  const ax = a[1],
    ay = a[0];
  const bx = b[1],
    by = b[0];
  const px = p[1],
    py = p[0];
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return a;
  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return [ay + t * dy, ax + t * dx];
}

// Nearest point on a polygon's edge to a given point
function nearestPointOnPolygon(point, polygon) {
  let minDist = Infinity;
  let nearest = polygon[0];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const candidate = nearestPointOnSegment(point, a, b);
    const dist = haversineDistance(point, candidate);
    if (dist < minDist) {
      minDist = dist;
      nearest = candidate;
    }
  }
  return nearest;
}

// Bearing (radians) from p1 to p2
function bearing(p1, p2) {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.atan2(y, x);
}

// Destination point given start, distance (km), and bearing (rad)
function destinationPoint(start, distanceKm, bearingRad) {
  const R = 6371;
  const lat1 = (start[0] * Math.PI) / 180;
  const lng1 = (start[1] * Math.PI) / 180;
  const d = distanceKm / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearingRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

// Check if the user is inside any active disaster zone
export function isUserInZone(userPos, scenario, params) {
  if (!scenario || !SCENARIOS[scenario]) return { inZone: false, level: null };

  const activeZones = getActiveZones(scenario, params);

  if (scenario === "Earthquake") {
    const radii = getEarthquakeRadii(params?.magnitude ?? 6);
    const epicenter = SCENARIOS.Earthquake.epicenter;
    const dist = haversineDistance(userPos, epicenter);
    if (dist <= radii.severe)
      return { inZone: true, level: "severe", outerRadius: radii.light };
    if (dist <= radii.moderate)
      return { inZone: true, level: "moderate", outerRadius: radii.light };
    if (dist <= radii.light)
      return { inZone: true, level: "light", outerRadius: radii.light };
    return { inZone: false, level: null };
  }

  if (ZONES[scenario]) {
    for (const level of activeZones) {
      const zone = ZONES[scenario][level];
      if (zone && isPointInPolygon(userPos, zone)) {
        return { inZone: true, level, outerLevel: activeZones[activeZones.length - 1] };
      }
    }
  }

  return { inZone: false, level: null };
}

// Calculate escape route from user's position to nearest safe shelter
export function getEscapeRoute(userPos, scenario, params) {
  const check = isUserInZone(userPos, scenario, params);
  if (!check.inZone) {
    return { inZone: false, route: null, shelter: null };
  }

  let exitPoint = null;
  let outerRadius = 0;

  if (scenario === "Earthquake") {
    outerRadius = check.outerRadius;
    const epicenter = SCENARIOS.Earthquake.epicenter;
    const b = bearing(epicenter, userPos);
    exitPoint = destinationPoint(epicenter, outerRadius, b);
  } else if (ZONES[scenario]) {
    const outerZone = ZONES[scenario][check.outerLevel];
    exitPoint = nearestPointOnPolygon(userPos, outerZone);
  }

  // Find safe shelters (not in any active zone)
  const activeZones = getActiveZones(scenario, params);
  const safeShelters = SHELTERS.filter((s) => {
    if (scenario === "Earthquake") {
      return (
        haversineDistance(s.position, SCENARIOS.Earthquake.epicenter) >
        outerRadius
      );
    }
    if (ZONES[scenario]) {
      return !activeZones.some(
        (level) =>
          ZONES[scenario][level] &&
          isPointInPolygon(s.position, ZONES[scenario][level])
      );
    }
    return true;
  });

  const pool = safeShelters.length > 0 ? safeShelters : SHELTERS;
  const nearest = pool
    .map((s) => ({ ...s, dist: haversineDistance(exitPoint, s.position) }))
    .sort((a, b) => a.dist - b.dist)[0];

  return {
    inZone: true,
    level: check.level,
    exitPoint,
    route: [userPos, exitPoint, nearest.position],
    shelter: nearest,
    exitDistance: haversineDistance(userPos, exitPoint),
    shelterDistance: nearest.dist,
    totalDistance:
      haversineDistance(userPos, exitPoint) + nearest.dist,
  };
}
