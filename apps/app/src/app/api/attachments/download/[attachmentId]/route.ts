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
 * GET /api/attachments/download/[attachmentId] - Download attachment
 * Streams the file from NestJS API
 */
export async function GET(req: NextRequest, { params }: { params: { attachmentId: string } }) {
  const headers = requireProxyHeaders(req);
  if (!headers) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return forwardJson({
    path: `/v1/attachments/${params.attachmentId}/download`,
    method: 'GET',
    ...headers,
  });
}
