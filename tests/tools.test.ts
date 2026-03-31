import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleCompletion, completionSchema } from "../src/tools/completion.js";
import { handleTokenize, tokenizeSchema } from "../src/tools/tokenize.js";
import { handleEmbeddings, embeddingsSchema } from "../src/tools/embeddings.js";
import { handleModels } from "../src/tools/models.js";
import { handleChat, chatSchema } from "../src/tools/chat.js";

describe("tools", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.YANDEXGPT_API_KEY = "test-key";
    process.env.YANDEXGPT_FOLDER_ID = "b1g12345";
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  describe("completion", () => {
    it("validates schema", () => {
      const result = completionSchema.safeParse({
        messages: [{ role: "user", text: "Hello" }],
      });
      expect(result.success).toBe(true);
    });

    it("calls API and returns JSON", async () => {
      const mockResult = {
        result: {
          alternatives: [{ message: { role: "assistant", text: "Hi" }, status: "ALTERNATIVE_STATUS_FINAL" }],
          usage: { inputTextTokens: "5", completionTokens: "1", totalTokens: "6" },
          modelVersion: "1.0",
        },
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const text = await handleCompletion({
        model: "yandexgpt-lite",
        messages: [{ role: "user", text: "Hello" }],
        maxTokens: 100,
      });
      expect(JSON.parse(text)).toEqual(mockResult);
    });
  });

  describe("tokenize", () => {
    it("validates schema", () => {
      const result = tokenizeSchema.safeParse({ text: "Привет" });
      expect(result.success).toBe(true);
    });

    it("calls tokenize endpoint", async () => {
      const mockResult = {
        tokens: [{ id: "1", text: "При" }, { id: "2", text: "вет" }],
        modelVersion: "1.0",
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const text = await handleTokenize({ model: "yandexgpt-lite", text: "Привет" });
      const parsed = JSON.parse(text);
      expect(parsed.tokens).toHaveLength(2);
    });
  });

  describe("embeddings", () => {
    it("validates schema", () => {
      const result = embeddingsSchema.safeParse({ text: "Hello" });
      expect(result.success).toBe(true);
    });

    it("calls textEmbedding endpoint", async () => {
      const mockResult = { embedding: [0.1, 0.2, 0.3] };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const text = await handleEmbeddings({
        model: "text-search-doc",
        text: "Hello",
      });
      const parsed = JSON.parse(text);
      expect(parsed.embedding).toEqual([0.1, 0.2, 0.3]);

      const call = vi.mocked(globalThis.fetch).mock.calls[0];
      expect(call[0]).toContain("/textEmbedding");
    });
  });

  describe("models", () => {
    it("returns known models list", async () => {
      const text = await handleModels();
      const parsed = JSON.parse(text);
      expect(parsed.models.length).toBeGreaterThanOrEqual(4);
      expect(parsed.folderId).toBe("b1g12345");
      const ids = parsed.models.map((m: { id: string }) => m.id);
      expect(ids).toContain("yandexgpt-lite");
      expect(ids).toContain("yandexgpt");
      expect(ids).toContain("text-search-doc");
    });
  });

  describe("chat", () => {
    it("validates schema", () => {
      const result = chatSchema.safeParse({
        messages: [{ role: "user", text: "Hi" }],
      });
      expect(result.success).toBe(true);
    });

    it("returns assistant text only", async () => {
      const mockResult = {
        result: {
          alternatives: [
            { message: { role: "assistant", text: "Привет!" }, status: "ALTERNATIVE_STATUS_FINAL" },
          ],
          usage: { inputTextTokens: "1", completionTokens: "1", totalTokens: "2" },
        },
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResult), { status: 200 }),
      );

      const text = await handleChat({
        model: "yandexgpt-lite",
        messages: [{ role: "user", text: "Hi" }],
        maxTokens: 100,
      });
      expect(text).toBe("Привет!");
    });
  });
});
