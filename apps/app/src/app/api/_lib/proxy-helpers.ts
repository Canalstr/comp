// apps/app/src/app/api/_lib/proxy-helpers.ts
import { headers as nextHeaders } from 'next/headers';
import { auth } from '@/utils/auth';

const API_BASE_URL = process.env.COMP_API_BASE_URL!; // http://comp-api-alb-...

export async function getProxyContext() {
  const headers = await nextHeaders();

  const protocol = headers.get('x-forwarded-proto') ?? 'https';
  const host = headers.get('x-forwarded-host') ?? headers.get('host')!;
  const origin = `${protocol}://${host}`;

  // 1) Mint a JWT using Better Auth's built-in token endpoint
  const tokenResponse = await fetch(`${origin}/api/auth/token`, {
    headers: { cookie: headers.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (!tokenResponse.ok) {
    return { token: null, organizationId: null };
  }

  const { token } = await tokenResponse.json();

  // 2) We still need the active organization ID
  const session = await auth.api.getSession({ headers });
  const organizationId = session.session?.activeOrganizationId ?? null;

  return { token, organizationId, headers, origin };
}

export async function forwardJson(
  input: Request,
  init: RequestInit & { path: string },
) {
  const { token, organizationId } = await getProxyContext();
  if (!token || !organizationId) {
    return new Response(
      JSON.stringify({ error: 'Missing authentication or organization context' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const url = `${API_BASE_URL}${init.path}`;
  const upstream = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Organization-Id': organizationId,
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

