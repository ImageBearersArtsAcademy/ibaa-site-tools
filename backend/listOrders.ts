import { addOrderData } from '../google';
import { listOrders } from './webflowClient';

async function main() {
	const orders = await listOrders();
	await addOrderData(orders);
}

main();
