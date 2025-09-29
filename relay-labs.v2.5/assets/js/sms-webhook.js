export default async function handler(req, res) {
  // Only accept POST from Formspree
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, sms_consent, name, email } = req.body;

  // Check consent
  if (sms_consent !== 'true' || !phone) {
    console.log('No SMS sent - no consent or missing phone');
    return res.status(200).json({ message: 'No SMS sent' });
  }

  // Clean phone number (remove formatting)
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('1') ? '+' + cleanPhone : '+1' + cleanPhone;

  try {
    // Send to Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: `Hi ${name || 'there'}! Thanks for contacting Relay Labs. We've received your inquiry and will be in touch soon. Reply STOP to opt out.`
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio error: ${response.status}`);
    }

    const data = await response.json();
    console.log('SMS sent successfully:', data.sid);
    res.status(200).json({ success: true, sid: data.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    // Return 200 to not break Formspree flow
    res.status(200).json({ error: 'SMS failed but form submitted' });
  }
}
