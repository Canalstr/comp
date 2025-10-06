import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../_lib/proxy-helpers';

/**
 * GET /api/comments?entityId=xxx&entityType=xxx - List comments for any entity
 */
export async function GET(req: NextRequest) {
  const ctx = await getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  const search = req.nextUrl.search ?? '';

  return forwardJson({
    path: `/v1/comments${search}`,
    method: 'GET',
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}

/**
 * POST /api/comments - Create a comment for any entity
 */
export async function POST(req: NextRequest) {
  const ctx = await getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  const body = await req.json();

  return forwardJson({
    path: '/v1/comments',
    method: 'POST',
    body: JSON.stringify(body),
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}
