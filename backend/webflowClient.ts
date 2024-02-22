import 'dotenv/config';
import Webflow from 'webflow-api';

const api = new Webflow({ token: process.env.WEBFLOW_API_TOKEN, beta: true });

const siteId = '6535c587a24c9a3fff171b46';

export async function listOrders() {
	const result = await api.get(`/sites/${siteId}/orders?status=unfulfilled`);
	console.log(result.status, result.data.orders[0]);
}
