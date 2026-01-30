/**
 * Geolocation Globe MCP App
 *
 * Displays an interactive 3D globe using CesiumJS with the user's current location.
 * Based on the map-server example from ext-apps.
 */
import { App } from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// TypeScript declaration for Cesium loaded from CDN
declare let Cesium: any;

const CESIUM_VERSION = "1.123";
const CESIUM_BASE_URL = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium`;

const statusEl = document.getElementById("status")!;
const loadingEl = document.getElementById("loading")!;

// Cesium viewer instance
let viewer: any = null;

// Create the MCP App instance
const app = new App({ name: "Geolocation Globe", version: "1.0.0" });

/**
 * Dynamically load CesiumJS from CDN
 */
async function loadCesium(): Promise<void> {
  if (typeof Cesium !== "undefined") return;

  // Load CSS
  const cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = `${CESIUM_BASE_URL}/Widgets/widgets.css`;
  document.head.appendChild(cssLink);

  // Load JS
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${CESIUM_BASE_URL}/Cesium.js`;
    script.onload = () => {
      (window as any).CESIUM_BASE_URL = CESIUM_BASE_URL;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load CesiumJS"));
    document.head.appendChild(script);
  });
}

/**
 * Update status message
 */
function setStatus(message: string, type: "info" | "success" | "error" = "info") {
  statusEl.textContent = message;
  statusEl.className = type;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  loadingEl.style.display = "none";
}

/**
 * Show loading with message
 */
function showLoading(message: string) {
  const msgEl = loadingEl.querySelector("div:last-child");
  if (msgEl) msgEl.textContent = message;
  loadingEl.style.display = "block";
}

/**
 * Initialize CesiumJS viewer with OpenStreetMap tiles
 */
async function initCesium(): Promise<any> {
  // Disable Cesium Ion
  Cesium.Ion.defaultAccessToken = undefined;

  const cesiumViewer = new Cesium.Viewer("cesiumContainer", {
    baseLayer: false,
    geocoder: false,
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    terrainProvider: undefined,
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
        alpha: true,
      },
    },
    useBrowserRecommendedResolution: false,
  });

  // Configure globe
  cesiumViewer.scene.globe.show = true;
  cesiumViewer.scene.globe.enableLighting = false;
  cesiumViewer.scene.globe.baseColor = Cesium.Color.DARKSLATEGRAY;
  cesiumViewer.scene.requestRenderMode = false;
  cesiumViewer.canvas.style.imageRendering = "auto";
  cesiumViewer.scene.postProcessStages.fxaa.enabled = false;

  // Add OpenStreetMap tiles
  const osmProvider = new Cesium.UrlTemplateImageryProvider({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    minimumLevel: 0,
    maximumLevel: 19,
    credit: new Cesium.Credit('© OpenStreetMap contributors', true),
  });
  cesiumViewer.imageryLayers.addImageryProvider(osmProvider);

  return cesiumViewer;
}

/**
 * Get user's current geolocation
 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

/**
 * Fly camera to location
 */
function flyToLocation(lat: number, lon: number, height: number = 50000) {
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-45),
      roll: 0,
    },
    duration: 2,
  });
}

/**
 * Add a point marker at location
 */
function addMarker(lat: number, lon: number, label?: string) {
  if (!viewer) return;

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: label ? {
      text: label,
      font: "14px sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -15),
    } : undefined,
  });
}

/**
 * Show user's current location on the globe
 */
async function showCurrentLocation() {
  showLoading("Getting your location...");
  setStatus("Requesting location permission...", "info");

  try {
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;

    hideLoading();

    // Clear existing entities
    viewer.entities.removeAll();

    // Add marker and fly to location
    addMarker(latitude, longitude, "You are here!");
    flyToLocation(latitude, longitude, Math.max(accuracy * 50, 10000));

    setStatus(`Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`, "success");

    // Update model context
    app.updateModelContext({
      content: [{
        type: "text",
        text: `User's location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy: ±${Math.round(accuracy)}m)`,
      }],
    });

  } catch (error) {
    hideLoading();
    const message = error instanceof GeolocationPositionError
      ? getGeolocationErrorMessage(error)
      : String(error);
    setStatus(`Error: ${message}`, "error");
  }
}

/**
 * Get human-readable geolocation error
 */
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied";
    case error.POSITION_UNAVAILABLE:
      return "Location unavailable";
    case error.TIMEOUT:
      return "Location request timed out";
    default:
      return "Unknown location error";
  }
}

/**
 * Show specific coordinates on the globe
 */
function showCoordinates(lat: number, lon: number, label?: string) {
  hideLoading();
  viewer.entities.removeAll();
  addMarker(lat, lon, label || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  flyToLocation(lat, lon);
  setStatus(`Showing: ${lat.toFixed(6)}, ${lon.toFixed(6)}${label ? ` (${label})` : ""}`, "success");
}

// Handle tool result
app.ontoolresult = (result: CallToolResult) => {
  console.log("Tool result:", result);
  const data = result.structuredContent as {
    action?: string;
    latitude?: number;
    longitude?: number;
    label?: string;
  } | undefined;

  if (data?.action === "show-location") {
    showCurrentLocation();
  } else if (data?.action === "show-coordinates" && data.latitude !== undefined && data.longitude !== undefined) {
    showCoordinates(data.latitude, data.longitude, data.label);
  } else {
    showCurrentLocation();
  }
};

app.onerror = console.error;

// Initialize
async function init() {
  try {
    setStatus("Loading CesiumJS...", "info");
    await loadCesium();

    setStatus("Initializing globe...", "info");
    viewer = await initCesium();

    // Set initial view
    viewer.camera.setView({
      destination: Cesium.Rectangle.fromDegrees(-180, -60, 180, 75),
    });

    hideLoading();

    // Connect to host
    await app.connect();
    setStatus("Ready - waiting for location request...", "info");

  } catch (error) {
    hideLoading();
    setStatus(`Error: ${error}`, "error");
  }
}

init();
