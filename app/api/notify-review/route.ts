import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, rating, comment, serviceName } = await request.json();

    if (!name || !email || !comment || !rating) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    console.log('====== EMAIL NOTIFICATION (PENDING REVIEW) ======');
    console.log(`To: hydrowells@gmail.com`);
    console.log(`Subject: New Pending Review Submitted by ${name}`);
    console.log(`Rating: ${rating} Stars`);
    console.log(`Service: ${serviceName || 'General / Unknown'}`);
    console.log(`Client Email: ${email}`);
    console.log(`Comment:\n${comment}`);
    console.log('=================================================');

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'HydroWells Site <onboarding@resend.dev>',
          to: 'hydrowells@gmail.com',
          subject: `HydroWells CMS: New Review to Moderate from ${name}`,
          html: `
            <h3>New Review Pending Moderation</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Rating:</strong> ${rating} / 5 Stars</p>
            <p><strong>Service:</strong> ${serviceName || 'General / Unknown'}</p>
            <p><strong>Comment:</strong></p>
            <p><em>"${comment}"</em></p>
            <hr/>
            <p><a href="${request.url.split('/api/')[0]}/admin">Go to CMS Dashboard to approve/reject</a></p>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send review email via Resend:', errorText);
      } else {
        console.log('Review email sent successfully via Resend API.');
      }
    }

    return NextResponse.json({ success: true, message: 'Review notification logged.' });
  } catch (err: any) {
    console.error('Error in /api/notify-review route:', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
