import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

type ProxyContextOk = {
  ok: true;
  authHeader: string;
  orgHeader: string;
};

type ProxyContextError = {
  ok: false;
  response: NextResponse;
};

export function getProxyContext(req?: NextRequest): ProxyContextOk | ProxyContextError {
  const headerList = req?.headers ?? headers();

  const authHeader =
    headerList.get('authorization') ??
    headerList.get('Authorization') ??
    undefined;

  let orgHeader =
    headerList.get('x-organization-id') ??
    headerList.get('X-Organization-Id') ??
    undefined;

  if (!orgHeader && req) {
    const url = req.nextUrl ?? new URL(req.url);
    orgHeader =
      url.searchParams.get('org') ??
      url.searchParams.get('orgId') ??
      undefined;
  }

  if (!authHeader || !orgHeader) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing authentication or organization context' },
        { status: 401 },
      ),
    };
  }

  return { ok: true, authHeader, orgHeader };
}

const API_BASE_URL = process.env.COMP_API_BASE_URL!; // http://comp-api-alb-...

export async function forwardJson(
  input: Request,
  init: RequestInit & { path: string },
) {
  const ctx = getProxyContext();
  if (!ctx.ok) {
    return ctx.response;
  }

  const url = `${API_BASE_URL}${init.path}`;
  const upstream = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: ctx.authHeader,
      'X-Organization-Id': ctx.orgHeader,
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