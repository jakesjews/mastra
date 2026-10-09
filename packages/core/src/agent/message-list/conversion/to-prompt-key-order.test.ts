import { describe, expect, it } from 'vitest';

import { MessageList } from '../message-list';
import { aiV5ModelMessageToV2PromptMessage } from './to-prompt';

/**
 * Rebuild a JSON value with the keys of every object reversed, standing in for a
 * storage round trip that does not preserve key order (e.g. PostgreSQL `jsonb`).
 */
function reverseKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(reverseKeys) as T;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .reverse()
      .map(([key, nested]) => [key, reverseKeys(nested)]),
  ) as T;
}

const args = { query: 'weather in Paris', limit: 5, filters: { units: 'metric', days: [3, 1, 2] } };
const result = { forecast: [{ day: 3, high: 21, low: 12 }], source: 'weather-api', cached: false };

describe('aiV5ModelMessageToV2PromptMessage key order', () => {
  it('serializes a tool-call input the same way regardless of its key order', () => {
    const toPrompt = (input: unknown) =>
      aiV5ModelMessageToV2PromptMessage({
        role: 'assistant',
        content: [{ type: 'tool-call', toolCallId: 'call-1', toolName: 'search', input }],
      });

    expect(JSON.stringify(toPrompt(reverseKeys(args)))).toBe(JSON.stringify(toPrompt(args)));
  });

  it.each(['json', 'error-json'] as const)(
    'serializes a %s tool result the same way regardless of its key order',
    type => {
      const toPrompt = (value: typeof result) =>
        aiV5ModelMessageToV2PromptMessage({
          role: 'tool',
          content: [{ type: 'tool-result', toolCallId: 'call-1', toolName: 'search', output: { type, value } }],
        });

      expect(JSON.stringify(toPrompt(reverseKeys(result)))).toBe(JSON.stringify(toPrompt(result)));
    },
  );

  it('keeps array order and values intact', () => {
    const message = aiV5ModelMessageToV2PromptMessage({
      role: 'assistant',
      content: [{ type: 'tool-call', toolCallId: 'call-1', toolName: 'search', input: args }],
    });

    expect(message.content[0]).toMatchObject({ input: args });
    expect((message.content[0] as { input: typeof args }).input.filters.days).toEqual([3, 1, 2]);
  });

  it('builds the same tool payloads from a message list restored with reordered keys', async () => {
    const list = new MessageList({ threadId: 'thread-1' });
    list.add({ role: 'user', content: 'What is the weather in Paris?' }, 'input');
    list.add(
      {
        id: 'assistant-1',
        role: 'assistant',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        content: {
          format: 2,
          parts: [
            {
              type: 'tool-invocation',
              toolInvocation: { state: 'result', toolCallId: 'call-1', toolName: 'search', args, result },
            },
          ],
        },
      },
      'response',
    );

    const restored = new MessageList({ threadId: 'thread-1' }).deserialize(
      reverseKeys(JSON.parse(JSON.stringify(list.serialize()))),
    );

    const toolPayloads = async (messageList: MessageList) =>
      (await messageList.get.all.aiV5.llmPrompt()).flatMap(message =>
        typeof message.content === 'string'
          ? []
          : message.content.flatMap(part =>
              part.type === 'tool-call'
                ? [JSON.stringify(part.input)]
                : part.type === 'tool-result'
                  ? [JSON.stringify(part.output)]
                  : [],
            ),
      );

    const original = await toolPayloads(list);
    expect(original).toHaveLength(2);
    expect(await toolPayloads(restored)).toEqual(original);
  });
});
