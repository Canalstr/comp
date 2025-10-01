import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { forwardJson } from '../_lib/proxy-helpers';

function requireProxyHeaders(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const orgHeader = req.headers.get('x-organization-id');

  if (!authHeader || !orgHeader) {
    return null;
  }

  return { authHeader, orgHeader };
}

/**
 * GET /api/comments?entityId=xxx&entityType=xxx - List comments for any entity
 */
export async function GET(req: NextRequest) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const search = req.nextUrl.search ?? '';

  return forwardJson({
    path: `/v1/comments${search}`,
    method: 'GET',
    ...headers,
  });
}

/**
 * POST /api/comments - Create a comment for any entity
 */
export async function POST(req: NextRequest) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  return forwardJson({
    path: '/v1/comments',
    method: 'POST',
    body: JSON.stringify(body),
    ...headers,
  });
}
