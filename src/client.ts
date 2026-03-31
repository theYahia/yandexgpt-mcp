const API_BASE = "https://llm.api.cloud.yandex.net/foundationModels/v1";
const TIMEOUT = 30_000;
const MAX_RETRIES = 3;

function getHeaders(): Record<string, string> {
  const apiKey = process.env.YANDEX_API_KEY;
  if (!apiKey) throw new Error("YANDEX_API_KEY не задан");
  return {
    "Authorization": `Api-Key ${apiKey}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

export function getFolderId(): string {
  const folderId = process.env.YANDEX_FOLDER_ID;
  if (!folderId) throw new Error("YANDEX_FOLDER_ID не задан");
  return folderId;
}

export async function yandexPost(path: string, body: unknown): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[yandexgpt-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text().catch(() => "");
      throw new Error(`YandexGPT HTTP ${response.status}: ${text || response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[yandexgpt-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("YandexGPT: все попытки исчерпаны");
}
