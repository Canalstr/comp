import 'server-only';
import { env } from '@/env.mjs';
import { auth } from '@/utils/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

/**
 * GET /api/attachments/[taskId] - List attachments for a task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session?.token;
  const orgId = session?.session?.activeOrganizationId;
  
  if (!token || !orgId) {
    return NextResponse.json({ error: 'Missing authentication or organization context' }, { status: 401 });
  }

  try {
    
    const upstream = await fetch(
      `${API_BASE_URL}/v1/tasks/${params.taskId}/attachments`,
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
    console.error('Error fetching attachments:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

/**
 * POST /api/attachments/[taskId] - Upload attachment to a task
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { taskId: string } },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const token = session?.session?.token;
  const orgId = session?.session?.activeOrganizationId;
  
  if (!token || !orgId) {
    return NextResponse.json({ error: 'Missing authentication or organization context' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const upstream = await fetch(`${API_BASE_URL}/v1/tasks/${params.taskId}/attachments`, {
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
    console.error('Error uploading attachment:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
