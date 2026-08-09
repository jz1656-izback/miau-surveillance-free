# 🐱 Miau Surveillance Free v5.0

> Surveillance Toolkit built by cats, made in Germany.
> 128 cameras · 11 live data layers · 7,000+ traffic cams · Jet streams

---

## Deploy

```bash
docker compose up -d     # http://localhost:5199
```

Or with Node.js 18+:
```bash
npm start                # http://localhost:5199
```

## Routes
| URL | Shows |
|-----|-------|
| `/` | Presentation landing page |
| `/surveillance` | Full surveillance dashboard |
| `/health` | Server status (JSON) |

## Dev
```bash
npm run dev              # hot reload
npm test                 # 36 tests
```
