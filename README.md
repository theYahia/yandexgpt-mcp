# @theyahia/yandexgpt-mcp

MCP-сервер для Yandex GPT API -- completion, chat, embeddings, tokenization, models. **6 инструментов.**

[![npm](https://img.shields.io/npm/v/@theyahia/yandexgpt-mcp)](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Возможности

- 6 инструментов: completion, async_completion, chat, tokenize, embeddings, models
- Авторизация: API Key (`YANDEXGPT_API_KEY`) **или** IAM Token (`YANDEXGPT_IAM_TOKEN`)
- Транспорт: Stdio (по умолчанию) и Streamable HTTP (`--http`)
- Retry с экспоненциальным backoff (429 / 5xx)
- Vitest тесты

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "yandexgpt": {
      "command": "npx",
      "args": ["-y", "@theyahia/yandexgpt-mcp"],
      "env": {
        "YANDEXGPT_API_KEY": "your-api-key",
        "YANDEXGPT_FOLDER_ID": "your-folder-id"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add yandexgpt \
  -e YANDEXGPT_API_KEY=your-api-key \
  -e YANDEXGPT_FOLDER_ID=your-folder-id \
  -- npx -y @theyahia/yandexgpt-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "yandexgpt": {
      "command": "npx",
      "args": ["-y", "@theyahia/yandexgpt-mcp"],
      "env": {
        "YANDEXGPT_API_KEY": "your-api-key",
        "YANDEXGPT_FOLDER_ID": "your-folder-id"
      }
    }
  }
}
```

### Streamable HTTP

```bash
npx @theyahia/yandexgpt-mcp --http --port=3000
# Endpoint: http://localhost:3000/mcp
# Health:   http://localhost:3000/health
```

### Smithery

Используйте `smithery.yaml` для автоматической настройки через [Smithery](https://smithery.ai).

## Переменные окружения

| Переменная | Обязательна | Описание |
|-----------|-------------|----------|
| `YANDEXGPT_FOLDER_ID` | Да | ID каталога в Yandex Cloud |
| `YANDEXGPT_API_KEY` | Одна из двух | API-ключ сервисного аккаунта |
| `YANDEXGPT_IAM_TOKEN` | Одна из двух | IAM-токен (альтернатива API-ключу) |

> Также поддерживаются legacy-имена `YANDEX_API_KEY` и `YANDEX_FOLDER_ID`.

## Инструменты (6)

| Инструмент | Описание |
|------------|----------|
| `completion` | Синхронная генерация текста через YandexGPT |
| `async_completion` | Асинхронная генерация, возвращает ID операции |
| `chat` | Чат с YandexGPT, возвращает только текст ответа |
| `tokenize` | Токенизация текста моделью YandexGPT |
| `embeddings` | Эмбеддинги текста (text-search-doc / text-search-query) |
| `models` | Список доступных моделей с URI |

## Skills

| Команда | Описание |
|---------|----------|
| `/yandexgpt-generate <запрос>` | Сгенерируй текст через YandexGPT |
| `/yandexgpt-summarize <текст>` | Суммаризируй текст через YandexGPT |

## Модели

| Модель | URI-префикс | Описание |
|--------|-------------|----------|
| `yandexgpt-lite` | `gpt://` | Быстрая и дешевая |
| `yandexgpt` | `gpt://` | Основная модель |
| `yandexgpt-32k` | `gpt://` | Контекст 32k токенов |
| `summarization` | `gpt://` | Суммаризация |
| `text-search-doc` | `emb://` | Эмбеддинги для документов |
| `text-search-query` | `emb://` | Эмбеддинги для поисковых запросов |

## Примеры

```
Сгенерируй текст через YandexGPT: "Напиши стихотворение о весне"
Запусти асинхронную генерацию для длинного текста
Токенизируй текст "Привет, мир!"
Получи эмбеддинг для текста "машинное обучение"
Покажи список доступных моделей
```

## Разработка

```bash
npm install
npm run dev          # stdio
npm run dev:http     # HTTP на :3000
npm test             # vitest
```

## API Reference

Base URL: `https://llm.api.cloud.yandex.net/foundationModels/v1/`

- `POST /completion` -- синхронная генерация
- `POST /completionAsync` -- асинхронная генерация
- `POST /tokenize` -- токенизация
- `POST /textEmbedding` -- эмбеддинги

[Документация Yandex Cloud](https://cloud.yandex.ru/docs/foundation-models/)

## Лицензия

MIT
