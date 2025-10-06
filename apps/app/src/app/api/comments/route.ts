import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../_lib/proxy-helpers';

/**
 * GET /api/comments?entityId=xxx&entityType=xxx - List comments for any entity
 */
export async function GET(req: NextRequest) {
  const search = req.nextUrl.search ?? '';

  return forwardJson(req, {
    path: `/v1/comments${search}`,
    method: 'GET',
  });
}

/**
 * POST /api/comments - Create a comment for any entity
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  return forwardJson(req, {
    path: '/v1/comments',
    method: 'POST',
    body: JSON.stringify(body),
  });
}
