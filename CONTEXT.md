# Context

A glossary of the domain language used in Otter Blocks. Terms here are canonical — code, docs, and discussions should use them consistently.

## AI

### AI Backend

The Otter setting (`themeisle_otter_ai_backend`) determining which infrastructure executes AI prompts. One of:

- `auto` — prefer the WordPress AI Client when a usable Connector exists, otherwise fall back to the Otter Key.
- `wp-ai-client` — force the WordPress AI Client.
- `openai-key` — force the legacy direct-OpenAI path using the Otter Key.

### Effective Backend

The backend actually used for a given request, after resolving the AI Backend setting against runtime availability (WordPress version, configured Connectors, presence of an Otter Key). Distinct from the setting itself: a forced `wp-ai-client` may still resolve to the legacy path (see Fallback Warning).

### Connector

WordPress 7.0 core concept: a registered connection to an external service whose credentials are managed centrally under Settings → Connectors. Not an Otter concept — Otter only consumes it.

### Provider

A php-ai-client implementation for a specific AI vendor (e.g. `openai`, `anthropic`, `google`), shipped as a separate plugin and registered with the WordPress AI Client's provider registry. A Provider is *usable* when its Connector has credentials configured.

### Otter Key

The legacy OpenAI API key stored by Otter itself in the `themeisle_open_ai_api_key` option, used by the direct-OpenAI path. Predates WordPress Connectors.

### Embedded Prompt

A prompt template fetched from the ThemeIsle templates-cloud server, expressed in OpenAI chat-completions format (`messages`, optionally `functions`/`function_call` for forced-JSON output). The user's input is interpolated into it before sending.

### Fallback Warning

The notice shown in the Otter dashboard (Integrations tab) when the AI Backend is forced to `wp-ai-client` but no Provider is usable, causing the Effective Backend to fall back to the Otter Key. Live state, not a dismissed flag — it disappears once a Connector is configured.
