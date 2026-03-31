#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { completionSchema, handleCompletion } from "./tools/completion.js";
import { asyncCompletionSchema, handleAsyncCompletion } from "./tools/async-completion.js";
import { tokenizeSchema, handleTokenize } from "./tools/tokenize.js";

const server = new McpServer({
  name: "yandexgpt-mcp",
  version: "1.0.0",
});

server.tool(
  "completion",
  "Генерация текста через YandexGPT. Синхронный запрос с ожиданием ответа.",
  completionSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleCompletion(params) }] }),
);

server.tool(
  "async_completion",
  "Асинхронная генерация текста через YandexGPT. Возвращает ID операции для проверки статуса.",
  asyncCompletionSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleAsyncCompletion(params) }] }),
);

server.tool(
  "tokenize",
  "Токенизация текста моделью YandexGPT. Возвращает список токенов.",
  tokenizeSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleTokenize(params) }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[yandexgpt-mcp] Сервер запущен. 3 инструмента. Требуется YANDEX_API_KEY и YANDEX_FOLDER_ID.");
}

main().catch((error) => {
  console.error("[yandexgpt-mcp] Ошибка:", error);
  process.exit(1);
});
