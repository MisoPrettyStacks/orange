import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { SettingsPanel } from "./components/SettingsPanel";
import { Markdown } from "./components/Markdown";
import { streamForecast } from "./lib/openRouterClient";
import {
  deleteForecast,
  getApiKey,
  getModel,
  getWebSearchEnabled,
  listForecasts,
  saveForecast,
  type Forecast,
} from "./lib/storage";

export default function App() {
  const [forecasts, setForecasts] = useState<Forecast[]>(() => listForecasts());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [liveText, setLiveText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const activeForecast = activeId ? forecasts.find((f) => f.id === activeId) : null;
  const displayedText = isStreaming ? liveText : activeForecast?.analysis ?? liveText;

  function handleNew() {
    setActiveId(null);
    setQuestion("");
    setLiveText("");
    setError(null);
  }

  function handleSelect(id: string) {
    setActiveId(id);
    setLiveText("");
    setError(null);
    setIsStreaming(false);
  }

  function handleDelete(id: string) {
    deleteForecast(id);
    const remaining = listForecasts();
    setForecasts(remaining);
    if (activeId === id) handleNew();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError("Add your OpenRouter API key in Settings before generating a forecast.");
      setShowSettings(true);
      return;
    }

    setActiveId(null);
    setLiveText("");
    setError(null);
    setIsStreaming(true);

    const model = getModel();
    const webSearch = getWebSearchEnabled();

    await streamForecast(
      { apiKey, model, question: trimmed, webSearch },
      {
        onTextDelta: (chunk) => setLiveText((prev) => prev + chunk),
        onDone: (fullText) => {
          setIsStreaming(false);
          if (!fullText) return;
          const record: Forecast = {
            id: crypto.randomUUID(),
            question: trimmed,
            analysis: fullText,
            model,
            createdAt: new Date().toISOString(),
          };
          saveForecast(record);
          setForecasts(listForecasts());
          setActiveId(record.id);
        },
        onError: (message) => {
          setIsStreaming(false);
          setError(message);
        },
      },
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-ink">
      <Sidebar
        forecasts={forecasts}
        activeId={activeId}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onNew={handleNew}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="border-b-4 border-ink p-5">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide">
            Ask a specific, resolvable question
          </label>
          <div className="flex gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Will the Fed cut rates at its next meeting?"
              className="flex-1 border-2 border-ink px-3 py-2 font-mono text-sm outline-none focus:border-magenta"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={isStreaming || !question.trim()}
              className="border-2 border-ink bg-magenta px-5 py-2 text-sm font-extrabold uppercase text-white shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isStreaming ? "Forecasting…" : "Generate"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-magenta">{error}</p>}
        </form>

        <div className="flex-1 overflow-y-auto p-6">
          {!displayedText && !isStreaming && (
            <div className="mx-auto max-w-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
              Ask a question above to generate a structured, evidence-aware forecast — or pick a
              past one from the sidebar.
            </div>
          )}
          {displayedText && (
            <div className="mx-auto max-w-3xl border-2 border-ink bg-white p-6 shadow-hard">
              <Markdown content={displayedText} />
              {isStreaming && <span className="animate-pulse text-magenta">▌</span>}
            </div>
          )}
        </div>
      </main>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
