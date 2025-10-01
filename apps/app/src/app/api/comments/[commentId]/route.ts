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
 * PUT /api/comments/[commentId] - Update a comment
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  return forwardJson({
    path: `/v1/comments/${params.commentId}`,
    method: 'PUT',
    body: JSON.stringify(body),
    ...headers,
  });
}

/**
 * DELETE /api/comments/[commentId] - Delete a comment
 */
export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return forwardJson({
    path: `/v1/comments/${params.commentId}`,
    method: 'DELETE',
    ...headers,
  });
}
