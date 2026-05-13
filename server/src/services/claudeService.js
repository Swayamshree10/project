// claudeService.js — handles all AI calls via NVIDIA NIM (OpenAI-compatible API)
const OpenAI = require('openai')

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function callClaude(messages, systemPrompt, maxTokens = 1000) {
  const formatted = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    })),
  ]

  const response = await client.chat.completions.create({
    model: 'meta/llama-3.1-8b-instruct',
    messages: formatted,
    max_tokens: maxTokens,
    temperature: 0.2,
  })

  return response.choices[0].message.content
}

module.exports = { callClaude }
