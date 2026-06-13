import { Resend } from 'resend';

const labels = {
  signup: {
    subject: 'Your RabtPoint verification code',
    title: 'Verify your RabtPoint email',
    body: 'Your RabtPoint signup OTP is:'
  },
  login: {
    subject: 'Your RabtPoint login code',
    title: 'Login to RabtPoint',
    body: 'Use this OTP to login to RabtPoint:'
  },
  'forgot-password': {
    subject: 'Reset your RabtPoint password',
    title: 'Reset your RabtPoint password',
    body: 'Use this OTP to reset your RabtPoint password:'
  },
  'change-email': {
    subject: 'Verify your new RabtPoint email',
    title: 'Verify your RabtPoint email change',
    body: 'Use this OTP to verify your new email:'
  }
};

const isProduction = () => process.env.NODE_ENV === 'production';

export const usesDevOtpDelivery = () => {
  if (process.env.RESEND_API_KEY) return false;
  return !isProduction() || process.env.DEV_OTP_CONSOLE === 'true';
};

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing. Add it to server/.env or enable local dev OTP mode.');
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const logDevOtp = ({ email, otp, purpose }) => {
  console.log('\n========================================');
  console.log(`[DEV OTP] ${purpose} -> ${email}`);
  console.log(`OTP: ${otp}`);
  console.log('========================================\n');
};

export const sendOtpEmail = async ({ email, name, otp, purpose = 'signup' }) => {
  if (usesDevOtpDelivery()) {
    logDevOtp({ email, otp, purpose });
    return { devMode: true };
  }

  const resend = getResend();
  const from = process.env.OTP_FROM_EMAIL || 'RabtPoint <onboarding@resend.dev>';
  const copy = labels[purpose] || labels.signup;

  await resend.emails.send({
    from,
    to: email,
    subject: copy.subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>${copy.title}</h2>
        <p>Hello ${name || 'there'},</p>
        <p>${copy.body}</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
        <p>Thanks,<br/>RabtPoint team</p>
      </div>
    `
  });

  return { devMode: false };
};

export const sendLoginAlertEmail = async ({ email, name, ipAddress, userAgent, loginAt }) => {
  if (usesDevOtpDelivery()) {
    console.log(`[DEV] Login alert skipped for ${email}`);
    return;
  }

  const resend = getResend();
  const from = process.env.OTP_FROM_EMAIL || 'RabtPoint <onboarding@resend.dev>';

  await resend.emails.send({
    from,
    to: email,
    subject: 'New RabtPoint login',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>New login to RabtPoint</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your account was logged in.</p>
        <ul>
          <li><strong>Time:</strong> ${loginAt}</li>
          <li><strong>IP:</strong> ${ipAddress || 'Unknown'}</li>
          <li><strong>Device:</strong> ${userAgent || 'Unknown browser'}</li>
        </ul>
        <p>If this was you, no action is needed. If this was not you, reset your password and logout from other devices.</p>
        <p>Thanks,<br/>RabtPoint team</p>
      </div>
    `
  });
};

export const buildOtpResponse = ({ message, otp, emailResult }) => {
  const payload = { message };

  if (emailResult?.devMode && otp) {
    payload.devOtp = otp;
    payload.message = `${message} Dev OTP: ${otp}`;
  }

  return payload;
};
