# Skill: Create MCP Apps

Create interactive UI applications that render inside Claude and other MCP-enabled AI clients.

## What Are MCP Apps?

MCP Apps extend the Model Context Protocol to allow tools to return interactive HTML interfaces (dashboards, forms, visualizations) that render directly in the chat conversation, not just text responses.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Claude.ai (Host)                                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Chat Conversation                                 │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │ Interactive UI (sandboxed iframe)           │  │  │
│  │  │  - Rendered from ui:// resource             │  │  │
│  │  │  - Communicates via postMessage             │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ MCP Protocol (HTTP)
                          ▼
┌─────────────────────────────────────────────────────────┐
│ MCP Server                                              │
│  - Registers tools with _meta.ui.resourceUri            │
│  - Serves bundled HTML via ui:// resources              │
│  - Handles tool calls from UI                           │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
my-mcp-app/
├── server.ts        # MCP server: tools + resources
├── main.ts          # Entry point: HTTP transport
├── mcp-app.html     # UI entry point
├── src/
│   └── mcp-app.ts   # UI logic (MCP Apps SDK)
├── vite.config.ts   # Bundles UI to single HTML
├── tsconfig.json
└── package.json
```

## Key Concepts

### 1. Tool with UI Metadata

Tools declare a UI resource via `_meta.ui.resourceUri`:

```typescript
registerAppTool(server, "my-tool", {
  title: "My Tool",
  description: "Does something with interactive UI",
  inputSchema: {},
  _meta: { ui: { resourceUri: "ui://my-app/mcp-app.html" } }
}, async () => {
  return {
    content: [{ type: "text", text: "result" }],
    structuredContent: { data: "for UI" }
  };
});
```

### 2. UI Resource

Serve bundled HTML when the host requests the UI:

```typescript
registerAppResource(server, resourceUri, resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile("dist/mcp-app.html", "utf-8");
    return { contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }] };
  }
);
```

### 3. UI App (Client-Side)

The UI uses the MCP Apps SDK to communicate with the host:

```typescript
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "My App", version: "1.0.0" });

// Handle tool result from host
app.ontoolresult = (result) => {
  const data = result.structuredContent;
  renderUI(data);
};

// Call tools on the server
button.onclick = async () => {
  const result = await app.callServerTool({ name: "my-tool", arguments: {} });
};

// Connect to host
app.connect();
```

## Dependencies

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

## Build & Run

```bash
# Build UI (bundles to single HTML file)
cross-env INPUT=mcp-app.html vite build

# Start server
bun main.ts  # or: npx tsx main.ts

# Server runs at http://localhost:3001/mcp
```

## Testing with Claude

1. Expose local server: `npx cloudflared tunnel --url http://localhost:3001`
2. Add as custom connector in Claude settings
3. Ask Claude to use the tool

## Key SDK Functions

| Function | Purpose |
|----------|---------|
| `registerAppTool()` | Register tool with UI metadata |
| `registerAppResource()` | Serve UI HTML |
| `app.connect()` | Connect UI to host |
| `app.ontoolresult` | Handle initial tool result |
| `app.callServerTool()` | Call MCP tools from UI |
| `app.sendMessage()` | Send message to chat |
| `app.openLink()` | Request host to open URL |
| `applyDocumentTheme()` | Match host's theme |

## Resources

- [MCP Apps Docs](https://modelcontextprotocol.io/docs/extensions/apps)
- [ext-apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- [API Reference](https://modelcontextprotocol.github.io/ext-apps/api/)
- [Examples](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples)
