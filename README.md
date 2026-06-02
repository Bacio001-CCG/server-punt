This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## WhatsApp Business Support Integration

This project includes a WhatsApp Business Cloud API integration so customers can contact support.

### Added endpoints

- `GET /api/whatsapp/webhook`: Meta webhook verification callback
- `POST /api/whatsapp/webhook`: inbound WhatsApp events/messages
- `POST /api/whatsapp/send`: send text messages through WhatsApp Cloud API
- `POST /api/whatsapp/support`: accepts the popup widget submission and forwards it to the WhatsApp support number

### Required environment variables

Add these to your `.env` file:

```bash
# Cloud API credentials
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_GRAPH_VERSION=v25.0

# Webhook verification
WHATSAPP_WEBHOOK_VERIFY_TOKEN=choose_a_random_verify_token

# Optional, but recommended for webhook signature validation
WHATSAPP_APP_SECRET=your_meta_app_secret

# Optional auto-reply for inbound text messages
WHATSAPP_SUPPORT_AUTO_REPLY_MESSAGE=Thanks for contacting ServerPunt support. We will get back to you shortly.

# Optional API key to protect /api/whatsapp/send
WHATSAPP_INTERNAL_API_KEY=some_strong_secret_key

# Frontend support button
NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER=31612345678
NEXT_PUBLIC_WHATSAPP_SUPPORT_MESSAGE=Hoi! Ik heb hulp nodig met mijn bestelling.
```

The popup widget uses `NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER` as the recipient for support requests. If you want a different internal destination, I can split that into a separate server-only env variable.

### Meta dashboard setup

1. In Meta for Developers, configure your WhatsApp app webhook URL as:
	 `https://your-domain.com/api/whatsapp/webhook`
2. Use the same value for verify token as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
3. Subscribe to at least the `messages` webhook field.
4. Add your production phone number and use a permanent access token.

### Send message endpoint example

Template message payload supported by the app:

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
	-H "Content-Type: application/json" \
	-H "x-api-key: some_strong_secret_key" \
	-d '{
		"to": "31638023867",
		"templateName": "jaspers_market_order_confirmation_v1",
		"languageCode": "en_US",
		"parameters": [
			{"type": "text", "text": "John Doe"},
			{"type": "text", "text": "123456"},
			{"type": "text", "text": "May 12, 2026"}
		]
	}'
```

```bash
curl -X POST http://localhost:3000/api/whatsapp/send \
	-H "Content-Type: application/json" \
	-H "x-api-key: some_strong_secret_key" \
	-d '{"to":"31612345678","message":"Hoi! Waarmee kunnen we helpen?"}'
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
