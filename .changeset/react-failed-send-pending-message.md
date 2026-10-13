---
'@mastra/react': patch
---

Fixed `useChat` leaving a pending user message in the list when sending fails. The optimistic message is now removed when `sendMessage` rejects, so the chat no longer shows a message that never reached the agent.
