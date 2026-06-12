import { Resend } from 'resend';

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY missing hai. server/.env me Resend API key add karo.');
  }

  return new Resend(process.env.RESEND_API_KEY);
};

export const sendOtpEmail = async ({ email, name, otp }) => {
  const resend = getResend();
  const from = process.env.OTP_FROM_EMAIL || 'RabtPoint <onboarding@resend.dev>';

  await resend.emails.send({
    from,
    to: email,
    subject: 'Your RabtPoint verification code',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Verify your RabtPoint email</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your RabtPoint signup OTP is:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
        <p>Thanks,<br/>RabtPoint team</p>
      </div>
    `
  });
};
