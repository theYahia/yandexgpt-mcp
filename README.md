# @theyahia/yandexgpt-mcp

MCP server for the Yandex GPT API — text completion, async completion, and tokenization.

## Tools

| Tool | Description |
|------|-------------|
| `completion` | Synchronous text generation via YandexGPT |
| `async_completion` | Asynchronous text generation, returns operation ID |
| `tokenize` | Tokenize text using a YandexGPT model |

## Setup

1. Get your API key at https://console.cloud.yandex.ru/
2. Set `YANDEX_API_KEY` and `YANDEX_FOLDER_ID` environment variables

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "yandexgpt": {
      "command": "npx",
      "args": ["-y", "@theyahia/yandexgpt-mcp"],
      "env": {
        "YANDEX_API_KEY": "your-api-key",
        "YANDEX_FOLDER_ID": "your-folder-id"
      }
    }
  }
}
```

## Authentication

Uses `Api-Key` header with `YANDEX_API_KEY`. The `YANDEX_FOLDER_ID` is used to construct model URIs.

## License

MIT
