import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getProxyContext } from '../../../_lib/proxy-helpers';

const API_BASE_URL = process.env.COMP_API_BASE_URL!;

/**
 * GET /api/attachments/download/[attachmentId] - Download attachment
 * Normalizes relative URLs to absolute to prevent browser from opening Next.js 404
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { attachmentId: string } },
) {
  const ctx = getProxyContext(req);
  if (!ctx.ok) return ctx.response;

  const upstream = await fetch(
    `${API_BASE_URL}/v1/attachments/${params.attachmentId}/download`,
    {
      method: 'GET',
      headers: {
        Authorization: ctx.authHeader,
        'X-Organization-Id': ctx.orgHeader,
      },
    },
  );

  const contentType = upstream.headers.get('content-type') ?? '';

  if (contentType.includes('json')) {
    const data = await upstream.json();
    if (
      typeof data?.downloadUrl === 'string' &&
      data.downloadUrl.startsWith('/')
    ) {
      data.downloadUrl = new URL(data.downloadUrl, API_BASE_URL).toString();
    }

    return NextResponse.json(data, { status: upstream.status });
  }

  if (!upstream.ok) {
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
      'Content-Disposition':
        upstream.headers.get('content-disposition') ?? 'attachment',
    },
  });
}
