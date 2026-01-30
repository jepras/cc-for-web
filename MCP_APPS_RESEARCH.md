# MCP Apps Research: Creating Interactive Apps for Mobile Testing

## Executive Summary

Anthropic launched **MCP Apps** on January 26, 2026 - an extension to the Model Context Protocol that allows interactive UI components (dashboards, forms, visualizations) to render directly within AI chat windows. This research investigates whether we can create an interactive app and test it on a phone.

**Key Finding:** MCP Apps are currently available on **web and desktop only**. Claude mobile apps support remote MCP servers for tools/prompts/resources, but the interactive UI rendering capability has not been announced for mobile yet.

---

## What Are MCP Apps?

MCP Apps (SEP-1865) is the first official extension to the Model Context Protocol. Instead of returning plain text, MCP tools can now return interactive HTML interfaces that render in sandboxed iframes within the chat conversation.

### Key Capabilities
- **Data Exploration**: Interactive dashboards with filtering and export
- **Configuration Wizards**: Forms with dependent fields and conditional options
- **Document Review**: Inline PDFs with highlighted sections
- **Real-time Monitoring**: Live-updating metrics without re-executing tools

### Technical Architecture
1. **Tools with UI metadata**: Tools include a `_meta.ui.resourceUri` field referencing a UI resource
2. **UI Resources**: Server-side resources via the `ui://` scheme containing bundled HTML/JavaScript
3. **Bidirectional Communication**: JSON-RPC over postMessage between UI and host

---

## Current Availability

### Supported Platforms
| Platform | MCP Apps Support | Status |
|----------|-----------------|--------|
| Claude Web | Yes | Available now |
| Claude Desktop | Yes | Available now |
| Claude Mobile (iOS/Android) | **Not confirmed** | Only remote MCP tools, no interactive UI |
| ChatGPT | Yes | Launching soon |
| VS Code Insiders | Yes | Available now |
| Goose | Yes | Available now |

### Plan Requirements
- Pro, Max, Team, and Enterprise plans
- **Not available** on the free tier

### Launch Partner Integrations
- Amplitude, Asana, Box, Canva, Clay, Figma, Hex, monday.com, Slack
- Salesforce (coming soon via Agentforce 360)

---

## Mobile Testing Options

### Option 1: Claude Mobile with Remote MCP (Limited)
Claude mobile apps (iOS/Android) support **remote MCP servers** since July 2025, but this is for tools, prompts, and resources - **not** the interactive UI rendering.

**Setup Process:**
1. Go to claude.ai → Settings → Connectors → Add Custom Connector
2. Enter your remote MCP server name and URL
3. Settings auto-sync to mobile, desktop, and web

**Limitations:**
- Cannot add new servers directly from mobile app
- Only remote MCP (no local scripts)
- Interactive UI components **do not render** on mobile (text-only responses)

### Option 2: Test via Web Browser on Phone
Since MCP Apps work on Claude web (claude.ai), you can:
1. Build your MCP App
2. Deploy it as a remote MCP server
3. Access claude.ai through your phone's mobile browser
4. Test the interactive UI through the web interface

This is likely the **best current option** for mobile testing.

### Option 3: Mobile Automation MCP Servers
For testing mobile app automation (different from MCP Apps UI):

**mobile-mcp (mobile-next)**
- MCP server for iOS/Android automation
- Works with emulators, simulators, and real devices
- Uses accessibility trees for interactions
- GitHub: https://github.com/mobile-next/mobile-mcp

**PhonePi MCP**
- Connect AI models to mobile devices
- 100% local processing
- Android app available, iOS in development
- Website: https://www.phonepimcp.com/

**claude-in-mobile**
- Android (via ADB), iOS Simulator (via simctl)
- Desktop automation via Compose Multiplatform
- GitHub: https://github.com/AlexGladkov/claude-in-mobile

---

## Building an MCP App

### SDK Installation
```bash
npm install -S @modelcontextprotocol/ext-apps
```

### Packages Available
- `@modelcontextprotocol/ext-apps` - Core SDK for app developers
- `@modelcontextprotocol/ext-apps/react` - React hooks
- `@modelcontextprotocol/ext-apps/app-bridge` - For host developers
- `@mcp-ui/client` - React components for rendering MCP Apps

### Basic Example
```javascript
import { App } from "@modelcontextprotocol/ext-apps";

const app = new App();
await app.connect();

// Handle tool results
app.ontoolresult = (result) => {
  renderChart(result.data);
};

// Call server tools
const response = await app.callServerTool({
  name: "fetch_details",
  arguments: { id: "123" },
});

// Update model context
await app.updateModelContext({
  content: [{ type: "text", text: "User selected option B" }],
});
```

### MCP Server Tool Registration
Tools must include a `_meta` key pointing to the UI resource:
```javascript
{
  name: "show_dashboard",
  description: "Display an interactive dashboard",
  _meta: {
    ui: {
      resourceUri: "ui://my-dashboard"
    }
  }
}
```

### Testing Locally
```bash
# Using MCPJam inspector
npx @mcpjam/inspector@latest

# Or using basic-host reference implementation
git clone https://github.com/modelcontextprotocol/ext-apps
cd ext-apps
npm install && npm start
# Open http://localhost:8080/
```

---

## Recommended Approach for Your Project

### For Interactive UI Testing on Phone:

1. **Build your MCP App** using the `@modelcontextprotocol/ext-apps` SDK
2. **Deploy as a remote MCP server** (e.g., on a cloud provider)
3. **Test via Claude web on mobile browser** - this will render the interactive UI
4. **Wait for native mobile support** - Anthropic may add MCP Apps to Claude mobile apps in future updates

### Starter Templates Available
The ext-apps repository includes templates for:
- React, Vue, Svelte, Preact, Solid, Vanilla JS

### Example Servers to Study
- `threejs-server` - 3D visualization
- `map-server` - Interactive maps
- `pdf-server` - Document viewing
- `system-monitor-server` - Real-time dashboards

---

## Sources

- [MCP Apps Official Blog Post](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)
- [MCP Apps GitHub Repository](https://github.com/modelcontextprotocol/ext-apps)
- [TechCrunch: Anthropic launches interactive Claude apps](https://techcrunch.com/2026/01/26/anthropic-launches-interactive-claude-apps-including-slack-and-other-workplace-tools/)
- [The Register: Claude supports MCP Apps](https://www.theregister.com/2026/01/26/claude_mcp_apps_arrives/)
- [How to Set Up Remote MCP on Claude Mobile](https://dev.to/zhizhiarv/how-to-set-up-remote-mcp-on-claude-iosandroid-mobile-apps-3ce3)
- [Mobile-MCP GitHub](https://github.com/mobile-next/mobile-mcp)
- [MCPJam Tutorial](https://www.mcpjam.com/blog/mcp-apps-example)
- [Interactive Tools in Claude](https://claude.com/blog/interactive-tools-in-claude)
- [MCP-UI SDK](https://mcpui.dev/)

---

## Conclusion

**Can we create an interactive app?** Yes! MCP Apps SDK allows building interactive UIs with React, Vue, or other frameworks.

**Can we test it on a phone?**
- **Native Claude mobile app**: Not yet - only supports remote MCP tools without interactive UI rendering
- **Mobile web browser**: Yes - access claude.ai on your phone's browser to see the interactive UI
- **Mobile automation**: Separate MCP servers exist for automating iOS/Android devices

The recommended path is to build your MCP App, deploy it remotely, and test via the Claude web interface on your mobile browser until native mobile app support is added.
