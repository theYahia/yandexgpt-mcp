const API_BASE = "https://llm.api.cloud.yandex.net/foundationModels/v1";
const TIMEOUT = 30_000;
const MAX_RETRIES = 3;

function getHeaders(): Record<string, string> {
  const apiKey = process.env.YANDEXGPT_API_KEY ?? process.env.YANDEX_API_KEY;
  const iamToken = process.env.YANDEXGPT_IAM_TOKEN;

  if (!apiKey && !iamToken) {
    throw new Error(
      "Требуется YANDEXGPT_API_KEY или YANDEXGPT_IAM_TOKEN. " +
      "Задайте одну из переменных окружения."
    );
  }

  const auth = iamToken
    ? `Bearer ${iamToken}`
    : `Api-Key ${apiKey}`;

  return {
    Authorization: auth,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function getFolderId(): string {
  const folderId = process.env.YANDEXGPT_FOLDER_ID ?? process.env.YANDEX_FOLDER_ID;
  if (!folderId) throw new Error("YANDEXGPT_FOLDER_ID не задан");
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

export async function yandexGet(url: string): Promise<unknown> {
  const apiKey = process.env.YANDEXGPT_API_KEY ?? process.env.YANDEX_API_KEY;
  const iamToken = process.env.YANDEXGPT_IAM_TOKEN;
  const auth = iamToken ? `Bearer ${iamToken}` : `Api-Key ${apiKey}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: auth, Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`YandexGPT HTTP ${response.status}: ${text || response.statusText}`);
  }
  return response.json();
}
