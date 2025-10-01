// apps/app/src/app/api/_lib/proxy-helpers.ts

const API_BASE_URL = process.env.COMP_API_BASE_URL!;
const PROXY_DEBUG = process.env.NODE_ENV !== 'production';

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
    console.info('🔍 proxy headers', {
      path,
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
