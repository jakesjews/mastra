---
'@mastra/react': patch
---

Fixed tool call arguments staying empty in `useChat` while the model is still writing them. Tool invocations in the `partial-call` state now expose the arguments received so far, so a UI can show a tool call filling in as it streams.
