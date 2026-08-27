chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Chat GPT Quickly] Background received message', message.type);
  if (message.type !== 'chat') return;

  requestGeminiApi(message.apiKey, message.messages)
    .then((reply) => {
      console.log('[Chat GPT Quickly] Sending reply to widget');
      sendResponse({ ok: true, reply });
    })
    .catch((error) => {
      console.error('[Chat GPT Quickly] Request failed', error);
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});

async function requestGeminiApi(apiKey, messages) {
  const model = 'gemini-2.5-flash';
  console.log('[Chat GPT Quickly] Calling Gemini API', {
    messageCount: messages.length,
    model
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
  const response = await fetch(endpoint, {
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7 }
    }),
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    method: 'POST'
  });
  const data = await response.json();
  console.log('[Chat GPT Quickly] Gemini response', response.status, data);
  if (!response.ok) {
    const error = new Error(data.error?.message || 'Gemini API request failed.');
    error.code = data.error?.status || 'gemini_api_error';
    throw error;
  }
  const reply = data.candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || '')
    .join('\n');
  return reply || 'Gemini khong tra ve noi dung.';
}