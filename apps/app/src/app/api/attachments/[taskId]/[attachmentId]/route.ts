import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson } from '../../../_lib/proxy-helpers';

/**
 * DELETE /api/attachments/[taskId]/[attachmentId] - Delete an attachment
 */
export async function DELETE(
  _: NextRequest,
  { params }: { params: { taskId: string; attachmentId: string } },
) {
  return forwardJson(new Request(''), {
    path: `/v1/tasks/${params.taskId}/attachments/${params.attachmentId}`,
    method: 'DELETE',
  });
}
