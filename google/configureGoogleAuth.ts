import fs from "fs";
import path from "path";
import { Auth, google } from "googleapis";

export function configureGoogleAuth() {
	const credentialsPath = path.join(path.resolve("./"), "google-key.json");

	let auth: Auth.GoogleAuth;
	if (fs.existsSync(credentialsPath)) {
		auth = new google.auth.GoogleAuth({
			keyFile: credentialsPath,
			scopes: [
				"https://www.googleapis.com/auth/spreadsheets",
				"https://www.googleapis.com/auth/cloud-platform",
			],
		});
	} else if (process.env.GOOGLE_KEY) {
		const credentials = JSON.parse(process.env.GOOGLE_KEY);
		auth = new google.auth.GoogleAuth({
			scopes: [
				"https://www.googleapis.com/auth/spreadsheets",
				"https://www.googleapis.com/auth/cloud-platform",
			],
			credentials,
		});
	}

	if (!auth) {
		throw new Error("Missing google credentials");
	}

	return auth;
}
