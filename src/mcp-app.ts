// src/mcp-app.ts - Todo App UI Logic
import { App } from "@modelcontextprotocol/ext-apps";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const todoListEl = document.getElementById("todo-list")!;
const newTodoInput = document.getElementById("new-todo") as HTMLInputElement;
const addBtn = document.getElementById("add-btn")!;

// Initialize the MCP App
const app = new App({ name: "Todo App", version: "1.0.0" });

// Current todos state
let todos: Todo[] = [];

// Render the todo list
function renderTodos() {
  if (todos.length === 0) {
    todoListEl.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
    return;
  }

  todoListEl.innerHTML = todos
    .map(
      (todo) => `
      <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""} />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn">Delete</button>
      </li>
    `
    )
    .join("");

  // Add event listeners
  todoListEl.querySelectorAll(".todo-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", handleToggle);
  });

  todoListEl.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Parse todos from tool result
function parseTodos(result: any): Todo[] {
  try {
    const text = result.content?.find((c: any) => c.type === "text")?.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (e) {
    console.error("Failed to parse todos:", e);
  }
  return [];
}

// Handle initial tool result from host
app.ontoolresult = (result) => {
  todos = parseTodos(result);
  renderTodos();
};

// Handle adding a new todo
async function handleAdd() {
  const text = newTodoInput.value.trim();
  if (!text) return;

  newTodoInput.value = "";
  newTodoInput.disabled = true;
  addBtn.textContent = "Adding...";

  try {
    const result = await app.callServerTool({
      name: "add-todo",
      arguments: { text },
    });
    todos = parseTodos(result);
    renderTodos();
  } catch (e) {
    console.error("Failed to add todo:", e);
  } finally {
    newTodoInput.disabled = false;
    addBtn.textContent = "Add";
    newTodoInput.focus();
  }
}

// Handle toggling a todo
async function handleToggle(e: Event) {
  const checkbox = e.target as HTMLInputElement;
  const todoItem = checkbox.closest(".todo-item") as HTMLElement;
  const id = todoItem.dataset.id!;

  checkbox.disabled = true;

  try {
    const result = await app.callServerTool({
      name: "toggle-todo",
      arguments: { id },
    });
    todos = parseTodos(result);
    renderTodos();
  } catch (e) {
    console.error("Failed to toggle todo:", e);
    checkbox.disabled = false;
  }
}

// Handle deleting a todo
async function handleDelete(e: Event) {
  const btn = e.target as HTMLButtonElement;
  const todoItem = btn.closest(".todo-item") as HTMLElement;
  const id = todoItem.dataset.id!;

  btn.disabled = true;
  btn.textContent = "...";

  try {
    const result = await app.callServerTool({
      name: "remove-todo",
      arguments: { id },
    });
    todos = parseTodos(result);
    renderTodos();
  } catch (e) {
    console.error("Failed to delete todo:", e);
    btn.disabled = false;
    btn.textContent = "Delete";
  }
}

// Set up event listeners
addBtn.addEventListener("click", handleAdd);
newTodoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleAdd();
  }
});

// Connect to the host
app.connect();
