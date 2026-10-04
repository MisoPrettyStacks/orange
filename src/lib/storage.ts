// Everything here lives in the visitor's own browser (localStorage).
// There is no server and no database — that's what makes free, static
// GitHub Pages hosting possible. Nothing the user types ever leaves
// their machine except the direct call to OpenRouter's API.

export interface Forecast {
  id: string;
  question: string;
  analysis: string;
  model: string;
  createdAt: string; // ISO timestamp
}

const HISTORY_KEY = "forecast-engine.history.v1";
const API_KEY_KEY = "forecast-engine.openRouterApiKey.v1";
const MODEL_KEY = "forecast-engine.model.v1";
const SEARCH_KEY = "forecast-engine.webSearch.v1";

// openrouter/free is OpenRouter's zero-cost router: it auto-selects from
// their pool of free models, with automatic fallback if one is rate
// limited or down. Pin a specific "...:free" model slug in Settings
// instead if you want a consistent model rather than the auto-router.
export const DEFAULT_MODEL = "openrouter/free";

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) ?? "";
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_KEY, key.trim());
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_KEY);
}

export function getModel(): string {
  return localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL;
}

export function setModel(model: string) {
  localStorage.setItem(MODEL_KEY, model.trim() || DEFAULT_MODEL);
}

// Off by default so the app is genuinely $0 out of the box — OpenRouter's
// "web" search plugin is billed separately from the (free) model itself.
export function getWebSearchEnabled(): boolean {
  return localStorage.getItem(SEARCH_KEY) === "true";
}

export function setWebSearchEnabled(enabled: boolean) {
  localStorage.setItem(SEARCH_KEY, String(enabled));
}

export function listForecasts(): Forecast[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Forecast[];
    return parsed.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return [];
  }
}

export function saveForecast(forecast: Forecast) {
  const all = listForecasts();
  all.unshift(forecast);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}

export function deleteForecast(id: string) {
  const all = listForecasts().filter((f) => f.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}

export function getForecast(id: string): Forecast | undefined {
  return listForecasts().find((f) => f.id === id);
}
