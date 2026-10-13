---
'@mastra/core': patch
---

Fixed structured output with OpenAI models losing its schema constraints. String lengths, patterns, number ranges and array lengths are now sent to OpenAI as schema constraints that it enforces, instead of being rewritten into the field description. Fine-tuned OpenAI models and OpenAI-compatible providers are unchanged.
