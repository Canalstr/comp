'use client';

import { AutoRefresh } from './components/AutoRefresh';
import { RefreshButton } from './components/RefreshButton';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ClientWaitPageProps {
  orgName: string;
}

export default function ClientWaitPage({ orgName }: ClientWaitPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <AutoRefresh />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Waiting for Tool Access
          </h1>
          <p className="text-gray-600 mb-6">
            Your organization is being set up. We'll notify you once access is ready.
          </p>
        </div>
        
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Organization Created</p>
                <p className="text-sm text-gray-600">Your organization "{orgName}" has been created successfully.</p>
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
            <RefreshButton />
          </div>
        </div>
      </div>
    </div>
  );
}
