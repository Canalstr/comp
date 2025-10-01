import 'server-only';
import { NextRequest } from 'next/server';
import { forwardJson } from '../../../_lib/proxy-helpers';

/**
 * GET /api/attachments/download/[attachmentId] - Download attachment
 * Streams the file from NestJS API
 */
export async function GET(req: NextRequest, { params }: { params: { attachmentId: string } }) {
  return forwardJson(req, {
    path: `/v1/attachments/${params.attachmentId}/download`,
    method: 'GET',
  });
}
