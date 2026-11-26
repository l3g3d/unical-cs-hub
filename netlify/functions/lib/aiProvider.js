// Modular AI Provider Abstraction for UNICAL CS HUB
// Currently wired to Google AI Studio (Gemini free tier models with native function calling).
// Can be swapped to another AI provider (e.g. Groq/OpenAI-compatible) by adding an adapter here.

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
];

/**
 * Normalizes conversation history into Gemini's contents format.
 * Preserves structured parts if already formatted, or wraps plain strings cleanly.
 */
export function buildGeminiContents(history = [], currentUserText) {
  const contents = [];

  for (const msg of history) {
    if (!msg) continue;
    const role = msg.role === 'model' || msg.sender === 'assistant' ? 'model' : 'user';
    const text = (msg.text || '').trim();
    if (!text) continue;

    // Gemini requires alternating or valid user/model turns; merge consecutive same-role entries safely
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts.push({ text });
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  if (currentUserText) {
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push({ text: currentUserText });
    } else {
      contents.push({ role: 'user', parts: [{ text: currentUserText }] });
    }
  }

  // Gemini expects first message in contents to be 'user'
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  return contents;
}

/**
 * Calls Google Gemini API (v1beta) with native function calling tools.
 * Supports automatic model failover on 404/429/503 transient/deprecated errors.
 */
export async function callGeminiWithTools({
  apiKey,
  systemPrompt,
  contents,
  toolDeclarations,
  preferredModel,
  timeoutMs = 8500,
}) {
  if (!apiKey || !apiKey.trim()) {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Netlify Environment Variables or save it in Admin Dashboard -> Email & AI Engine.'
    );
    err.code = 'AI_CONFIG_MISSING';
    throw err;
  }

  const candidateModels = preferredModel
    ? [preferredModel, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== preferredModel)]
    : DEFAULT_GEMINI_MODELS;

  let lastError = null;

  for (const model of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey.trim()
    )}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const bodyPayload = {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
        },
      };

      if (Array.isArray(toolDeclarations) && toolDeclarations.length > 0) {
        bodyPayload.tools = [{ functionDeclarations: toolDeclarations }];
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        let errMessage = `Gemini API HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(errBody);
          errMessage = parsed?.error?.message || errMessage;
        } catch {}

        // Invalid API key / bad request -> do not mask behind retry
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          const authErr = new Error(`Gemini authentication/request error (${response.status}): ${errMessage}`);
          authErr.code = 'AI_AUTH_ERROR';
          authErr.status = response.status;
          throw authErr;
        }

        // Model unavailable / quota / overloaded -> try next fallback model
        lastError = new Error(`[${model}] ${errMessage}`);
        lastError.status = response.status;
        continue;
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      return {
        modelUsed: model,
        parts,
        finishReason: candidate?.finishReason || 'STOP',
      };
    } catch (err) {
      clearTimeout(timer);
      if (err.code === 'AI_AUTH_ERROR') {
        throw err;
      }
      lastError = err.name === 'AbortError'
        ? new Error(`[${model}] Request timed out after ${timeoutMs}ms`)
        : err;
    }
  }

  const finalErr = lastError || new Error('All configured Gemini models failed to respond.');
  finalErr.code = 'AI_UPSTREAM_ERROR';
  throw finalErr;
}

/**
 * Modular provider router. Allows switching AI_PROVIDER without changing tool execution code.
 */
export async function generateAssistantTurn(options) {
  const provider = (process.env.AI_PROVIDER || options.provider || 'gemini').toLowerCase();
  switch (provider) {
    case 'gemini':
    default:
      return callGeminiWithTools(options);
  }
}
