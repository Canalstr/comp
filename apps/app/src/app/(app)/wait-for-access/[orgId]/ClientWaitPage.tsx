'use client';

import { AutoRefresh } from './components/AutoRefresh';
import { RefreshButton } from './components/RefreshButton';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ClientWaitPageProps {
  orgName: string;
}

export default function ClientWaitPage({ orgName }: ClientWaitPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AutoRefresh />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started with Passt</h1>
          <p className="text-gray-600">Automate SOC 2, ISO 27001 and GDPR compliance with AI.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-green-600" />
          </div>

          {/* Main Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Setting up your workspace</h2>
          <p className="text-gray-600 mb-6">
            We're configuring your compliance tools for <strong>{orgName}</strong>. 
            This usually takes a few minutes.
          </p>

          {/* Progress Steps */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Organization created</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-3 h-3 text-amber-600" />
              </div>
              <span className="text-sm text-gray-600">Configuring compliance tools</span>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <span className="text-sm text-gray-500">Preparing workspace</span>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              This page will automatically refresh when ready.
            </p>
            <RefreshButton />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By continuing, you acknowledge that you have read and agree to the{' '}
            <a href="/terms" className="text-gray-700 hover:underline">Terms and Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="text-gray-700 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
