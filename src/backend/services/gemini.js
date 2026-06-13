import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fetchArbitrumYields } from './defiResearch.js';

dotenv.config();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function buildSystemPrompt() {
  const yields = await fetchArbitrumYields();

  const yieldSummary = yields
    .map(
      (y) =>
        `- ${y.protocol} | ${y.token} | APY: ${y.apy}% | TVL: ${y.tvlFormatted} | Risk: ${y.riskLevel.label}`
    )
    .join('\n');

  return `You are Yield Autopilot, a friendly DeFi coach for Arbitrum.
Your job is to help everyday people understand and earn yield on their crypto in plain English, no jargon.

## Current live yield opportunities on Arbitrum
${yieldSummary}

## Rules
- Explain risk before reward.
- Recommend 1-2 options max.
- Never guarantee returns.
- Never imply you can move funds without explicit user confirmation.
- Keep responses under 150 words unless the user asks for detail.`;
}

export async function chat(messages) {
  if (!genAI) {
    return buildLocalFallbackReply(messages);
  }

  try {
    const systemPrompt = await buildSystemPrompt();
    const model = genAI.getGenerativeModel({ model: modelName });

    const geminiMessages = normalizeGeminiMessages(messages);
    const session = model.startChat({
      history: geminiMessages.slice(0, -1),
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    });

    const userMessage = geminiMessages[geminiMessages.length - 1];
    const result = await session.sendMessage(userMessage.parts[0].text);

    return result.response.text();
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    return buildLocalFallbackReply(messages);
  }
}

export async function chatStream(messages, res) {
  if (!genAI) {
    const reply = await buildLocalFallbackReply(messages);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ delta: reply })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, fullText: reply })}\n\n`);
    res.end();

    return reply;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const systemPrompt = await buildSystemPrompt();
    const model = genAI.getGenerativeModel({ model: modelName });

    const geminiMessages = normalizeGeminiMessages(messages);
    const session = model.startChat({
      history: geminiMessages.slice(0, -1),
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    });

    const userMessage = geminiMessages[geminiMessages.length - 1];
    const result = await session.sendMessageStream(userMessage.parts[0].text);

    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ delta: chunkText })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
    res.end();

    return fullText;
  } catch (err) {
    console.error('Gemini stream error:', err.message);
    const reply = await buildLocalFallbackReply(messages);

    res.write(`data: ${JSON.stringify({ delta: reply })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, fullText: reply })}\n\n`);
    res.end();

    return reply;
  }
}

function normalizeGeminiMessages(messages) {
  return messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
}

async function buildLocalFallbackReply(messages) {
  const yields = await fetchArbitrumYields();
  const best = yields[0];
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  if (!best) {
    return 'I can help with Arbitrum yield options, but live yield data is unavailable right now. Check GEMINI_API_KEY and network access for full AI chat responses.';
  }

  const reason = process.env.GEMINI_API_KEY
    ? 'Gemini is currently unreachable'
    : 'GEMINI_API_KEY is not configured';

  return `I can help, but AI chat is running in local fallback mode because ${reason}. Based on current yield data, ${best.protocol} has ${best.apy}% APY on ${best.token}. Risk: ${best.riskLevel.label}. Your last message was: "${lastUserMessage.slice(0, 120)}"`;
}
