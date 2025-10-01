import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.COMP_API_BASE_URL || 'http://localhost:3333';

/**
 * PUT /api/comments/[commentId] - Update a comment
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { commentId: string } },
) {
  const requestHeaders = await headers();
  
  const [{ session }, { token }] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    auth.api.getToken({ headers: requestHeaders }),
  ]);

  const organizationId = session?.activeOrganizationId;
  
  if (!token || !organizationId) {
    return NextResponse.json({ error: 'Missing authentication or organization context' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/comments/${params.commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-Id': organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
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
  const requestHeaders = await headers();
  
  const [{ session }, { token }] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    auth.api.getToken({ headers: requestHeaders }),
  ]);

  const organizationId = session?.activeOrganizationId;
  
  if (!token || !organizationId) {
    return NextResponse.json({ error: 'Missing authentication or organization context' }, { status: 401 });
  }

  try {

    const upstream = await fetch(`${API_BASE_URL}/v1/comments/${params.commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-Id': organizationId,
      },
      cache: 'no-store',
    });

    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await upstream.text();

    return new NextResponse(data, {
      status: upstream.status,
      headers: {
        'content-type': upstream.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
