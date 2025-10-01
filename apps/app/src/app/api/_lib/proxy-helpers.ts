// apps/app/src/app/api/_lib/proxy-helpers.ts

const API_BASE_URL = process.env.COMP_API_BASE_URL!;

function dumpHeaders(h: Headers) {
  return Array.from(h.entries()).map(([k, v]) => `${k}: ${v}`);
}

export async function forwardJson(
  req: Request,
  init: RequestInit & { path: string },
) {
  const authHeader =
    req.headers.get('authorization') ?? req.headers.get('Authorization');
  const orgHeader =
    req.headers.get('x-organization-id') ?? req.headers.get('X-Organization-Id');

  console.log('🔍 proxy headers', {
    path: init.path,
    hasAuth: Boolean(authHeader),
    hasOrg: Boolean(orgHeader),
    sample: dumpHeaders(req.headers).slice(0, 10), // don't spam the logs
  });

  if (!authHeader || !orgHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authentication or organization context' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const upstream = await fetch(`${API_BASE_URL}${init.path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: authHeader,
      'X-Organization-Id': orgHeader,
    },
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

