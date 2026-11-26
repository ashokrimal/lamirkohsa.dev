# Working notes for this repository

## Commit and push after checks

After a change's checks pass, commit it and push it to the current branch
without waiting to be asked. Do not leave verified work uncommitted.

The checks for this project are:

```
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build   # when routes, the proxy, config or metadata change
```

`pnpm` is not on `PATH`; use `corepack pnpm`. Run these from the repository
root. `lint` currently reports warnings only — a change must not add errors.
