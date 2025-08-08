### Notes/conventions

• IDs: use uuid or cuid strings; don’t leak DB types into entities.
• Normalization: do it in mappers/validators before constructing entities (lowercase, trim, collapse spaces).
• Behavior: tiny, business‑relevant helpers only (e.g., includesYear, revoke, qualityScore). Keep persistence concerns out.
• Extensibility:
• Add Account (owner) to ApiKey later without breaking callers.
• Add region‑specific aliasing by extending CarAlias (e.g., market?: 'US'|'EU'|'JP').
• Add perspective VO to Sound if you later split interior/exterior/trackside.

If you want the value objects too (Make, Model, YearRange, EngineCode) I can swap these primitives out and show the VO-based versions side‑by‑side.

### Wiring tips (so this compiles first try)

• In each module’s providers, bind your ports to adapters via tokens or direct interfaces (Nest uses class tokens fine if there’s 1 impl).
• Inject use cases in controllers; not repositories directly.
• Start with in‑memory cache/storage adapters if you don’t want AWS/Redis on day 1; the interfaces won’t change.

If you want, I can generate the provider arrays for each module (AuthModule, CatalogModule, EngineToneModule) with the correct DI graph so you can paste them in and run.
