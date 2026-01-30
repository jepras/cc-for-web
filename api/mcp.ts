// api/mcp.ts - Vercel Serverless Function for MCP Server
import { z } from "zod";
import { createMcpHandler } from "mcp-handler";

// In-memory todo storage (note: resets on cold starts in serverless)
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Using global to persist across warm function invocations
declare global {
  var todos: Todo[] | undefined;
}

if (!global.todos) {
  global.todos = [
    { id: "1", text: "Try out MCP Apps", completed: false },
    { id: "2", text: "Test on Claude.ai", completed: false },
  ];
}

const handler = createMcpHandler(
  (server) => {
    // Show todos tool
    server.tool(
      "show-todos",
      "Shows the current todo list",
      {},
      async () => {
        return {
          content: [{ type: "text", text: JSON.stringify(global.todos) }],
        };
      }
    );

    // Add todo tool
    server.tool(
      "add-todo",
      "Adds a new todo item",
      { text: z.string().describe("The todo text") },
      async ({ text }) => {
        const newTodo: Todo = {
          id: Date.now().toString(),
          text,
          completed: false,
        };
        global.todos!.push(newTodo);
        return {
          content: [{ type: "text", text: JSON.stringify(global.todos) }],
        };
      }
    );

    // Toggle todo tool
    server.tool(
      "toggle-todo",
      "Toggles completion status of a todo",
      { id: z.string().describe("The todo ID to toggle") },
      async ({ id }) => {
        const todo = global.todos!.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
        return {
          content: [{ type: "text", text: JSON.stringify(global.todos) }],
        };
      }
    );

    // Remove todo tool
    server.tool(
      "remove-todo",
      "Removes a todo item",
      { id: z.string().describe("The todo ID to remove") },
      async ({ id }) => {
        global.todos = global.todos!.filter((t) => t.id !== id);
        return {
          content: [{ type: "text", text: JSON.stringify(global.todos) }],
        };
      }
    );
  },
  {},
  { basePath: "/api" }
);

export { handler as GET, handler as POST, handler as DELETE };
