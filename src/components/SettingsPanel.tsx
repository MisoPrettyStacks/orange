import { useState } from "react";
import {
  DEFAULT_MODEL,
  getApiKey,
  getModel,
  getWebSearchEnabled,
  setApiKey,
  setModel,
  setWebSearchEnabled,
} from "../lib/storage";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [key, setKey] = useState(getApiKey());
  const [model, setModelState] = useState(getModel());
  const [search, setSearch] = useState(getWebSearchEnabled());
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setApiKey(key);
    setModel(model);
    setWebSearchEnabled(search);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md border-4 border-ink bg-white shadow-hard">
        <div className="flex items-center justify-between bg-ink px-4 py-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-lime">Settings</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-magenta"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide">
              OpenRouter API key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full border-2 border-ink px-3 py-2 font-mono text-sm outline-none focus:border-magenta"
            />
            <p className="mt-1 text-xs text-gray-500">
              Stored only in this browser's localStorage. Never sent anywhere except directly to
              openrouter.ai. Get a free key at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                openrouter.ai/keys
              </a>
              — no card required to use the free models below.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModelState(e.target.value)}
              placeholder={DEFAULT_MODEL}
              className="w-full border-2 border-ink px-3 py-2 font-mono text-sm outline-none focus:border-magenta"
            />
            <p className="mt-1 text-xs text-gray-500">
              Defaults to <code>{DEFAULT_MODEL}</code>, OpenRouter's zero-cost router — it
              auto-picks from free models and falls back automatically if one is busy. To pin a
              specific free model instead, use its exact slug ending in{" "}
              <code>:free</code> (e.g. <code>meta-llama/llama-3.3-70b-instruct:free</code>) — see
              the current list at{" "}
              <a
                href="https://openrouter.ai/models?max_price=0"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                openrouter.ai/models
              </a>
              .
            </p>
          </div>
          <div>
            <label className="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                checked={search}
                onChange={(e) => setSearch(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-bold uppercase tracking-wide">Enable live web search</span>
                <br />
                <span className="text-gray-500">
                  Adds OpenRouter's search plugin so forecasts can check current facts. This is{" "}
                  <strong className="text-magenta">not free</strong> — OpenRouter bills it
                  separately, per search. Leave unchecked to keep this app at $0.
                </span>
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSave}
              className="border-2 border-ink bg-lime px-4 py-2 text-sm font-extrabold uppercase shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Save
            </button>
            {saved && <span className="text-xs font-bold text-green-600">Saved ✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
