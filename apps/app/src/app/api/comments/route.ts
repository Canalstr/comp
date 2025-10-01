import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { jwtManager } from '@/utils/jwt-manager';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * GET /api/comments?entityId=xxx&entityType=xxx - List comments for any entity
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const orgId = session?.session.activeOrganizationId;
  
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entityId');
  const entityType = searchParams.get('entityType');

  if (!entityId || !entityType) {
    return NextResponse.json(
      { error: 'Missing entityId or entityType query parameters' },
      { status: 400 },
    );
  }

  try {
    // Get JWT token for API authentication
    const token = await jwtManager.getValidToken();
    
    const upstream = await fetch(
      `${API_BASE_URL}/v1/comments?entityId=${entityId}&entityType=${entityType}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Organization-Id': orgId,
          'Accept': 'application/json',
        },
        cache: 'no-store',
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
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/**
 * POST /api/comments - Create a comment for any entity
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const orgId = session?.session.activeOrganizationId;
  
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const token = await jwtManager.getValidToken();

    const upstream = await fetch(`${API_BASE_URL}/v1/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Organization-Id': orgId,
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
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
