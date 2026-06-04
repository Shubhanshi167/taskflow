import dotenv from 'dotenv';
dotenv.config();

console.log('RESEND KEY =', process.env.RESEND_API_KEY);

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({
  to,
  workspaceName,
  inviterName,
  inviteLink,
}) => {
  try {
    await resend.emails.send({
      from: 'TaskFlow <onboarding@resend.dev>',
      to,
      subject: `You're invited to join ${workspaceName}`,
      html: `
        <div>
          <h2>Workspace Invitation</h2>
          <p>${inviterName} invited you to join ${workspaceName}</p>
          <a href="${inviteLink}">Join Workspace</a>
        </div>
      `,
    });

    console.log(`✅ Invite email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
  }
};