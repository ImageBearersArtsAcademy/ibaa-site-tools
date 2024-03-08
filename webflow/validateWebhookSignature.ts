// Import Node's Crypto module
import crypto from 'crypto';

export function validateWebhookSignature(
	signature: string,
	timestamp: string,
	body: any
) {
	const clientSecret = process.env.WEBFLOW_CLIENT_SECRET;

	// Dismiss if timestamp exceeds 5 minutes
	if (!clientSecret || (Date.now() - Number(timestamp)) / 60000 > 5) {
		return false;
	}

	// Merge the request timestamp and body
	const content = Number(timestamp) + ':' + JSON.stringify(body);

	// Compute HMAC signature using the timestamp and body
	const hmac = crypto
		.createHmac('sha256', clientSecret)
		.update(content)
		.digest('hex');

	// Transform the derived signature and the header signature into Buffers
	const hmacBuffer = Buffer.from(hmac);
	const signatureBuffer = Buffer.from(signature);

	// Validate if the derived signature matches the header's and return
	return crypto.timingSafeEqual(hmacBuffer, signatureBuffer);
}
