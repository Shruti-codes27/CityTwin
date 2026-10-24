
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";

// Vite pre-bundles maplibre-gl into /node_modules/.vite/deps/, which
// breaks the library's automatic worker URL resolution (it derives the
// worker path from import.meta.url). Set the worker URL explicitly so
// the Web Worker loads from the correct bundled location.
maplibregl.setWorkerUrl(workerUrl);

export default function City3D() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [72.835, 19.045],
      zoom: 14,
      pitch: 60,
      bearing: -20,
      maxPitch: 85,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.FullscreenControl(),
      "top-right"
    );

    map.on("load", () => {
      const style = map.getStyle();
      const buildingLayer = style.layers?.find(
        (layer) =>
          layer["source-layer"] === "building" &&
          layer.type === "fill"
      );

      if (!buildingLayer) {
        console.warn(
          "A building layer was not found in the current map style."
        );
        return;
      }

      map.addLayer(
        {
          id: "citytwin-3d-buildings",
          source: buildingLayer.source,
          "source-layer": buildingLayer["source-layer"],
          type: "fill-extrusion",
          minzoom: 13,
          filter: ["!=", ["get", "hide_3d"], true],
          paint: {
            "fill-extrusion-color": "#91a9c6",
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
            "fill-extrusion-opacity": 0.9,
          },
        },
        buildingLayer.id
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainer} className="city3d-map" />;
}
