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
 * DELETE /api/attachments/[taskId]/[attachmentId] - Delete an attachment
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string; attachmentId: string } },
) {
  const orgId = await getOrgId(req);
  if (!orgId) {
    return NextResponse.json({ error: 'Missing organization' }, { status: 400 });
  }

  const { taskId, attachmentId } = params;

  try {
    const upstream = await fetch(
      `${API_BASE_URL}/v1/tasks/${taskId}/attachments/${attachmentId}`,
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
    console.error('Error deleting attachment:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
