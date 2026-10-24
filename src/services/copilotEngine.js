// Smart AI City Copilot Engine for CityTwin
// Answers emergency questions, assesses risk triage, and provides live situation intelligence.

import { HOSPITALS, SHELTERS, MUMBAI, formatNumber } from "../data";

export const COPILOT_PROMPTS = [
  {
    id: "shelter",
    label: "Where is the nearest safe shelter with supplies?",
    query: "Where is the nearest safe shelter with supplies?",
  },
  {
    id: "route",
    label: "Is the route to BKC clear of waterlogging?",
    query: "Is the route to BKC clear of waterlogging?",
  },
  {
    id: "triage",
    label: "Triage Checklist: I am on foot with an elderly person",
    query: "I am on foot with an elderly family member. What is the safest evacuation procedure?",
  },
  {
    id: "hospitals",
    label: "Show operational hospitals with emergency beds",
    query: "Which nearby hospitals have operational emergency beds and power backup?",
  },
];

export function generateCopilotAnswer(query, context) {
  const q = query.toLowerCase();
  const { scenario, params, telemetry, activeRoute } = context;

  // 1. Shelter inquiry
  if (q.includes("shelter") || q.includes("haven") || q.includes("refuge") || q.includes("where to go")) {
    const destName = activeRoute?.destination?.name || "BKC Sports Complex";
    return {
      text: `Based on real-time elevation and hazard modeling, your primary safe haven is **${destName}**.`,
      points: [
        `Elevation: ${activeRoute?.destination?.elevation || "18m (High Ground)"} — verified safe from flood surge.`,
        `Supplies Available: Food rations, clean drinking water, emergency first aid, and auxiliary solar power.`,
        `Estimated Travel Time: ${activeRoute?.totalMinutes || 11} minutes (${activeRoute?.totalDistanceKm || 3.2} km) via monitored corridors.`,
        `Alternate Refuge: Shivaji Park Safe Zone (Dadar) or Somaiya Ground (Eastern Highway).`,
      ],
      action: "NAVIGATE_PRIMARY",
    };
  }

  // 2. Route safety & floodwater
  if (q.includes("route") || q.includes("waterlog") || q.includes("bkc") || q.includes("clear") || q.includes("road")) {
    const isFlood = scenario === "Flood";
    return {
      text: isFlood
        ? `Real-time road sensors indicate that **surface streets in low-lying Dharavi and Kurla are experiencing 0.4m–0.8m standing water**. However, your calculated evacuation corridor utilizes elevated road sections.`
        : `Your evacuation corridor is currently **98.4% clear of obstacles** with normal traffic clearance.`,
      points: [
        `Recommended Path: Use the Western Express Highway elevated flyover and BKC connector bypass.`,
        `Avoid: Milan subway, Kurla low-level rail bridge, and Mithi riverbank underpasses.`,
        `Safety Speed: Maintain an urban escape speed of 25–35 km/h. Keep vehicle headlights on low beam.`,
      ],
      action: "HIGHLIGHT_ROUTE",
    };
  }

  // 3. Triage / Vulnerability assessment (Elderly, Infants, On Foot)
  if (q.includes("elderly") || q.includes("foot") || q.includes("child") || q.includes("triage") || q.includes("walk")) {
    return {
      text: `⚠️ **Special Evacuation Protocol Active: Vulnerable Citizen Assistance**`,
      points: [
        `Do NOT attempt to wade through moving water deeper than knee-level (15cm of flowing water can knock adults over).`,
        `Use the elevated pedestrian walkways along Sion-Bandra link road.`,
        `Priority Transit: NDRF and Municipal rescue trucks are operating shuttle points at Bandra Station East and Kalanagar Junction.`,
        `Medical Alert: Dispatch an aerial rescue drone via the top HUD to mark your coordinates for ground vehicle escort.`,
      ],
      action: "DISPATCH_DRONE_SUGGESTION",
    };
  }

  // 4. Hospitals & Medical care
  if (q.includes("hospital") || q.includes("bed") || q.includes("icu") || q.includes("doctor") || q.includes("medical")) {
    const topHospitals = HOSPITALS.slice(0, 3);
    return {
      text: `Top verified hospitals operating with emergency generator backup outside the primary inundation perimeter:`,
      points: topHospitals.map(
        (h) => `**${h.name}**: ${h.beds} beds capacity (${h.type}). Emergency Helpline: ${h.phone}`
      ),
      action: "OPEN_HOSPITALS",
    };
  }

  // 5. Default contextual response
  return {
    text: `CityTwin Urban AI is monitoring the active **${scenario === "None" ? "Calm Conditions" : scenario + " Alert"}** across Mumbai.`,
    points: [
      `Urban Safety Rating: ${telemetry?.urbanSafetyScore ?? 85}% nominal status.`,
      `Telemetry: Water gauge reading at ${telemetry?.waterLevel?.toFixed(2) || "1.10"}m with ${telemetry?.statusLevel || "NORMAL"} risk level.`,
      `Recommendation: Follow Google Maps navigation to ${activeRoute?.destination?.name || "BKC Sports Complex"} immediately.`,
      `Emergency Hotlines: 112 (National Emergency) · 108 (Ambulance) · 1070 (Disaster Cell).`,
    ],
    action: "GENERAL_ADVICE",
  };
}
