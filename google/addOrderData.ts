import { google } from "googleapis";
import { configureGoogleAuth } from "./configureGoogleAuth";

export async function addOrderData(studentData: any) {
	if (typeof studentData !== "object") {
		throw new Error("student data must be of type object");
	}

	await google.sheets("v4").spreadsheets.values.append({
		auth: configureGoogleAuth(),
		range: 'A1',
		requestBody: {
			values: Object.entries(studentData).flatMap(([classSlug, students]) => {
				if (!Array.isArray(students)) {
					return [];
				}

				return students.map(student => {
					if (typeof student !== 'object') {
						return ['Could not parse', JSON.stringify(student)];
					}

					return [slugToReadableName(classSlug), ...Object.keys(student).sort().map(x => student[x])];
				});
			}),
		},
		valueInputOption: 'RAW',
		spreadsheetId: process.env.SPREADSHEET_ID,
	});
}

function slugToReadableName(slug: string): string {
	const match = /product\/([^\/]+)/.exec(slug);

	if (!match) {
		return slug;
	}

	return match[1].replace(/---/g, '-').replace(/-/g, ' ');
}
