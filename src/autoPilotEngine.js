// Autonomous City Intelligence Engine (Auto-Pilot)
// Continuously monitors telemetry streams from IoT sensors across Mumbai.
// When an anomaly or threshold is breached, it automatically detects the danger,
// alerts the user, activates the scenario, and engages Google Maps-style escape navigation.

export const TELEMETRY_THRESHOLDS = {
  waterLevelWarning: 2.0, // meters
  waterLevelCritical: 3.2,
  seismicWarning: 4.5, // Richter
  seismicCritical: 6.0,
  coastalSurgeWarning: 6.0, // meters
  coastalSurgeCritical: 11.0,
};

export const INITIAL_TELEMETRY = {
  waterLevel: 1.1, // m
  waterLevelTrend: "+0.1m/hr",
  seismicRichter: 1.4, // magnitude
  seismicTrend: "Stable",
  coastalSurge: 1.8, // m
  rainRate: 14, // mm/hr
  urbanSafetyScore: 94, // %
  statusLevel: "NORMAL", // NORMAL | WARNING | CRITICAL
  autonomousStatus: "MONITORING ACTIVE",
  activeAlertMessage: "All urban telemetry sensors reporting within nominal safety thresholds.",
  lastUpdated: new Date().toLocaleTimeString(),
};

// Autonomous alerts presets
export const ANOMALY_PRESETS = {
  Flood: {
    scenario: "Flood",
    params: { waterLevel: 3.5, magnitude: 6, waveHeight: 10 },
    telemetry: {
      waterLevel: 3.65,
      waterLevelTrend: "CRITICAL SURGE (+0.8m/10min)",
      rainRate: 98,
      seismicRichter: 1.2,
      seismicTrend: "Stable",
      coastalSurge: 2.4,
      urbanSafetyScore: 32,
      statusLevel: "CRITICAL",
      autonomousStatus: "HAZARD DETECTED · AUTO-ENGAGING ESCAPE",
      activeAlertMessage: "CRITICAL: Mithi River basin overflowing (3.65m). Inundation zone expanding. Auto-routing escape path to BKC High Ground refuge.",
    },
    voiceAnnouncement: "Emergency Alert. Severe flooding detected in Mithi Basin. Auto-Pilot engaged. Navigating to safest high-ground shelter now.",
  },
  Earthquake: {
    scenario: "Earthquake",
    params: { waterLevel: 2, magnitude: 6.4, waveHeight: 10 },
    telemetry: {
      waterLevel: 1.3,
      waterLevelTrend: "Stable",
      rainRate: 6,
      seismicRichter: 6.4,
      seismicTrend: "P-WAVE SHOCK DETECTED",
      coastalSurge: 2.0,
      urbanSafetyScore: 28,
      statusLevel: "CRITICAL",
      autonomousStatus: "SEISMIC ANOMALY · AUTO-EVACUATING",
      activeAlertMessage: "CRITICAL: 6.4 Magnitude seismic tremor localized near Mumbai. Structural risk high. Auto-routing to open ground refuge.",
    },
    voiceAnnouncement: "Seismic Alert. Magnitude 6.4 earthquake detected. Evacuate tall structures. Auto-Pilot directing to Shivaji Park open ground shelter.",
  },
  Tsunami: {
    scenario: "Tsunami",
    params: { waterLevel: 2, magnitude: 6, waveHeight: 14 },
    telemetry: {
      waterLevel: 2.2,
      waterLevelTrend: "Receding prior to wave",
      rainRate: 22,
      seismicRichter: 2.1,
      seismicTrend: "Stable",
      coastalSurge: 14.2,
      urbanSafetyScore: 24,
      statusLevel: "CRITICAL",
      autonomousStatus: "COASTAL SURGE ALERT · AUTO-ROUTING INLAND",
      activeAlertMessage: "CRITICAL: 14m Coastal surge advancing towards Marine Drive & Bandra coast. Auto-routing inland to elevated eastern haven.",
    },
    voiceAnnouncement: "Tsunami Warning. Coastal surge detected along western coast. Move inland immediately. Auto-Pilot engaged.",
  },
};
