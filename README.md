# @theyahia/yandexgpt-mcp

MCP-сервер для Yandex GPT API — генерация текста, асинхронная генерация, токенизация. **3 инструмента.**

[![npm](https://img.shields.io/npm/v/@theyahia/yandexgpt-mcp)](https://www.npmjs.com/package/@theyahia/yandexgpt-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "yandexgpt": {
      "command": "npx",
      "args": ["-y", "@theyahia/yandexgpt-mcp"],
      "env": { "YANDEX_API_KEY": "your-api-key", "YANDEX_FOLDER_ID": "your-folder-id" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add yandexgpt -e YANDEX_API_KEY=your-api-key -e YANDEX_FOLDER_ID=your-folder-id -- npx -y @theyahia/yandexgpt-mcp
```

### VS Code / Cursor

```json
{ "servers": { "yandexgpt": { "command": "npx", "args": ["-y", "@theyahia/yandexgpt-mcp"], "env": { "YANDEX_API_KEY": "your-api-key", "YANDEX_FOLDER_ID": "your-folder-id" } } } }
```

> Требуется `YANDEX_API_KEY` и `YANDEX_FOLDER_ID`. Получите в [консоли Yandex Cloud](https://console.cloud.yandex.ru/).

## Инструменты (3)

| Инструмент | Описание |
|------------|----------|
| `completion` | Синхронная генерация текста через YandexGPT |
| `async_completion` | Асинхронная генерация, возвращает ID операции |
| `tokenize` | Токенизация текста моделью YandexGPT |

## Примеры

```
Сгенерируй текст через YandexGPT: "Напиши стихотворение о весне"
Запусти асинхронную генерацию для длинного текста
Токенизируй текст "Привет, мир!"
```

## Лицензия

MIT
