import { google } from 'googleapis';
import { configureGoogleAuth } from './configureGoogleAuth';
import { Orders } from '../types';
import { columnToIndex } from './columnToIndex';

export async function addOrderData(orders: Orders) {
	const allColumns = Object.fromEntries(
		[
			...new Set(
				orders.flatMap((data) =>
					Object.values(data.studentsInfo).flatMap((classInfo) =>
						classInfo.flatMap((form) =>
							Object.values(form).map((x) => x.column)
						)
					)
				)
			),
		]
			.filter((x): x is string => Boolean(x))
			.map((column) => [column, columnToIndex(column)] as const)
	);

	const values = orders.flatMap((order) =>
		Object.entries(order.studentsInfo).flatMap(([classSlug, classForms]) =>
			classForms.map((classForm) => {
				const row: string[] = [order.orderId, slugToReadableName(classSlug), order.parentName, order.parentEmail];

				for (const formValue of Object.values(classForm)) {
					if (!formValue.column) {
						continue;
					}

					const index = allColumns[formValue.column];

					if (index === undefined || index < 4) {
						continue;
					}

					row[index] = formValue.value;
				}

				return row;
			})
		)
	);

	await google.sheets('v4').spreadsheets.values.append({
		auth: configureGoogleAuth(),
		range: 'Data!A1',
		requestBody: {
			values,
		},
		valueInputOption: 'RAW',
		spreadsheetId: process.env.SPREADSHEET_ID,
	});

	const today = new Date();
	await google.sheets('v4').spreadsheets.values.append({
		auth: configureGoogleAuth(),
		range: "'Processor Audit'!A1",
		requestBody: {
			values: orders.map(order => [order.orderId, today.toISOString()])
		},
		valueInputOption: 'RAW',
		spreadsheetId: process.env.SPREADSHEET_ID,
	})
}

function slugToReadableName(slug: string): string {
	const match = /product\/([^\/]+)/.exec(slug);

	if (!match) {
		return slug;
	}

	return match[1].replace(/---/g, '-').replace(/-/g, ' ');
}
