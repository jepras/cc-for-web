// server.ts - Simple Todo MCP App Server
console.log("Starting Todo MCP App server...");

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppTool,
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";

// In-memory todo storage
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

let todos: Todo[] = [
  { id: "1", text: "Try out MCP Apps", completed: false },
  { id: "2", text: "Test on Claude.ai", completed: false },
];

const server = new McpServer({
  name: "Todo MCP App Server",
  version: "1.0.0",
});

const resourceUri = "ui://todo-app/mcp-app.html";

// Register the main tool that shows the todo app
registerAppTool(
  server,
  "show-todos",
  {
    title: "Show Todo List",
    description: "Shows an interactive todo list where you can add, complete, and remove tasks.",
    inputSchema: {},
    _meta: { ui: { resourceUri } },
  },
  async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(todos) }],
    };
  },
);

// Tool to add a todo
registerAppTool(
  server,
  "add-todo",
  {
    title: "Add Todo",
    description: "Adds a new todo item to the list.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The todo text" },
      },
      required: ["text"],
    },
    _meta: { ui: { resourceUri } },
  },
  async ({ text }: { text: string }) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    todos.push(newTodo);
    return {
      content: [{ type: "text", text: JSON.stringify(todos) }],
    };
  },
);

// Tool to toggle todo completion
registerAppTool(
  server,
  "toggle-todo",
  {
    title: "Toggle Todo",
    description: "Toggles the completion status of a todo item.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The todo ID to toggle" },
      },
      required: ["id"],
    },
    _meta: { ui: { resourceUri } },
  },
  async ({ id }: { id: string }) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(todos) }],
    };
  },
);

// Tool to remove a todo
registerAppTool(
  server,
  "remove-todo",
  {
    title: "Remove Todo",
    description: "Removes a todo item from the list.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The todo ID to remove" },
      },
      required: ["id"],
    },
    _meta: { ui: { resourceUri } },
  },
  async ({ id }: { id: string }) => {
    todos = todos.filter((t) => t.id !== id);
    return {
      content: [{ type: "text", text: JSON.stringify(todos) }],
    };
  },
);

// Register the UI resource
registerAppResource(
  server,
  resourceUri,
  resourceUri,
  { mimeType: RESOURCE_MIME_TYPE },
  async () => {
    const html = await fs.readFile(
      path.join(import.meta.dirname, "dist", "mcp-app.html"),
      "utf-8",
    );
    return {
      contents: [
        { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
      ],
    };
  },
);

// Expose the MCP server over HTTP
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

expressApp.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// Health check endpoint
expressApp.get("/", (req, res) => {
  res.json({ status: "ok", message: "Todo MCP App Server is running" });
});

const PORT = process.env.PORT || 3001;
expressApp.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}/mcp`);
});
