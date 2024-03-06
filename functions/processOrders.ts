import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';
import { mapOrder } from '../backend';
import { WebhookPayload } from '../types';
import { addOrderData } from '../google';

export async function processOrders(
	request: HttpRequest,
	context: InvocationContext
): Promise<HttpResponseInit> {
	// TODO: Remove this once request validation is added
	return { status: 404 };

	const body = WebhookPayload(await request.json());
	if (body.triggerType !== 'ecomm_new_order') {
		return { status: 404 };
	}

	const order = mapOrder(body.payload);
	await addOrderData([order]);
	context.log(`Processed order ${order.orderId}`);

	return { status: 200 };
}

app.http('processOrders', {
	methods: ['GET', 'POST'],
	authLevel: 'anonymous',
	handler: processOrders,
});
