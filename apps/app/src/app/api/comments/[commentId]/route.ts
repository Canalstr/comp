import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

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
 * PUT /api/comments/[commentId] - Update a comment
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const orgId = await getOrgId(req);
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { commentId } = params;

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'X-API-Key': env.COMP_API_KEY || '',
        'X-Organization-Id': orgId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.text();

    return new NextResponse(data, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

/**
 * DELETE /api/comments/[commentId] - Delete a comment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const orgId = await getOrgId(req);
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { commentId } = params;

  try {
    const upstream = await fetch(`${API_BASE_URL}/v1/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': env.COMP_API_KEY || '',
        'X-Organization-Id': orgId,
      },
    });

    return new NextResponse(null, {
      status: upstream.status,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
