# BizzOne Digital — Lead Form

Standalone lead-capture form with:
- Service dropdown (all BizzOne services)
- Dual submission: **GoHighLevel webhook** + **ClickUp task**
- Live **Google Reviews** from Google Places API
- Dark neon theme matching BizzOne Digital branding

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in your keys
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `CLICKUP_TOKEN` | Optional | ClickUp Personal API Token (pk_...) |
| `CLICKUP_LIST_ID` | Optional | ClickUp List ID for tasks |
| `CLICKUP_STATUS` | Optional | Task status (default: "not started") |
| `GOOGLE_PLACES_API_KEY` | Optional | Google Places API key |
| `GOOGLE_PLACE_ID` | Optional | Your Google Place ID |

GoHighLevel webhook URL is hardcoded in `src/app/api/lead/route.ts`.

## Deploy

Works on any Node.js hosting (Vercel, Railway, etc.):
```bash
npm run build
npm start
```
