# Geolocation Globe MCP App

An interactive MCP App that displays your current location on a 3D globe inside Claude conversations.

Based on the [map-server example](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/map-server) from ext-apps.

## What This Does

When you ask Claude "show my location" or "where am I", this app:
1. Requests your browser's geolocation permission
2. Renders an **interactive 3D globe** (CesiumJS) directly in the chat
3. Flies to and marks your current location with coordinates

## Available Tools

| Tool | Description |
|------|-------------|
| `show-my-location` | Get and display your current GPS location on the globe |
| `show-map-at` | Display a specific latitude/longitude on the globe |

## Running Locally

```bash
# Install dependencies
npm install

# Build UI and start server
npm start

# Server runs at http://localhost:3001/mcp
```

## Testing with Claude

1. Expose your local server:
   ```bash
   npx cloudflared tunnel --url http://localhost:3001
   ```

2. Go to **claude.ai** → Profile → **Settings** → **Connectors**

3. Click **Add custom connector**, enter:
   - Name: `Geolocation Globe`
   - URL: `https://your-tunnel-url.trycloudflare.com/mcp`

4. Start a new chat and ask: "Show me my location" or "Where am I?"

## For Replit Deployment

1. Import from GitHub (switch to `claude/research-mcp-mobile-app-HaKPK` branch)
2. Run `npm start`
3. Use the Replit URL + `/mcp` as your connector

## How Geolocation Works in MCP Apps

The server requests iframe permissions via `_meta.ui.permissions`:

```typescript
const uiMeta = {
  ui: {
    permissions: ["geolocation"],  // Request geolocation access
    csp: { ... }
  }
};
```

The UI then uses the standard browser Geolocation API:
```typescript
navigator.geolocation.getCurrentPosition(...)
```

## Project Structure

```
├── server.ts       # MCP server with geolocation tools
├── main.ts         # Server entry point
├── mcp-app.html    # UI with CesiumJS globe
├── src/mcp-app.ts  # Geolocation + map logic
└── package.json
```

## Requirements

- Node.js 18+ or Bun
- Claude Pro/Max/Team/Enterprise (for custom connectors)
- Browser with geolocation support

## Resources

- [MCP Apps Documentation](https://modelcontextprotocol.io/docs/extensions/apps)
- [CesiumJS](https://cesium.com/platform/cesiumjs/)
- [map-server example](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/map-server)
