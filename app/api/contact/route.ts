import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, service, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    console.log('====== EMAIL NOTIFICATION (CONTACT FORM) ======');
    console.log(`To: hydrowells@gmail.com`);
    console.log(`Subject: New Contact Request from ${name}`);
    console.log(`Service Requested: ${service}`);
    console.log(`Client Email: ${email}`);
    console.log(`Message:\n${message}`);
    console.log('==============================================');

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      // If the developer wants real emails, they can supply RESEND_API_KEY in .env
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'HydroWells Site <onboarding@resend.dev>',
          to: 'hydrowells@gmail.com',
          subject: `HydroWells Lead: ${service} - from ${name}`,
          html: `
            <h3>New Contact Request</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Requested Service:</strong> ${service}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send email via Resend:', errorText);
      } else {
        console.log('Email sent successfully via Resend API.');
      }
    }

    return NextResponse.json({ success: true, message: 'Contact request received.' });
  } catch (err: any) {
    console.error('Error in /api/contact route:', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
