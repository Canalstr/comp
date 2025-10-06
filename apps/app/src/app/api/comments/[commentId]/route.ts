import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../../_lib/proxy-helpers';

/**
 * PUT /api/comments/[commentId] - Update a comment
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const body = await req.json();

  return forwardJson(req, {
    path: `/v1/comments/${params.commentId}`,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE /api/comments/[commentId] - Delete a comment
 */
export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  return forwardJson(req, {
    path: `/v1/comments/${params.commentId}`,
    method: 'DELETE',
  });
}
