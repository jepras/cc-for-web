# Todo MCP App

A simple interactive todo list built with MCP Apps - demonstrates how to create interactive UIs that render inside AI chat windows.

## What This Is

This is a **proof of concept** for MCP Apps, Anthropic's new extension that allows interactive UI components to render directly in Claude conversations.

## Project Structure

```
mcp-app/
├── server.ts          # Local dev server (express + full MCP Apps SDK)
├── api/mcp.ts         # Vercel serverless function (basic MCP tools)
├── mcp-app.html       # UI entry point
├── src/mcp-app.ts     # UI logic (connects to MCP host)
├── vercel.json        # Vercel config
└── package.json
```

## Two Deployment Options

### Option 1: Local Development (Full MCP Apps UI)

This uses the full MCP Apps SDK with interactive UI support.

```bash
# Install dependencies
npm install

# Build the UI and start the server
npm run dev

# Server runs at http://localhost:3001/mcp
```

To test with Claude.ai, expose your local server:
```bash
# In a separate terminal
npx cloudflared tunnel --url http://localhost:3001
```

Copy the generated URL (e.g., `https://random-name.trycloudflare.com`) and add it as a custom connector in Claude.

### Option 2: Vercel Deployment (Basic MCP Tools)

This deploys to Vercel using `mcp-handler`. Note: This version provides basic MCP tools but the interactive UI rendering may have limited support on remote servers.

```bash
# Deploy to Vercel
vercel

# Or link and deploy
vercel --prod
```

Your MCP endpoint will be: `https://your-app.vercel.app/api/mcp`

## Testing on Claude.ai

1. Go to [claude.ai](https://claude.ai)
2. Click your profile → **Settings** → **Connectors**
3. Click **Add custom connector**
4. Enter:
   - Name: `Todo App`
   - URL: Your server URL + `/mcp` (e.g., `https://xxx.trycloudflare.com/mcp`)
5. Start a new chat and ask: "Show me my todo list"

## Available Tools

| Tool | Description |
|------|-------------|
| `show-todos` | Shows the interactive todo list UI |
| `add-todo` | Adds a new todo item |
| `toggle-todo` | Toggles completion status |
| `remove-todo` | Removes a todo item |

## Requirements

- Node.js 18+
- Claude Pro/Max/Team/Enterprise plan (for custom connectors)

## Important Notes

1. **MCP Apps UI** (the interactive iframe) is a new feature (Jan 2026). Support varies by client.
2. **Vercel cold starts** will reset the in-memory todo list.
3. For persistent storage, you'd need to add a database (Redis, Postgres, etc.)

## Resources

- [MCP Apps Documentation](https://modelcontextprotocol.io/docs/extensions/apps)
- [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- [Vercel MCP Deployment](https://vercel.com/docs/mcp/deploy-mcp-servers-to-vercel)
