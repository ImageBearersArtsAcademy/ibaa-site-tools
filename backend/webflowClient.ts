import 'dotenv/config';
import Webflow from 'webflow-api';
import { Orders } from '../types';

const api = new Webflow({ token: process.env.WEBFLOW_API_TOKEN, beta: true });

const siteId = '6535c587a24c9a3fff171b46';

export async function listOrders(): Promise<Orders> {
	const result = await api.get(`/sites/${siteId}/orders?status=unfulfilled`);

	if (!result.data.orders) {
		return [];
	}

	return Orders(
		result.data.orders?.map((order: any) => ({
			raw: order,
			orderId: order.orderId,
			parentName: order.customerInfo.fullName,
			parentEmail: order.customerInfo.email,
			studentsInfo: JSON.parse(
				order.customData?.find((x: any) => x.name === 'Notes')?.textArea
			),
		}))
	);
}
