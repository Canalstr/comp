import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * Get organization ID from session
 */
async function getOrgId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.session.activeOrganizationId ?? null;
}

/**
 * PATCH /api/comments/[taskId]/[commentId] - Update a comment
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string; commentId: string } },
) {
  const orgId = await getOrgId();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { taskId, commentId } = params;

  try {
    const body = await req.json();

    const upstream = await fetch(
      `${API_BASE_URL}/v1/tasks/${taskId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: {
          'X-API-Key': env.COMP_API_KEY || '',
          'X-Organization-Id': orgId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

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
 * DELETE /api/comments/[taskId]/[commentId] - Delete a comment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string; commentId: string } },
) {
  const orgId = await getOrgId();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { taskId, commentId } = params;

  try {
    const upstream = await fetch(
      `${API_BASE_URL}/v1/tasks/${taskId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          'X-API-Key': env.COMP_API_KEY || '',
          'X-Organization-Id': orgId,
        },
      },
    );

    return new NextResponse(null, {
      status: upstream.status,
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
