import { useState, useCallback } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location access denied. Please allow location in your browser settings.",
          2: "Your position is unavailable. Check your GPS or network.",
          3: "Location request timed out. Try again.",
        };
        setError(messages[err.code] || err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { location, loading, error, requestLocation };
}
