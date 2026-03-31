#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { completionSchema, handleCompletion } from "./tools/completion.js";
import {
  asyncCompletionSchema,
  handleAsyncCompletion,
} from "./tools/async-completion.js";
import { tokenizeSchema, handleTokenize } from "./tools/tokenize.js";
import { embeddingsSchema, handleEmbeddings } from "./tools/embeddings.js";
import { modelsSchema, handleModels } from "./tools/models.js";
import { chatSchema, handleChat } from "./tools/chat.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "yandexgpt-mcp",
    version: "1.1.0",
  });

  // ---- Tools (6) ----

  server.tool(
    "completion",
    "Генерация текста через YandexGPT. Синхронный запрос с ожиданием ответа.",
    completionSchema.shape,
    async (params) => ({
      content: [{ type: "text" as const, text: await handleCompletion(params) }],
    }),
  );

  server.tool(
    "async_completion",
    "Асинхронная генерация текста через YandexGPT. Возвращает ID операции для проверки статуса.",
    asyncCompletionSchema.shape,
    async (params) => ({
      content: [{ type: "text" as const, text: await handleAsyncCompletion(params) }],
    }),
  );

  server.tool(
    "tokenize",
    "Токенизация текста моделью YandexGPT. Возвращает список токенов.",
    tokenizeSchema.shape,
    async (params) => ({
      content: [{ type: "text" as const, text: await handleTokenize(params) }],
    }),
  );

  server.tool(
    "embeddings",
    "Получение эмбеддингов текста через YandexGPT. Модели text-search-doc / text-search-query.",
    embeddingsSchema.shape,
    async (params) => ({
      content: [{ type: "text" as const, text: await handleEmbeddings(params) }],
    }),
  );

  server.tool(
    "models",
    "Список доступных моделей YandexGPT с URI для использования в других инструментах.",
    modelsSchema.shape,
    async () => ({
      content: [{ type: "text" as const, text: await handleModels() }],
    }),
  );

  server.tool(
    "chat",
    "Чат с YandexGPT. Возвращает только текст ответа ассистента (удобно для агентов).",
    chatSchema.shape,
    async (params) => ({
      content: [{ type: "text" as const, text: await handleChat(params) }],
    }),
  );

  return server;
}

// ---- Transport ----

async function main() {
  const server = createServer();
  const useHttp = process.argv.includes("--http");
  const port = parseInt(
    process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] ?? "3000",
    10,
  );

  if (useHttp) {
    const { StreamableHTTPServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    const { createServer: createHttpServer } = await import("node:http");

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    await server.connect(transport);

    const httpServer = createHttpServer(async (req, res) => {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);

      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: 6 }));
        return;
      }

      if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
        // Collect body for POST/DELETE
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", async () => {
          // Attach parsed body for the transport
          const rawBody = Buffer.concat(chunks).toString();
          if (rawBody) {
            try {
              (req as any).body = JSON.parse(rawBody);
            } catch {
              (req as any).body = undefined;
            }
          }
          try {
            await transport.handleRequest(req, res, (req as any).body);
          } catch (err) {
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: String(err) }));
            }
          }
        });
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    });

    httpServer.listen(port, () => {
      console.error(
        `[yandexgpt-mcp] HTTP-сервер запущен на http://localhost:${port}/mcp  (6 инструментов)`,
      );
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      "[yandexgpt-mcp] Stdio-сервер запущен. 6 инструментов. " +
        "Требуется YANDEXGPT_API_KEY (или YANDEXGPT_IAM_TOKEN) и YANDEXGPT_FOLDER_ID.",
    );
  }
}

main().catch((error) => {
  console.error("[yandexgpt-mcp] Ошибка:", error);
  process.exit(1);
});
