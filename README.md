#

⚠️ Personal Research Experiment Financial Disclaimer & Liability Waiver:
This is not Tool or Service: This is a private, experimental sandbox, not intended for outside or public use, replication or distribution. It is not a financial tool, software service, or product designed for public use. Not Financial Advice: The author is not a licensed financial advisor, accountant, or broker. Nothing in this repository constitutes professional financial, investment, or legal advice. No Warranties: This repository is provided "as-is" for display purposes only. The author makes no representations or warranties of any kind regarding the accuracy, completeness, or reliability of the data, code, or experimental models. Absolute Limitation of Liability: Under no circumstances shall the author be liable for any claims, damages, or financial losses (direct or indirect) if you violate these terms and attempt to use, replicate, or rely on any part of this experiment.

#  Engine


<img width="1902" height="826" alt="Expiramental forecaser" src="https://github.com/user-attachments/assets/f11e9bf1-85bd-4dfb-8055-f55cfacb6521" />




> **MISOPRETTY'S 🔮, KINDA** — an AI-powered forecasting workbench for asking specific, resolvable questions and getting a structured, evidence-aware forecast.

This is a rebuild of the original - version as a **single static site** — a React app that calls an LLM directly from the visitor's browser and keeps forecast history in `localStorage`. No server, no database, and (using the default settings) no API cost either.

### What changed from the original

| Original (-) | This version |
|---|---|
| Express API server | none — deleted |
| PostgreSQL forecast history | browser `localStorage` |
| --managed Anthropic credential | your own **OpenRouter** API key, entered once in Settings, stored only in your browser |
| Paid Claude model | `openrouter/free` — OpenRouter's zero-cost router, $0/M tokens |
| Deployed on - | static build, deployed on GitHub Pages via GitHub Actions |

The structured Tetlock-style prompt (Question Triage, CHAMP framework, Final Forecast, Key Uncertainties), live streaming, and the retro-cyberpunk terminal-zine look are preserved.

### Actually free

- **Hosting**: GitHub Pages — free for public repos.
- **Inference**: default model is `openrouter/free`, OpenRouter's router that auto-selects from its pool of $0/M-token models (with automatic fallback if one is busy). An OpenRouter account and API key are free, no card required.
- **Live web search is the one opt-in cost.** OpenRouter's search plugin is billed separately per search, so it's **off by default** — check the box in Settings only if you're fine paying for it. Without it, the model reasons from its training knowledge and flags anything it can't verify under "Key Uncertainties."

Free models do rotate and get rate-limited sometimes — if `openrouter/free` errors out, pin a specific model instead (Settings → Model), using any current `...:free` slug from [openrouter.ai/models](https://openrouter.ai/models?max_price=0).

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL, click **⚙ Settings**, and paste in a free API key from [openrouter.ai/keys](https://openrouter.ai/keys).

## Deploy to GitHub Pages (free)

1. Create a new **public** repository on GitHub (Pages' free tier requires public repos, unless you're on GitHub Pro/Team/Enterprise).
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Superforecaster Engine — static rebuild"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
4. Push (or re-run the workflow from the **Actions** tab) — `.github/workflows/deploy.yml` builds the app and publishes it automatically on every push to `main`.
5. Your site will be live at `https://<your-username>.github.io/<your-repo>/`.

No Dockerfile, no server, no database, and no secrets to configure in GitHub — the OpenRouter key lives only in each visitor's own browser, entered through the Settings panel.

## Project structure

```text
src/
  App.tsx                 Main layout: question form + streamed forecast + history
  components/
    Sidebar.tsx            Black history sidebar
    SettingsPanel.tsx       API key + model + search-toggle settings, stored in localStorage
    Markdown.tsx            Renders forecast markdown, adds header emoji + highlight pills
  lib/
    openRouterClient.ts      Direct browser → openrouter.ai streaming client
    storage.ts               localStorage-backed history (replaces Postgres)
    systemPrompt.ts           The structured superforecasting prompt
.github/workflows/deploy.yml  Free CI/CD to GitHub Pages
```

## Notes

- Current free model slugs change over time as OpenRouter onboards/retires providers — check [openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0) if `openrouter/free` ever feels inconsistent and you want to pin one specific model.
- History is per-browser, per-device — clearing browser data clears it. There's no account system and nothing syncs across devices, by design (that's what keeps this free and serverless).


Made with 💖 by: @MisoPrettyStacks

@IGotGlitterOnMe on X
