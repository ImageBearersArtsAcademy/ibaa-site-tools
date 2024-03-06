import 'dotenv/config';
import Webflow from 'webflow-api';
import { Order, Orders } from '../types';

const api = new Webflow({ token: process.env.WEBFLOW_API_TOKEN, beta: true });

const siteId = '6535c587a24c9a3fff171b46';

export async function listUnfulfilledOrders(): Promise<Orders> {
	const result = await api.get(`/sites/${siteId}/orders?status=unfulfilled`);

	if (!result.data.orders) {
		return [];
	}

	return Orders(
		result.data.orders?.map(mapOrder)
	);
}

export async function getOrder(orderId: string): Promise<Order> {
	const result = await api.get(
		`/sites/${siteId}/orders/${encodeURIComponent(orderId)}`
	);
	return mapOrder(result.data);
}

export function mapOrder(order: any): Order {
	return Order({
		raw: order,
		orderId: order.orderId,
		parentName: order.customerInfo.fullName,
		parentEmail: order.customerInfo.email,
		studentsInfo: JSON.parse(
			order.customData?.find((x: any) => x.name === 'Notes')?.textArea
		),
	});
}
