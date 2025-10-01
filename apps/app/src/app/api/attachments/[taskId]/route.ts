import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../../_lib/proxy-helpers';

/**
 * GET /api/attachments/[taskId] - List attachments for a task
 */
export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
  const ctx = getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments`,
    method: 'GET',
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}

/**
 * POST /api/attachments/[taskId] - Upload attachment to a task
 */
export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  const ctx = getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  const body = await req.json();

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments`,
    method: 'POST',
    body: JSON.stringify(body),
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}
