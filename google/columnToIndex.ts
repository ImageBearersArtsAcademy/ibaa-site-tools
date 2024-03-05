export function columnToIndex(name?: string | null): number | undefined {
	if (!name || !/^[A-Z]+$/.test(name)) {
		return;
	}

	return name
		.toLowerCase()
		.split('')
		.map(x => x.charCodeAt(0) - 96)
		.reverse()
		.map((x, i) => x * 26**i)
		.reduce((total, cur) => total + cur) - 1;
}
