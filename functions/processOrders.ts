import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';
import * as st from 'simple-runtypes';
import { mapOrder, validateWebhookSignature } from '../webflow';
import { WebhookPayload } from '../types';
import { addOrderData } from '../google';

export async function processOrders(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	const requestSignature = request.headers.get('X-Webflow-Signature');
	const requestTimestamp = request.headers.get('X-Webflow-Timestamp');
	const requestBodyParse = st.use(WebhookPayload, await request.json());

	if (!requestBodyParse.ok) {
		return { status: 400, jsonBody: { error: requestBodyParse.error.reason } };
	}

	const requestBody = requestBodyParse.result;

	if (
		!requestSignature ||
		!requestTimestamp ||
		!validateWebhookSignature(requestSignature, requestTimestamp, requestBody)
	) {
		return { status: 404 };
	}

	if (requestBody.triggerType !== 'ecomm_new_order') {
		return { status: 404 };
	}

	const order = mapOrder(requestBody.payload);
	await addOrderData([order]);
	context.log(`Processed order ${order.orderId}`);

	return { status: 200 };
}

app.http('processOrders', {
	methods: ['GET', 'POST'],
	authLevel: 'anonymous',
	handler: processOrders,
});
