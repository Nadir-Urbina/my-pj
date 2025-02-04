import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { emails, entryId, entryTitle, shareLink } = await request.json()

  try {
    await resend.emails.send({
      from: 'Journal App <share@yourapp.com>',
      to: emails,
      subject: `${entryTitle} has been shared with you`,
      html: `
        <h1>A journal entry has been shared with you</h1>
        <p>Click the link below to view the entry:</p>
        <a href="${shareLink}">${shareLink}</a>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 