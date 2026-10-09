---
'@mastra/schema-compat': minor
---

Fixed OpenAI tools losing their schema constraints. String lengths, patterns, number ranges, array lengths and supported string formats such as `email` and `uuid` are now sent to OpenAI models as schema constraints that OpenAI enforces, instead of being rewritten into the field description. Other providers and OpenAI-compatible servers are unchanged.

Added a `keepEnforcedConstraints` option to `prepareJsonSchemaForOpenAIStrictMode` for the same behavior when preparing a structured output schema.

```ts
import { prepareJsonSchemaForOpenAIStrictMode } from '@mastra/schema-compat';

const schema = prepareJsonSchemaForOpenAIStrictMode(jsonSchema, { keepEnforcedConstraints: true });
```
