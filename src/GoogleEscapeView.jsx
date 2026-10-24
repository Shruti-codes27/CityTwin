import { useState, useEffect, useRef } from "react";
import GoogleNavMap2D from "./GoogleNavMap2D";
import City3DMap from "./City3DMap";
import NavigationHud from "./NavigationHud";
import {
  CITIZEN_HOTSPOTS,
  calculateGoogleEscapeRoute,
  speakNavigationInstruction,
  stopNavigationSpeech,
  getHeading,
} from "./navigationEngine";

export default function GoogleEscapeView({
  scenario = "Flood",
  params = { waterLevel: 3, magnitude: 6, waveHeight: 10 },
  voiceEnabled = true,
  onToggleVoice,
  mapDimension = "2D",
  onToggleMapDimension,
  userLocation,
  onLocationChange,
  familyMembers = [],
}) {
  const [selectedHotspot, setSelectedHotspot] = useState(CITIZEN_HOTSPOTS[0]);
  const [isAlternateRoute, setIsAlternateRoute] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [isDroneDispatched, setIsDroneDispatched] = useState(false);
  const [droneCoord, setDroneCoord] = useState(null);

  // Animation frame / interval ref
  const animRef = useRef(null);
  const droneAnimRef = useRef(null);

  // Active citizen starting location
  const activeStartLocation = userLocation || selectedHotspot.position;

  // Compute realistic Google escape route
  const escapeRoute = calculateGoogleEscapeRoute(
    activeStartLocation,
    null,
    isAlternateRoute ? "alternate" : "primary"
  );

  const denseCoords = escapeRoute.denseCoordinates || [];
  const currentAvatarPos =
    denseCoords[avatarIndex] || denseCoords[0] || activeStartLocation;

  // Compute avatar heading
  const nextAvatarPos =
    denseCoords[Math.min(avatarIndex + 1, denseCoords.length - 1)] ||
    currentAvatarPos;
  const avatarHeading = getHeading(currentAvatarPos, nextAvatarPos);

  // Update step instruction based on avatar progress
  useEffect(() => {
    if (denseCoords.length > 0 && escapeRoute.instructions.length > 0) {
      const progressFraction = avatarIndex / denseCoords.length;
      const targetStep = Math.min(
        escapeRoute.instructions.length - 1,
        Math.floor(progressFraction * escapeRoute.instructions.length)
      );
      if (targetStep !== currentStepIndex) {
        setCurrentStepIndex(targetStep);
        const nextInst = escapeRoute.instructions[targetStep];
        if (nextInst && voiceEnabled) {
          speakNavigationInstruction(nextInst.instruction, voiceEnabled);
        }
      }
    }
  }, [avatarIndex, denseCoords.length, escapeRoute.instructions, currentStepIndex, voiceEnabled]);

  // Live Navigation Animation Loop
  useEffect(() => {
    if (isNavigating) {
      animRef.current = setInterval(() => {
        setAvatarIndex((prev) => {
          if (prev >= denseCoords.length - 1) {
            clearInterval(animRef.current);
            setIsNavigating(false);
            if (voiceEnabled) {
              speakNavigationInstruction(
                `You have arrived safely at ${escapeRoute.destination?.name}.`,
                voiceEnabled
              );
            }
            return prev;
          }
          return prev + 1;
        });
      }, 140);
    } else {
      if (animRef.current) clearInterval(animRef.current);
    }

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [isNavigating, denseCoords.length, voiceEnabled, escapeRoute.destination]);

  // Autonomous Drone Flyover Simulation
  useEffect(() => {
    if (isDroneDispatched) {
      const startBase = [19.005, 72.820];
      const target = activeStartLocation;
      let step = 0;
      const totalSteps = 60;

      droneAnimRef.current = setInterval(() => {
        step++;
        const t = step / totalSteps;
        const lat = startBase[0] + (target[0] - startBase[0]) * t;
        const lng = startBase[1] + (target[1] - startBase[1]) * t;
        setDroneCoord([lat, lng]);

        if (step >= totalSteps) {
          clearInterval(droneAnimRef.current);
        }
      }, 100);
    } else {
      if (droneAnimRef.current) clearInterval(droneAnimRef.current);
      setDroneCoord(null);
    }

    return () => {
      if (droneAnimRef.current) clearInterval(droneAnimRef.current);
    };
  }, [isDroneDispatched, activeStartLocation]);

  // Handlers
  const handleToggleNavigation = () => {
    if (!isNavigating) {
      if (avatarIndex >= denseCoords.length - 1) {
        setAvatarIndex(0);
        setCurrentStepIndex(0);
      }
      setIsNavigating(true);
      if (voiceEnabled && escapeRoute.instructions[0]) {
        speakNavigationInstruction(
          `Starting route to ${escapeRoute.destination?.name}. ${escapeRoute.instructions[0].instruction}`,
          voiceEnabled
        );
      }
    } else {
      setIsNavigating(false);
      stopNavigationSpeech();
    }
  };

  const handleResetNavigation = () => {
    setIsNavigating(false);
    setAvatarIndex(0);
    setCurrentStepIndex(0);
    stopNavigationSpeech();
  };

  const handleToggleAlternateRoute = () => {
    setIsAlternateRoute((prev) => !prev);
    setAvatarIndex(0);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    stopNavigationSpeech();
    if (voiceEnabled) {
      speakNavigationInstruction(
        !isAlternateRoute
          ? "Rerouting via elevated flyover bypass corridor."
          : "Switched back to primary fastest escape corridor.",
        voiceEnabled
      );
    }
  };

  const handleSelectHotspot = (hotspot) => {
    setSelectedHotspot(hotspot);
    if (onLocationChange) {
      onLocationChange(hotspot.position);
    }
    setAvatarIndex(0);
    setCurrentStepIndex(0);
    setIsNavigating(false);
    if (voiceEnabled) {
      speakNavigationInstruction(
        `Sector set to ${hotspot.name}. Calculating optimal evacuation corridor.`,
        voiceEnabled
      );
    }
  };

  const handleDispatchDrone = () => {
    setIsDroneDispatched((prev) => !prev);
    if (!isDroneDispatched && voiceEnabled) {
      speakNavigationInstruction(
        "Autonomous rescue drone dispatched. Aerial reconnaissance escort incoming to your sector.",
        voiceEnabled
      );
    }
  };

  return (
    <div className="google-escape-view-container">
      {/* MAP VIEWPORT: 2D or 3D */}
      <div className="escape-map-viewport">
        {mapDimension === "2D" ? (
          <GoogleNavMap2D
            userLocation={activeStartLocation}
            routeCoordinates={escapeRoute.waypoints}
            avatarPosition={currentAvatarPos}
            avatarHeading={avatarHeading}
            destinationHaven={escapeRoute.destination}
            scenario={scenario}
            params={params}
            followAvatar={isNavigating}
            dronePosition={droneCoord}
            familyMembers={familyMembers}
            onLocationSelect={(coords) => {
              if (onLocationChange) onLocationChange(coords);
              setAvatarIndex(0);
              setCurrentStepIndex(0);
              setIsNavigating(false);
            }}
          />
        ) : (
          <City3DMap
            userLocation={activeStartLocation}
            routeCoordinates={escapeRoute.waypoints}
            avatarPosition={currentAvatarPos}
            avatarHeading={avatarHeading}
            scenario={scenario}
            params={params}
            followAvatar={isNavigating}
            dronePosition={droneCoord}
            familyMembers={familyMembers}
          />
        )}
      </div>

      {/* GOOGLE MAPS NAVIGATION HUD OVERLAY */}
      <NavigationHud
        route={escapeRoute}
        currentStepIndex={currentStepIndex}
        isNavigating={isNavigating}
        onToggleNavigation={handleToggleNavigation}
        onResetNavigation={handleResetNavigation}
        onToggleAlternateRoute={handleToggleAlternateRoute}
        isAlternate={isAlternateRoute}
        voiceEnabled={voiceEnabled}
        onToggleVoice={onToggleVoice}
        onDispatchDrone={handleDispatchDrone}
        isDroneDispatched={isDroneDispatched}
        onSelectHotspot={handleSelectHotspot}
        selectedHotspotId={selectedHotspot.id}
        hotspots={CITIZEN_HOTSPOTS}
      />
    </div>
  );
}
