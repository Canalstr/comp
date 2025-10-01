import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson, getProxyContext } from '../../../_lib/proxy-helpers';

/**
 * GET /api/attachments/download/[attachmentId] - Download attachment
 * Supports both header-based auth (from ApiClient) and query param fallback (from direct links)
 */
export async function GET(req: NextRequest, { params }: { params: { attachmentId: string } }) {
  const ctx = getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  return forwardJson({
    path: `/v1/attachments/${params.attachmentId}/download`,
    method: 'GET',
    authHeader: ctx.authHeader,
    orgHeader: ctx.orgHeader,
  });
}
