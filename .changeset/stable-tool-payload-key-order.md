---
'@mastra/core': patch
---

Fixed provider prompt caches missing after an agent resumes from storage. Tool call arguments and tool results are now sent to the model with a consistent key order, so a request rebuilt from a store that reorders object keys, such as PostgreSQL, matches the one sent before the run was suspended.
