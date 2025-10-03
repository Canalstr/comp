'use server';

import { sendEmailNotification } from '../jobs/email-notifications';

// Server action to trigger email notifications
export async function triggerEmailNotification(payload: {
  to: string;
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, any>;
}) {
  try {
    const job = await sendEmailNotification.trigger(payload);
    
    return {
      success: true,
      jobId: job.id,
      message: 'Email notification job triggered successfully',
    };
  } catch (error) {
    console.error('Failed to trigger email notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper function to trigger integration results processing
export async function triggerIntegrationProcessing(integration: {
  id: string;
  name: string;
  integration_id: string;
  settings: any;
  user_settings: any;
  organization: {
    id: string;
    name: string;
  };
}) {
  try {
    const { processIntegrationResults } = await import('../jobs/integration-results');
    const job = await processIntegrationResults.trigger({ integration });
    
    return {
      success: true,
      jobId: job.id,
      message: 'Integration processing job triggered successfully',
    };
  } catch (error) {
    console.error('Failed to trigger integration processing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
