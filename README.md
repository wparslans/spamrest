# SpamRest — AppSumo Redemption & Setup Site

A static site (GitHub Pages ready) that:

- Shows the **Step 1 / Step 2** AppSumo Partner Portal setup panel, with the Webhook & OAuth URLs **auto-generated from the site's own address** (deploy anywhere — the URLs update themselves).
- Hosts the **OAuth Redirect / redemption landing page** that buyers reach after redeeming their AppSumo code.
- Serves **JSON verification endpoints** so AppSumo's `GET → 200` checks pass directly on GitHub Pages.

## ⚠️ Important: what GitHub Pages can and cannot do

GitHub Pages is **static** — it only answers `GET`.

| AppSumo requirement | Method | Works on GitHub Pages? |
|--------------------|--------|------------------------|
| OAuth Redirect URL validation | `GET → 200` | ✅ Yes |
| Redemption landing (`?code=…`) | `GET` | ✅ Yes (token exchange must run on a backend) |
| Webhook URL validation | `POST → 200 + JSON` | ❌ **No** — Pages returns `405` to POST |

**The webhook must point at a backend.** Use the included Cloudflare Worker snippet (on the page), a Netlify/Vercel function, or your existing WordPress REST route (`/wp-json/ess/v1/appsumo/webhook`). Everything else runs on Pages.

> 🔒 **Never commit secrets.** Client Secret and API Key are entered into in-browser fields only — they are never stored, transmitted, or written to this repo.

## Files

```
index.html              Setup panel (Step 1 / Step 2) + live endpoint checks
appsumo/oauth/index.html OAuth redirect / redemption landing (handles ?code, ?license_key)
appsumo/webhook/         GET → {"event":"purchase","success":true}
appsumo/webhook.json     Same JSON with a .json content-type
appsumo/verify.json      Health endpoint
styles.css  app.js  .nojekyll
```

## Endpoints (once deployed at `https://<you>.github.io/<repo>`)

| URL | Purpose |
|-----|---------|
| `/appsumo/oauth` | OAuth Redirect URL — paste into Partner Portal |
| `/appsumo/webhook` | GET verification JSON (POST needs a backend) |
| `/appsumo/verify.json` | Health check |

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "SpamRest AppSumo redemption & setup site"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then **Settings → Pages → Deploy from a branch → `main` / root**. Live in ~1 minute at
`https://<you>.github.io/<repo>/`. The setup panel will show that exact domain in the URLs automatically.

## Connecting the redemption flow to your backend

The OAuth code exchange needs your `client_secret`, so it must run server-side. On the redemption page set where the code should be sent:

```html
<script>window.SPAMREST_EXCHANGE_URL = "https://your-backend.example.com/appsumo/exchange";</script>
```

or pass `?return_to=` on the redirect. The page forwards the single-use `?code=` there to finish activation.
