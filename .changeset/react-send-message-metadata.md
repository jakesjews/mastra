---
'@mastra/react': minor
---

Added a `metadata` option to `sendMessage` from `useChat`. The metadata is stored on the user message, so a chat UI can tag a message when it is sent and read the tag back when rendering it.

```tsx
const { sendMessage } = useChat({ agentId: 'weather-agent', threadId });

await sendMessage({
  message: 'Summarize this thread',
  threadId,
  metadata: { source: 'quick-action' },
});
```

The metadata applies to messages sent through thread signals.
