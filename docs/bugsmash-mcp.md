# BugSmash MCP sign-in

The project registers BugSmash's hosted MCP server in `.mcp.json` (Claude
Code), `.cursor/mcp.json` (Cursor) and `.vscode/mcp.json` (VS Code):

```text
https://api.bugsmash.io/mcp
```

Calling it without a session returns **401** with a `WWW-Authenticate: Bearer`
header. That is expected: the server is protected with **OAuth 2.1 + PKCE** and
scope **`mcp:use`**, not an API key. There is no token to paste into the config
files, and none should ever be committed.

## Signing in

Sign in once per client; the token is stored by the client in your user
profile, outside this repository.

1. Open the client on this repo so it reads the MCP config.
2. Trigger the OAuth flow:
   - **Claude Code** — run `/mcp`, select `bugsmash`, choose authenticate. The
     browser opens BugSmash's consent page.
   - **Cursor** — open Settings → MCP, click the `bugsmash` server, then
     "Connect"; approve access in the browser.
   - **VS Code** — run `MCP: List Servers`, select `bugsmash`, then start it;
     approve the browser prompt.
3. Sign in to BugSmash and approve the requested scope (`mcp:use`). Access
   follows your own workspace roles and plan, and the client supports dynamic
   client registration, so no client ID or secret is needed.
4. Re-run the same command; the server now lists its tools instead of 401ing.

Revoking access from your BugSmash account settings invalidates the client
token immediately.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401 unauthorized`, `Authorization is required.` | Not signed in yet | Complete the OAuth flow above |
| 401 repeats after consent | Consent was granted to a different client instance or the token was revoked | Revoke and reconnect in the client |
| Server missing from the list | Wrong config file for that client | Claude Code reads `.mcp.json`, Cursor reads `.cursor/mcp.json`, VS Code reads `.vscode/mcp.json` (`servers` key) |
| `invalid_scope` | Client requested scopes beyond `mcp:use` | Request only `mcp:use` |

## Why there is no BugSmash CI job

The MCP server above is free-plan friendly: it is interactive and OAuth-only,
so it costs nothing beyond signing in once.

Automation is different. The REST API (`https://api.bugsmash.io/api/v2`, header
`X-API-Key`) is the only thing a build can call, because CI cannot complete a
browser consent flow, and BugSmash issues API keys on paid plans only. This
repository therefore ships no BugSmash workflow; the earlier preview-review job
that used `BUGSMASH_API_KEY` and `BUGSMASH_PROJECT_ID` was removed.

If the plan changes, the call a workflow would need is
`POST /api/v2/version` with `{ "websiteUrl": <preview url>, "projectId": <uuid> }`,
expecting `{ status: true, version: { review_link } }`. Keep that key in a
GitHub secret — never in `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`
or any tracked file.
