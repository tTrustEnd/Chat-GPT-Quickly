chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'gemini-chat') return;

  port.onMessage.addListener((message) => {
    if (message.type !== 'chat') return;

    streamGeminiResponse(message.apiKey, message.messages, (text) => {
      port.postMessage({ type: 'chunk', text });
    })
      .then(() => port.postMessage({ type: 'done' }))
      .catch((error) => {
        console.error('[Chat GPT Quickly] Gemini stream failed', error);
        port.postMessage({ type: 'error', error: error.message });
      });
  });
});

async function streamGeminiResponse(apiKey, messages, onChunk) {
  const model = 'gemini-3.6-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));

  console.log('[Chat GPT Quickly] Starting Gemini stream', {
    messageCount: messages.length,
    model
  });
  const response = await fetch(endpoint, {
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7 } }),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    method: 'POST'
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || `Gemini API error (${response.status}).`);
  }
  if (!response.body) throw new Error('Trinh duyet khong ho tro streaming.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const processLine = (line) => {
    if (!line.startsWith('data:')) return;
    const data = JSON.parse(line.slice(5).trim());
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '').join('');
    if (text) onChunk(text);
  };
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.forEach(processLine);
    if (done) break;
  }
  processLine(buffer);
}