import { z } from "zod";
import { getFolderId } from "../client.js";

export const modelsSchema = z.object({});

const KNOWN_MODELS = [
  { id: "yandexgpt-lite", description: "Легкая модель YandexGPT, быстрая и дешёвая" },
  { id: "yandexgpt", description: "Основная модель YandexGPT" },
  { id: "yandexgpt-32k", description: "YandexGPT с контекстом 32k токенов" },
  { id: "summarization", description: "Модель для суммаризации текста" },
  { id: "text-search-doc", description: "Эмбеддинг-модель для документов" },
  { id: "text-search-query", description: "Эмбеддинг-модель для поисковых запросов" },
];

export async function handleModels(): Promise<string> {
  const folderId = getFolderId();
  const models = KNOWN_MODELS.map(m => ({
    ...m,
    uri: m.id.startsWith("text-search")
      ? `emb://${folderId}/${m.id}/latest`
      : `gpt://${folderId}/${m.id}/latest`,
  }));
  return JSON.stringify({ models, folderId }, null, 2);
}
