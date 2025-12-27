import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Option 1: Beehiiv API Integration
    // Uncomment and configure when you have your Beehiiv publication ID
    /*
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const BEEHIIV_PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (BEEHIIV_API_KEY && BEEHIIV_PUBLICATION_ID) {
      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BEEHIIV_API_KEY}`,
          },
          body: JSON.stringify({
            email,
            reactivate_existing: false,
            send_welcome_email: true,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          return NextResponse.json(
            { error: 'Already subscribed' },
            { status: 409 }
          );
        }
        throw new Error(data.message || 'Failed to subscribe');
      }

      return NextResponse.json({ success: true });
    }
    */

    // Placeholder response when Beehiiv is not configured
    // In production, you would integrate with Beehiiv or another newsletter service
    console.log('Newsletter subscription request:', email);
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription recorded (configure Beehiiv for production)'
    });

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
