import { sendNotificationEmail } from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function runEmailTest() {
  const testEmail = process.env.GOOGLE_EMAIL || 'test@example.com';
  console.log(`Sending test email using Brevo SMTP service to ${testEmail}...`);

  try {
    const result = await sendNotificationEmail(
      testEmail,
      'EcoSphere Developer',
      'Brevo SMTP Connection Active',
      'This is a validation email confirming that the EcoSphere platform email integration is functioning correctly.'
    );

    if (result) {
      console.log('Test email sent successfully! Response:', result);
    } else {
      console.error('Failed to send email. Check API key configuration.');
    }
  } catch (error) {
    console.error('Email test execution failed with error:', error.message);
  }
  process.exit();
}

runEmailTest();
