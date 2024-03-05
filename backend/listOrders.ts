import { addOrderData } from '../google';
import { listOrders } from './webflowClient';

async function main() {
	const orders = await listOrders();
	console.log(JSON.stringify(orders, null, 4));
	await addOrderData(orders);
}

main();
