import { Resend } from 'resend';

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// --- DEBUG LINE ADDED ---
if (resend) {
  console.log(`Resend initialized with API key ending in: ...${process.env.RESEND_API_KEY.slice(-4)}`);
} else {
  console.warn('RESEND_API_KEY is not set. Resend is not initialized.');
}
// ------------------------

export const sendEmail = async ({
  to,
  subject,
  react,
  marketing,
  system,
  test,
  cc,
  scheduledAt,
}: {
  to: string;
  subject: string;
  react: React.ReactNode;
  marketing?: boolean;
  system?: boolean;
  test?: boolean;
  cc?: string | string[];
  scheduledAt?: string;
}) => {
  if (!resend) {
    // This warning will now be more informative because of the log above
    console.error('Attempted to send email, but Resend is not initialized.');
    throw new Error('Resend not initialized - missing API key');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Passt Dev <info@send.passt.dev>',
      to: test ? 'info@passt.dev' : to,
      cc,
      replyTo: marketing ? 'info@passt.dev' : undefined,
      subject,
      //@ts-ignore expected
      react,
      scheduledAt,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return {
      message: 'Email sent successfully',
      id: data?.id,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error instanceof Error ? error : new Error('Failed to send email');
  }
};
