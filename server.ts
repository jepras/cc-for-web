/**
 * Geolocation Map MCP Server
 *
 * Provides a tool that displays an interactive 3D globe showing the user's current location.
 * Uses CesiumJS for mapping and the browser's Geolocation API.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const RESOURCE_URI = "ui://geolocation-map/mcp-app.html";

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Geolocation Map Server",
    version: "1.0.0",
  });

  // CSP and permissions configuration for CesiumJS
  const uiMeta = {
    ui: {
      // Request geolocation permission for the iframe
      permissions: ["geolocation"],
      csp: {
        // Allow fetching tiles from OSM and Cesium assets
        connectDomains: [
          "https://*.openstreetmap.org",
          "https://cesium.com",
          "https://*.cesium.com",
        ],
        // Allow loading tile images, scripts, and Cesium CDN resources
        resourceDomains: [
          "https://*.openstreetmap.org",
          "https://cesium.com",
          "https://*.cesium.com",
        ],
      },
    },
  };

  // Register the map UI resource
  registerAppResource(
    server,
    RESOURCE_URI,
    RESOURCE_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          {
            uri: RESOURCE_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
            _meta: uiMeta,
          },
        ],
      };
    },
  );

  // show-my-location tool - displays the globe with user's geolocation
  registerAppTool(
    server,
    "show-my-location",
    {
      title: "Show My Location",
      description:
        "Display an interactive 3D globe showing your current geographic location. Requires location permission.",
      inputSchema: {},
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async (): Promise<CallToolResult> => ({
      content: [
        {
          type: "text",
          text: "Opening interactive 3D globe to display your current location...",
        },
      ],
      structuredContent: {
        action: "show-location",
      },
    }),
  );

  // show-map-at tool - displays the globe at specific coordinates
  registerAppTool(
    server,
    "show-map-at",
    {
      title: "Show Map At Location",
      description: "Display an interactive 3D globe centered on specific coordinates.",
      inputSchema: {
        latitude: z.number().min(-90).max(90).describe("Latitude (-90 to 90)"),
        longitude: z.number().min(-180).max(180).describe("Longitude (-180 to 180)"),
        label: z.string().optional().describe("Optional label for the location"),
      },
      _meta: { ui: { resourceUri: RESOURCE_URI } },
    },
    async ({ latitude, longitude, label }): Promise<CallToolResult> => ({
      content: [
        {
          type: "text",
          text: `Showing globe at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}${label ? ` (${label})` : ""}`,
        },
      ],
      structuredContent: {
        action: "show-coordinates",
        latitude,
        longitude,
        label,
      },
    }),
  );

  return server;
}
