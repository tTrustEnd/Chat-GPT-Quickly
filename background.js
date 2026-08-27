chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'chat') return;

  requestChatCompletion(message.apiKey, message.messages)
    .then((reply) => sendResponse({ ok: true, reply }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function requestChatCompletion(apiKey, messages) {
  console.info('[Chat GPT Quickly] Calling OpenAI API', {
    messageCount: messages.length,
    model: 'gpt-4o-mini'
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });
  const data = await response.json();
  console.info('[Chat GPT Quickly] OpenAI response', response.status);
  if (!response.ok) {
    const error = new Error(data.error?.message || 'OpenAI API request failed.');
    error.code = data.error?.code || 'openai_api_error';
    throw error;
  }
  return data.choices?.[0]?.message?.content || 'GPT khong tra ve noi dung.';
}