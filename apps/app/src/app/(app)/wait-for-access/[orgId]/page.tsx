import { auth } from '@/utils/auth';
import { db } from '@db';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@comp/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@comp/ui/card';
import { AutoRefresh } from './components/AutoRefresh';

interface WaitForAccessPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function WaitForAccessPage({ params }: WaitForAccessPageProps) {
  const { orgId } = await params;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <AutoRefresh />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Waiting for Tool Access
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your organization is being set up. We'll notify you once access is ready.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Organization Created</p>
                <p className="text-sm text-gray-600">Your organization "{organization.name}" has been created successfully.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Setting Up Access</p>
                <p className="text-sm text-gray-600">We're configuring your compliance tools and preparing your workspace.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Access Pending</p>
                <p className="text-sm text-gray-600">You'll receive an email notification when your access is ready.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 text-center mb-4">
              This page will automatically refresh every 30 seconds.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
