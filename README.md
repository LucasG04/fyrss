# FY RSS

**FY RSS** (For You RSS) is a minimalistic, self-hosted RSS feed aggregator.

| Folder | Description |
| --- | --- |
| [`server/`](server) | Go REST API that fetches and stores feeds and articles in PostgreSQL |
| [`web/`](web) | Angular (SSR) frontend |

Self-hosting guide and architecture: [wiki](https://github.com/LucasG04/fyrss/wiki).

## Development

```sh
docker compose up -d                          # PostgreSQL on :5432
cd server && go run ./cmd/fyrss-server        # API on :8080 (reads .env.dev)
cd web && npm ci && npm start                 # UI on :4200, proxies /api to :8080
```

Or open `fyrss.code-workspace` in VS Code.
