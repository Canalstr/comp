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
 * GET /api/comments/[taskId] - List comments for a task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const orgId = await getOrgId();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const taskId = params.taskId;

  try {
    const upstream = await fetch(`${API_BASE_URL}/v1/tasks/${taskId}/comments`, {
      headers: {
        'X-API-Key': env.COMP_API_KEY || '',
        'X-Organization-Id': orgId,
        Accept: 'application/json',
      },
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
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/comments/[taskId] - Create comment for a task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const orgId = await getOrgId();
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const taskId = params.taskId;

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/tasks/${taskId}/comments`, {
      method: 'POST',
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
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
