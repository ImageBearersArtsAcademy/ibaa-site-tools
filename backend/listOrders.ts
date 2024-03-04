import { listOrders } from "./webflowClient";

async function main() {
	console.log(await listOrders());
}

main();
