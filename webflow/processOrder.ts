import { Command } from 'commander';
import { addOrderData } from '../google';
import { getOrder } from './webflowClient';

const program = new Command();

program
	.argument('<orderId>', 'The order id to process')
	.option('--dry-run', 'If set, does not submit data to google sheet')
	.action(async (orderId, options) => {
		const order = await getOrder(orderId);

		if (!order) {
			throw new Error(`Order ${orderId} does not exist`);
		}

		if (!options.dryRun) {
			await addOrderData([order]);
		} else {
			console.log(JSON.stringify(order, null, 4));
		}
	});

program.parse();
