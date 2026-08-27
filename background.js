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
  console.info('[Chat GPT Quickly] OpenAI response', response.status);
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