// Family Tracking & Community Safe Haven Beacon Service

export const INITIAL_FAMILY_MEMBERS = [
  {
    id: "priya",
    name: "Priya (Sister)",
    relation: "Sister",
    status: "SAFE", // SAFE | EVACUATING | AT_HOME | NEED_HELP
    statusLabel: "Safe at Shelter",
    locationName: "Shivaji Park Ground Haven",
    position: [19.030, 72.842],
    battery: "88%",
    lastPing: "14m ago",
    avatarColor: "#10b981",
    avatarIcon: "👧",
    notes: "Checked in at Registration Gate B. Medical supplies received.",
  },
  {
    id: "rahul",
    name: "Rahul (Father)",
    relation: "Father",
    status: "EVACUATING",
    statusLabel: "In Transit · Car",
    locationName: "SV Road, Khar West",
    position: [19.070, 72.838],
    battery: "64%",
    lastPing: "3m ago",
    avatarColor: "#3b82f6",
    avatarIcon: "👨",
    notes: "Driving on elevated corridor towards BKC Refuge. ETA 8 min.",
  },
  {
    id: "ananya",
    name: "Ananya (Mother)",
    relation: "Mother",
    status: "AT_HOME",
    statusLabel: "Sheltered at Home",
    locationName: "Bandra West (2nd Floor Flat)",
    position: [19.055, 72.828],
    battery: "92%",
    lastPing: "Just now",
    avatarColor: "#a855f7",
    avatarIcon: "👩",
    notes: "Safe on higher floor. Power active. In touch via landline.",
  },
];

export function generateWhatsAppEmergencyLink(userLocation, currentHaven, routeInfo) {
  const [lat, lng] = userLocation || [19.042, 72.852];
  const havenName = currentHaven?.name || "BKC Sports Complex (Designated Haven)";
  const eta = routeInfo?.totalMinutes || 11;
  const dist = routeInfo?.totalDistanceKm || 3.2;

  const text = `🚨 *EMERGENCY STATUS UPDATE — CityTwin Mumbai*
I am safe and currently following the official automated escape route.

📍 *Current Coordinates:* ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E
🛡️ *Destination Shelter:* ${havenName}
⏱️ *ETA:* ${eta} minutes (${dist} km away)
🔋 *Phone Status:* Operational
📞 *National Emergency Contact:* 112 / 108

Sent via Mumbai Urban Digital Twin Autonomous Navigator.`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
