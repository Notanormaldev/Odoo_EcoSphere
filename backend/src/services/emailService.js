import axios from 'axios';
import { config } from '../config/env.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: 'EcoSphere Platform',
          email: config.googleEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent,
      },
      {
        headers: {
          'api-key': config.brevoApiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Email send error:', error.response?.data || error.message);
    // Don't throw — email failure shouldn't break the main flow
    return null;
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${config.clientUrl}/verify-email/${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background: #2D5016; padding: 32px 40px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.3px; }
        .header span { color: #A7C77A; }
        .body { padding: 40px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; background: #2D5016; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .footer { padding: 24px 40px; background: #f9f9f7; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 13px; margin: 0; }
        .url { color: #6B7280; font-size: 13px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Eco<span>Sphere</span></h1>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Welcome to EcoSphere — your organization's ESG management platform. Please verify your email address to get started.</p>
          <a href="${verifyUrl}" class="btn">Verify Email Address</a>
          <p>This link expires in <strong>24 hours</strong>.</p>
          <p class="url">If the button above doesn't work, copy and paste this URL: ${verifyUrl}</p>
        </div>
        <div class="footer">
          <p>If you didn't create an EcoSphere account, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your EcoSphere account',
    htmlContent,
    textContent: `Hi ${name}, verify your email: ${verifyUrl}`,
  });
};

export const sendNotificationEmail = async (email, name, title, message, link = null) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background: #2D5016; padding: 32px 40px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }
        .header span { color: #A7C77A; }
        .body { padding: 40px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
        .alert { background: #F8F7F4; border-left: 4px solid #2D5016; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 16px 0; }
        .alert p { margin: 0; }
        .btn { display: inline-block; background: #2D5016; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0; }
        .footer { padding: 24px 40px; background: #f9f9f7; border-top: 1px solid #e5e7eb; }
        .footer p { color: #9ca3af; font-size: 13px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Eco<span>Sphere</span></h1>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <div class="alert">
            <p><strong>${title}</strong></p>
            <p>${message}</p>
          </div>
          ${link ? `<a href="${config.clientUrl}${link}" class="btn">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>You're receiving this from EcoSphere ESG Platform. Manage notification preferences in your settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `EcoSphere: ${title}`,
    htmlContent,
    textContent: `${title}\n\n${message}`,
  });
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${config.clientUrl}/reset-password/${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <p>Hi ${name},</p>
      <p>Reset your EcoSphere password: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your EcoSphere password',
    htmlContent,
    textContent: `Reset your password: ${resetUrl}`,
  });
};
