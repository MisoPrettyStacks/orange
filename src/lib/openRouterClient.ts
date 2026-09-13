// Calls OpenRouter directly from the browser using the visitor's own
// OpenRouter API key. OpenRouter is OpenAI-compatible and, unlike a raw
// Anthropic key, has a genuinely zero-cost option: the `openrouter/free`
// router auto-selects from OpenRouter's pool of free models (falling back
// between them automatically), or you can pin a specific `...:free` model
// slug. There is no server here — the key goes straight from the user's
// browser to openrouter.ai.
//
// Docs: https://openrouter.ai/docs/guides/routing/routers/free-router
//       https://openrouter.ai/docs/api-reference/streaming

import { SYSTEM_PROMPT } from "./systemPrompt";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface StreamCallbacks {
  onTextDelta: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (message: string) => void;
}

export interface StreamOptions {
  apiKey: string;
  model: string;
  question: string;
  webSearch: boolean;
}

export async function streamForecast(
  { apiKey, model, question, webSearch }: StreamOptions,
  cb: StreamCallbacks,
): Promise<void> {
  if (!apiKey) {
    cb.onError("No OpenRouter API key set. Add one in Settings first.");
    return;
  }

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        // Optional, but OpenRouter recommends these for rate-limit fairness
        // and so the app shows up correctly if you check your usage dashboard.
        "HTTP-Referer": window.location.origin,
        "X-Title": "Superforecaster Engine",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        // The "web" plugin (Exa-backed search) is a paid add-on, billed by
        // OpenRouter separately from the model itself — only attach it if
        // the user opted in from Settings, so the app is $0 by default.
        ...(webSearch ? { plugins: [{ id: "web" }] } : {}),
      }),
    });
  } catch {
    cb.onError(
      "Network request to OpenRouter failed. Check your connection, or that your browser isn't blocking cross-origin requests.",
    );
    return;
  }

  if (!response.ok || !response.body) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.message ?? "";
    } catch {
      // ignore parse failure, fall back to status text
    }
    cb.onError(`OpenRouter API error (${response.status}): ${detail || response.statusText}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        // OpenRouter sends ": OPENROUTER PROCESSING" style comment lines as
        // keep-alives while a request is queued — anything not prefixed
        // with "data:" is not an actual event and should be ignored.
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        if (payload === "[DONE]") {
          cb.onDone(fullText);
          return;
        }

        let event: any;
        try {
          event = JSON.parse(payload);
        } catch {
          continue;
        }

        if (event.error) {
          cb.onError(event.error.message ?? "Unknown OpenRouter error.");
          return;
        }

        const delta = event.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          fullText += delta;
          cb.onTextDelta(delta);
        }
      }
    }
  } catch {
    cb.onError("The connection to OpenRouter dropped mid-stream. Try again.");
    return;
  }

  cb.onDone(fullText);
}
