import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.COMP_API_BASE_URL || 'http://localhost:3333';

/**
 * GET /api/comments?entityId=xxx&entityType=xxx - List comments for any entity
 */
export async function GET(req: NextRequest) {
  const requestHeaders = await headers();
  
  const [{ session }, { token }] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    auth.api.getToken({ headers: requestHeaders }),
  ]);

  const organizationId = session?.activeOrganizationId;
  
  if (!token || !organizationId) {
    return NextResponse.json({ error: 'Missing authentication or organization context' }, { status: 401 });
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
    // Use JWT token from session
    
    const upstream = await fetch(
      `${API_BASE_URL}/v1/comments?entityId=${entityId}&entityType=${entityType}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Organization-Id': organizationId,
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
  const h = await headers();
  const token = await getJwtFromAuth(h);
  
  const session = await auth.api.getSession({ headers: h });
  const organizationId = session?.session?.activeOrganizationId;
  
  if (!token || !organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/comments`, {
      method: 'POST',
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
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
