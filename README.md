# MCP App Demo

A simple interactive MCP App that demonstrates rendering UI inside Claude conversations.

Based on the [official MCP Apps example](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/basic-server-vanillajs).

## What This Does

When you ask Claude to "get the time", this app:
1. Returns the current server time
2. Renders an **interactive UI** directly in the chat window
3. Lets you click buttons to refresh the time, send messages, etc.

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

2. Copy the generated URL (e.g., `https://xxx.trycloudflare.com`)

3. Go to **claude.ai** → Profile → **Settings** → **Connectors**

4. Click **Add custom connector**, enter:
   - Name: `Time App`
   - URL: `https://xxx.trycloudflare.com/mcp`

5. Start a new chat and ask: "What time is it?" or "Get the current time"

## For Replit/Glitch Deployment

These platforms can run the full Node.js server:

1. Import from GitHub
2. Run `npm start`
3. Use the generated public URL as your MCP connector

## Project Structure

```
├── server.ts       # MCP server with tool + resource registration
├── main.ts         # Server entry point (HTTP transport)
├── mcp-app.html    # UI entry point
├── src/
│   ├── mcp-app.ts  # UI logic (MCP Apps SDK)
│   ├── global.css  # Base styles
│   └── mcp-app.css # App styles
├── vite.config.ts  # Bundles UI into single HTML
└── package.json
```

## Requirements

- Node.js 18+ or Bun
- Claude Pro/Max/Team/Enterprise (for custom connectors)

## Resources

- [MCP Apps Documentation](https://modelcontextprotocol.io/docs/extensions/apps)
- [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps)
