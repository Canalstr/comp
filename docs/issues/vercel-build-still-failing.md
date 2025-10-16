# Vercel Build Still Failing (commit 5ad6e548)

## Summary

- We reverted `OnboardingStatus` to use the Trigger.dev v4 hook from `@trigger.dev/react-hooks`, but its options object still contains a `task` property.
- ESLint still reports the invalid regex `^['"]/` in `add-comment.ts`; the sanitized string manipulation hasn’t landed in the deployed bundle yet.
- Current failure is identical to previous attempts: lint aborts on the regex, and TypeScript complains about the unsupported `task` option.

## Current Behaviour vs Expected

| Area | Current | Expected |
| --- | --- | --- |
| `OnboardingStatus` | `useRun(runId, { task: onboardOrganization, refreshInterval: 1000 })` → TS error (`task` not in `CommonTriggerHookOptions`). | `useRun<typeof onboardOrganization>(runId, { refreshInterval: 1000 })` (no extra options). |
| `add-comment.ts` | Still uses the regex lint considers invalid, so `next lint` fails. | Use string trimming to remove quotes and ensure leading slash. |
| Vercel build | Stops during lint/typecheck. | Build completes, deploy succeeds. |

## Key Logs

```
ESLint: Invalid regular expression: /^['"]/: \ at end of pattern
…
Type error: Object literal may only specify known properties, and 'task' does not exist in type 'CommonTriggerHookOptions'.
```

## Code Pointers

- `apps/app/src/actions/add-comment.ts` – path normalization block still contains `.replace(/^['"]\//, …)` (lint failure).
- `apps/app/src/app/(app)/setup/go/[id]/components/onboarding-status.tsx` – imports `useRun` from `@trigger.dev/react-hooks` but passes `{ task: onboardOrganization }` in the options (type error).
- `turbo.json` – now back to the correct `tasks` key; Vercel warnings about environment variables persist (but aren’t build blockers).

## Root Cause

1. Reverting to `@trigger.dev/react-hooks` requires removal of the unsupported `task` option; branding must happen via the generic (`useRun<typeof onboardOrganization>`), not the options.
2. The sanitized string-based path logic for comments wasn’t staged/pushed alongside the last commit, so the lint error persists.

## Proposed Fix

1. Update `OnboardingStatus`:

```ts
import { useRun } from '@trigger.dev/react-hooks';

export function OnboardingStatus({ runId }: { runId: string }) {
  const { run } = useRun<typeof onboardOrganization>(runId, {
    refreshInterval: 1000,
  });
  …
}
```

2. Rewrite `add-comment` path normalization:

```ts
const rawPath = headersList.get('x-pathname') || headersList.get('referer') || '';

let path = rawPath.replace(/\/[a-z]{2}\//, '/');
if (path.startsWith('"') || path.startsWith("'")) {
  path = path.slice(1);
}
if (!path.startsWith('/')) {
  path = `/${path}`;
}
revalidatePath(path || '/');
```

3. Commit both files together and push.

## Verification Steps

```bash
cd apps/app
AUTH_SECRET=dev DATABASE_URL=file:./dev.db ANTHROPIC_API_KEY=dev \
RESEND_API_KEY=dev REVALIDATION_SECRET=dev NEXT_PUBLIC_PORTAL_URL=http://localhost:3001 \
bun run lint
bun run typecheck
bun run build
```

(Skip local checks if env setup is unreliable, but ensure CI passes.)

## Notes

- Vercel warnings about missing environment variables in `turbo.json` are informational; they existed before and can be addressed separately.
- No further changes to Trigger.dev dependencies are needed; we remain on `@trigger.dev/react-hooks@4.0.4` and `@trigger.dev/sdk@4.0.4`.

