const sortDirectoryListing = (a, b) => {
	const aHasIndexJS = a.includes("index.js");
	const bHasIndexJS = b.includes("index.js");

	if (aHasIndexJS && !bHasIndexJS) {
		return 1; // Move a to a later position
	} else if (!aHasIndexJS && bHasIndexJS) {
		return -1; // Move b to a later position
	} else {
		return 0; // Keep the same order
	}
};

module.exports = { sortDirectoryListing };
