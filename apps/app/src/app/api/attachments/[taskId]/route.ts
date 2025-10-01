import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { forwardJson } from '../../_lib/proxy-helpers';

function requireProxyHeaders(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const orgHeader = req.headers.get('x-organization-id');

  if (!authHeader || !orgHeader) {
    return null;
  }

  return { authHeader, orgHeader };
}

/**
 * GET /api/attachments/[taskId] - List attachments for a task
 */
export async function GET(req: NextRequest, { params }: { params: { taskId: string } }) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments`,
    method: 'GET',
    ...headers,
  });
}

/**
 * POST /api/attachments/[taskId] - Upload attachment to a task
 */
export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments`,
    method: 'POST',
    body: JSON.stringify(body),
    ...headers,
  });
}
