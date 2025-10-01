import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../../../_lib/proxy-helpers';

/**
 * DELETE /api/attachments/[taskId]/[attachmentId] - Delete an attachment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string; attachmentId: string } },
) {
  const ctx = getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  return forwardJson({
    path: `/v1/tasks/${params.taskId}/attachments/${params.attachmentId}`,
    method: 'DELETE',
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}
