// apps/app/src/app/api/_lib/proxy-helpers.ts

const API_BASE_URL = process.env.COMP_API_BASE_URL!; // http://comp-api-alb-...

export async function forwardJson(
  req: Request,
  init: RequestInit & { path: string },
) {
  const authHeader = req.headers.get('authorization');
  const orgHeader =
    req.headers.get('x-organization-id') ?? req.headers.get('x-organization-id'.toLowerCase());

  if (!authHeader || !orgHeader) {
    console.error('Proxy missing auth context', { hasAuth: !!authHeader, hasOrg: !!orgHeader });
    return new Response(JSON.stringify({ error: 'Missing authentication or organization context' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstream = await fetch(`${API_BASE_URL}${init.path}`, {
    ...init,
    headers: {
      Authorization: authHeader,
      'X-Organization-Id': orgHeader,
      ...(init.headers ?? {}),
    },
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}

