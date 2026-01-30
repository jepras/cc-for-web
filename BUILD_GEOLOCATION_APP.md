# Build: Geolocation Globe MCP App

Create an MCP App that displays the user's current location on an interactive 3D globe inside Claude conversations.

## Reference Examples

- **map-server:** https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/map-server
- **basic-server-vanillajs:** https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/basic-server-vanillajs
- **MCP Apps docs:** https://modelcontextprotocol.io/docs/extensions/apps
- **Specification:** https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx

## Project Structure

```
├── server.ts        # MCP server with tools + UI resource
├── main.ts          # HTTP server entry point
├── mcp-app.html     # UI entry point
├── src/mcp-app.ts   # UI logic (CesiumJS + Geolocation API)
├── vite.config.ts   # Bundles UI to single HTML
├── tsconfig.json
└── package.json
```

## Key Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/ext-apps": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.24.0",
    "express": "^5.1.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vite-plugin-singlefile": "^2.3.0",
    "typescript": "^5.9.0"
  }
}
```

## Server Implementation

### 1. Request Geolocation Permission

The key is setting `permissions: ["geolocation"]` in `_meta.ui`:

```typescript
const uiMeta = {
  ui: {
    permissions: ["geolocation"],  // Request browser geolocation
    csp: {
      connectDomains: [
        "https://*.openstreetmap.org",
        "https://cesium.com",
        "https://*.cesium.com",
      ],
      resourceDomains: [
        "https://*.openstreetmap.org",
        "https://cesium.com",
        "https://*.cesium.com",
      ],
    },
  },
};
```

### 2. Register UI Resource

```typescript
registerAppResource(server, RESOURCE_URI, RESOURCE_URI,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile("dist/mcp-app.html", "utf-8");
    return {
      contents: [{
        uri: RESOURCE_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: html,
        _meta: uiMeta,  // Include permissions here
      }],
    };
  }
);
```

### 3. Register Tool with UI

```typescript
registerAppTool(server, "show-my-location", {
  title: "Show My Location",
  description: "Display your current location on an interactive 3D globe.",
  inputSchema: {},
  _meta: { ui: { resourceUri: RESOURCE_URI } },
}, async () => ({
  content: [{ type: "text", text: "Opening map..." }],
  structuredContent: { action: "show-location" },
}));
```

## UI Implementation

### 1. Load CesiumJS from CDN

```typescript
const CESIUM_VERSION = "1.123";
const CESIUM_BASE_URL = `https://cesium.com/downloads/cesiumjs/releases/${CESIUM_VERSION}/Build/Cesium`;

async function loadCesium() {
  // Load CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${CESIUM_BASE_URL}/Widgets/widgets.css`;
  document.head.appendChild(link);

  // Load JS
  const script = document.createElement("script");
  script.src = `${CESIUM_BASE_URL}/Cesium.js`;
  document.head.appendChild(script);
  await new Promise(resolve => script.onload = resolve);
}
```

### 2. Get Geolocation

```typescript
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
    });
  });
}
```

### 3. Handle Tool Result

```typescript
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "Geolocation Globe", version: "1.0.0" });

app.ontoolresult = (result) => {
  const data = result.structuredContent;
  if (data?.action === "show-location") {
    showCurrentLocation();  // Get GPS and display on globe
  }
};

app.connect();
```

### 4. Update Model Context (Optional)

Send location back to Claude:

```typescript
app.updateModelContext({
  content: [{
    type: "text",
    text: `User location: ${lat}, ${lon} (±${accuracy}m)`,
  }],
});
```

## Build & Run

```bash
# Build UI (bundles to single HTML)
cross-env INPUT=mcp-app.html vite build

# Start server
bun main.ts  # or: npx tsx main.ts
```

## Test with Claude

1. Run server locally
2. Expose via `npx cloudflared tunnel --url http://localhost:3001`
3. Add connector in Claude settings with URL + `/mcp`
4. Ask: "Show me my location"

## Available Permissions

Per the spec, hosts MAY support:
- `geolocation`
- `camera`
- `microphone`
- `clipboardWrite`
