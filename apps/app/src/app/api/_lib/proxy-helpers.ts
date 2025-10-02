// apps/app/src/app/api/_lib/proxy-helpers.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.COMP_API_BASE_URL!;
const PROXY_DEBUG = process.env.NODE_ENV !== 'production';

export function getProxyContext(req: NextRequest) {
  const authHeader =
    req.headers.get('authorization') ??
    req.headers.get('Authorization') ??
    '';

  if (!authHeader.trim()) {
    return { ok: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const orgHeader =
    req.headers.get('x-organization-id') ??
    req.headers.get('X-Organization-Id') ??
    req.nextUrl.searchParams.get('org') ??
    req.nextUrl.searchParams.get('orgId') ??
    '';

  if (!orgHeader.trim()) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'Missing organization context' },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true as const,
    authHeader,
    orgHeader,
  };
}

type ForwardJsonInit = {
  path: string;
  method?: string;
  body?: string;
  authHeader: string;
  orgHeader: string;
  extraHeaders?: HeadersInit;
};

export async function forwardJson({
  path,
  method = 'GET',
  body,
  authHeader,
  orgHeader,
  extraHeaders,
}: ForwardJsonInit) {
  if (PROXY_DEBUG) {
    console.info('🔍 proxy forwarding', {
      path,
      method,
      hasAuth: Boolean(authHeader),
      hasOrg: Boolean(orgHeader),
      hasBody: Boolean(body),
    });
  }

  const upstream = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body,
    headers: {
      Authorization: authHeader,
      'X-Organization-Id': orgHeader,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
  });

  // Handle 204 No Content (DELETE operations must return null body)
  if (upstream.status === 204) {
    return new Response(null, { status: 204 });
  }

  const text = await upstream.text();

  if (!upstream.ok && PROXY_DEBUG) {
    console.error('🔁 upstream error', upstream.status, text);
  }

  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}
