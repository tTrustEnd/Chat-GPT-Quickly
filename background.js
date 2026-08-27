chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Chat GPT Quickly] Background received message', message.type);
  if (message.type !== 'chat') return;

  requestResponsesApi(message.apiKey, message.messages)
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

async function requestResponsesApi(apiKey, messages) {
  console.log('[Chat GPT Quickly] Calling OpenAI Responses API', {
    messageCount: messages.length,
    model: 'gpt-5'
  });

  const response = await fetch('https://api.openai.com/v1/responses', {
    body: JSON.stringify({
      model: 'gpt-5',
      input: messages
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });
  const data = await response.json();
  console.log('[Chat GPT Quickly] OpenAI response', response.status, data);
  if (!response.ok) {
    const error = new Error(data.error?.message || 'OpenAI API request failed.');
    error.code = data.error?.code || 'openai_api_error';
    throw error;
  }
  const reply = data.output
    ?.flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n');
  return reply || 'GPT khong tra ve noi dung.';
}