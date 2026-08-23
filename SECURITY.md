# Security Policy

## Scope

This repository owns the ModForge plugin, workshop UI, player-authored draft handling, draft persistence, path validation, ZIP construction, session-test refusal, and development preview server.

A vulnerability in those components belongs to `neo-angband-mod-forge`.

The core `neo-angband` repository owns mod loading, capability enforcement, archive extraction and installation, content-only session loading, save and reload behavior, and the general mod trust model. A vulnerability in those components belongs to core. See the [core security policy](https://github.com/neostryder/neo-angband/blob/master/SECURITY.md).

## Reporting a vulnerability

Do not open a public issue for an undisclosed vulnerability.

Send a private report to **strider-angband (at) rpgm.tools**. Identify `neo-angband-mod-forge`, the affected tag or commit, the input or draft involved, reproduction steps, and the expected impact.

Reports about ordinary workshop behavior that has no security impact belong in the public issue tracker.
