import { schemaTask } from "@trigger.dev/sdk";
import { emailNotificationSchema } from "./schemas";

export const sendEmailNotification = schemaTask({
  id: "send-email-notification",
  schema: emailNotificationSchema,
  timeoutInMs: 2 * 60 * 1000, // 2 minutes
  retry: {
    maxAttempts: 3,
    backoff: {
      type: "exponential",
    },
  },
  run: async (payload) => {
    const { to, subject, body, templateId, variables } = payload;

    try {
      // Simulate email sending - replace with actual Resend/SES implementation
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      
      if (templateId) {
        console.log(`Using template: ${templateId}`);
        console.log(`Variables:`, variables);
      }

      // TODO: Implement actual email sending logic
      // const result = await resend.emails.send({
      //   from: process.env.RESEND_FROM_DEFAULT,
      //   to: [to],
      //   subject,
      //   html: body,
      // });

      return {
        success: true,
        messageId: `msg_${Date.now()}`, // Replace with actual message ID
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  },
});
