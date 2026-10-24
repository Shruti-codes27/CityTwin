import { useState } from "react";
import {
  Users,
  X,
  ShieldCheck,
  Battery,
  MapPin,
  Share2,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Navigation,
} from "lucide-react";
import {
  INITIAL_FAMILY_MEMBERS,
  generateWhatsAppEmergencyLink,
} from "./services/familyEngine";

export default function FamilyTrackerDrawer({
  isOpen,
  onClose,
  userLocation,
  currentHaven,
  activeRoute,
  onSelectFamilyMember,
}) {
  const [familyMembers, setFamilyMembers] = useState(INITIAL_FAMILY_MEMBERS);
  const [userCheckedInSafe, setUserCheckedInSafe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleUserCheckIn = () => {
    setUserCheckedInSafe(true);
  };

  const whatsappUrl = generateWhatsAppEmergencyLink(
    userLocation,
    currentHaven,
    activeRoute
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="family-drawer-backdrop" onClick={onClose}>
      <aside className="family-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="family-header">
          <div className="family-title-box">
            <div className="family-icon-badge">
              <Users size={20} />
            </div>
            <div>
              <h3>Family & Community Tracker</h3>
              <small>Safe Haven Beacons · Live Group Tracking</small>
            </div>
          </div>
          <button className="btn-close-family" onClick={onClose} title="Close Tracker">
            <X size={18} />
          </button>
        </div>

        {/* User's own check-in card */}
        <div className="user-checkin-banner">
          <div className="checkin-status-info">
            <div className={`checkin-dot ${userCheckedInSafe ? "safe" : "pending"}`} />
            <div>
              <strong>Your Status: {userCheckedInSafe ? "MARKED SAFE ✓" : "EVACUATING EN ROUTE"}</strong>
              <small>
                {userCheckedInSafe
                  ? "Family notified that you have reached safe high ground."
                  : "Auto-escape active towards designated shelter."}
              </small>
            </div>
          </div>

          <div className="checkin-actions">
            {!userCheckedInSafe ? (
              <button className="btn-checkin-safe" onClick={handleUserCheckIn}>
                <CheckCircle2 size={16} /> I Am Safe (Check In)
              </button>
            ) : (
              <span className="badge-safe-confirmed">Checked In at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-share-whatsapp"
            >
              <Share2 size={15} /> WhatsApp Emergency Broadcast
            </a>
          </div>
        </div>

        {/* Family list section */}
        <div className="family-members-list">
          <div className="list-section-heading">
            <span>TRACKED FAMILY MEMBERS ({familyMembers.length})</span>
            <small>Encrypted LoRa & Satellite Pings</small>
          </div>

          {familyMembers.map((member) => {
            const isSafe = member.status === "SAFE";
            const isMoving = member.status === "EVACUATING";
            return (
              <div key={member.id} className="family-member-card">
                <div className="member-card-top">
                  <div className="member-avatar-box" style={{ background: member.avatarColor }}>
                    <span>{member.avatarIcon}</span>
                  </div>
                  <div className="member-identity">
                    <strong>{member.name}</strong>
                    <div className="member-submeta">
                      <span className="location-tag">
                        <MapPin size={11} /> {member.locationName}
                      </span>
                    </div>
                  </div>
                  <div className="member-status-pill">
                    <span className={`status-pill-badge ${isSafe ? "safe" : isMoving ? "moving" : "home"}`}>
                      {member.statusLabel}
                    </span>
                  </div>
                </div>

                <p className="member-notes-text">"{member.notes}"</p>

                <div className="member-card-footer">
                  <div className="footer-meta-stats">
                    <span>
                      <Battery size={13} /> {member.battery}
                    </span>
                    <span>Ping: {member.lastPing}</span>
                  </div>

                  <div className="footer-actions">
                    <button
                      className="btn-locate-member"
                      onClick={() => {
                        if (onSelectFamilyMember) {
                          onSelectFamilyMember(member);
                        }
                        onClose();
                      }}
                      title="View on Map"
                    >
                      <Navigation size={13} /> View on Map
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="family-drawer-footer">
          <div className="sos-group-call">
            <AlertTriangle size={16} color="#ef4444" />
            <span>Emergency SOS broadcast will alert all family phones simultaneously.</span>
          </div>
          <button className="btn-copy-emergency-link" onClick={handleCopyLink}>
            <Share2 size={14} /> {copiedLink ? "Link Copied to Clipboard!" : "Copy Live Coordinates Link"}
          </button>
        </div>
      </aside>
    </div>
  );
}
