import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { forwardJson } from '../../../_lib/proxy-helpers';

function requireProxyHeaders(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const orgHeader = req.headers.get('x-organization-id');

  if (!authHeader || !orgHeader) {
    return null;
  }

  return { authHeader, orgHeader };
}

/**
 * DELETE /api/attachments/[taskId]/[attachmentId] - Delete an attachment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string; attachmentId: string } },
) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments/${params.attachmentId}`,
    method: 'DELETE',
    ...headers,
  });
}
