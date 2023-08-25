const sortDirectoryListing = (a, b) => {
	const aHasIndexJS = a.includes("index.js");
	const bHasIndexJS = b.includes("index.js");

	const aStartsWithColon = a.startsWith(':');
	const bStartsWithColon = b.startsWith(':');

	if (aHasIndexJS && !bHasIndexJS) {
		return 1; // Move a to a later position
	} else if (!aHasIndexJS && bHasIndexJS) {
		return -1; // Move b to a later position
	} else if (aStartsWithColon && !bStartsWithColon) {
		return 1; // Move a to the end
	} else if (!aStartsWithColon && bStartsWithColon) {
		return -1; // Move b to the end
	} else {
		return a.localeCompare(b); // Keep normal sorting for other cases
	}
};

module.exports = { sortDirectoryListing };
