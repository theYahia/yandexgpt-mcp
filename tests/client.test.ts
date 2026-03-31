import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getFolderId, yandexPost } from "../src/client.js";

describe("client", () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env.YANDEXGPT_API_KEY = "test-api-key";
    process.env.YANDEXGPT_FOLDER_ID = "test-folder";
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.restoreAllMocks();
  });

  describe("getFolderId", () => {
    it("returns YANDEXGPT_FOLDER_ID", () => {
      expect(getFolderId()).toBe("test-folder");
    });

    it("falls back to YANDEX_FOLDER_ID", () => {
      delete process.env.YANDEXGPT_FOLDER_ID;
      process.env.YANDEX_FOLDER_ID = "legacy-folder";
      expect(getFolderId()).toBe("legacy-folder");
    });

    it("throws when no folder ID", () => {
      delete process.env.YANDEXGPT_FOLDER_ID;
      delete process.env.YANDEX_FOLDER_ID;
      expect(() => getFolderId()).toThrow("YANDEXGPT_FOLDER_ID не задан");
    });
  });

  describe("yandexPost", () => {
    it("sends correct auth header with API Key", async () => {
      const mockResponse = { result: "ok" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      const result = await yandexPost("/test", { data: 1 });
      expect(result).toEqual(mockResponse);

      const call = vi.mocked(globalThis.fetch).mock.calls[0];
      const headers = call[1]?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Api-Key test-api-key");
    });

    it("sends Bearer token with IAM", async () => {
      delete process.env.YANDEXGPT_API_KEY;
      delete process.env.YANDEX_API_KEY;
      process.env.YANDEXGPT_IAM_TOKEN = "iam-token-123";

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("{}", { status: 200 }),
      );

      await yandexPost("/test", {});
      const call = vi.mocked(globalThis.fetch).mock.calls[0];
      const headers = call[1]?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer iam-token-123");
    });

    it("throws when no auth credentials", async () => {
      delete process.env.YANDEXGPT_API_KEY;
      delete process.env.YANDEX_API_KEY;
      delete process.env.YANDEXGPT_IAM_TOKEN;

      await expect(yandexPost("/test", {})).rejects.toThrow("YANDEXGPT_API_KEY");
    });

    it("retries on 429", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(
        new Response("rate limited", { status: 429 }),
      );
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

      const result = await yandexPost("/test", {});
      expect(result).toEqual({ ok: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("retries on 500", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValueOnce(
        new Response("error", { status: 500 }),
      );
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

      const result = await yandexPost("/test", {});
      expect(result).toEqual({ ok: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it("throws on 4xx (non-429)", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("bad request", { status: 400 }),
      );

      await expect(yandexPost("/test", {})).rejects.toThrow("400");
    });
  });
});
