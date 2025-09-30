import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Get organization ID from header or session
 */
async function getOrgId(req: NextRequest): Promise<string | null> {
  // Check header first
  const headerOrgId = req.headers.get('x-organization-id');
  if (headerOrgId) {
    return headerOrgId;
  }

  // Fallback to session
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.session.activeOrganizationId ?? null;
}

/**
 * GET /api/attachments/download/[attachmentId] - Download attachment
 * Streams the file from NestJS API
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { attachmentId: string } },
) {
  const orgId = await getOrgId(req);
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const attachmentId = params.attachmentId;

  try {
    // Call NestJS API to get download URL
    const upstream = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/v1/attachments/${attachmentId}/download`,
      {
        headers: {
          'X-API-Key': env.COMP_API_KEY || '',
          'X-Organization-Id': orgId,
        },
        cache: 'no-store',
      },
    );

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Failed to get download URL' },
        { status: upstream.status },
      );
    }

    // Return the JSON response with downloadUrl
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
  }
}
