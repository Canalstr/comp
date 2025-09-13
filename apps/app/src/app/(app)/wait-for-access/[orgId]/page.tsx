import { auth } from '@/utils/auth';
import { db } from '@db';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import ClientWaitPage from './ClientWaitPage';

interface WaitForAccessPageProps {
  params: { orgId: string };
}

export default async function WaitForAccessPage({ params }: WaitForAccessPageProps) {
  const { orgId } = params;

  // Get current user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/auth');
  }

  // Get organization info
  const member = await db.member.findFirst({
    where: {
      organizationId: orgId,
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  if (!member) {
    notFound();
  }

  const { organization } = member;

  // If they have access, redirect to the org
  if (organization.hasAccess) {
    if (organization.onboardingCompleted) {
      redirect(`/${orgId}`);
    } else {
      redirect(`/onboarding/${orgId}`);
    }
  }

  return <ClientWaitPage orgName={organization.name} />;
}
