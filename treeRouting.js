const path = require("path");
const fs = require("fs");
const { Router } = require("express");
const { sortDirectoryListing } = require("./utils/sorter");

/**
 *
 * @param {string} baseDirectory
 * @param {Router} baseRouter
 * @param {{dotname: string; middleware: import("express").RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>>}[]} dotMiddlewares
 * @returns
 */
function treeRoutingMiddleware(props = {
	dotMiddlewares: [],
	baseRouter: undefined,
	baseDirectory: undefined,
	caseSensitive: false,
	passParamsToChild: false
}) {

	const { baseDirectory, baseRouter, dotMiddlewares, caseSensitive, passParamsToChild } = props;

	const routerOptions = {}

	if (caseSensitive) {
		routerOptions.caseSensitive = true;
	}

	if (passParamsToChild) {
		routerOptions.mergeParams = true;
	}

	// list files in directory
	const listCurrentDirectory = fs
		.readdirSync(baseDirectory)
		.filter((item) => ["middleware.js"].indexOf(item) === -1);

	listCurrentDirectory.sort(sortDirectoryListing).forEach((item) => {
		const itemPath = path.join(baseDirectory, item);
		const itemStatus = fs.statSync(itemPath);

		// directory
		if (itemStatus.isDirectory()) {
			const subDirectoryRouter = Router(routerOptions);
			let middlewares = [];
			const middlewarePath = path.join(itemPath, "middleware.js");
			if (fs.existsSync(middlewarePath)) {
				const directoryMiddlewares = require(middlewarePath);
				if (Array.isArray(directoryMiddlewares)) {
					middlewares = [...middlewares, ...directoryMiddlewares];
				} else {
					middlewares.push(directoryMiddlewares);
				}
			}

			middlewares.push(
				treeRoutingMiddleware(itemPath, subDirectoryRouter, dotMiddlewares)
			);
			baseRouter.use(`/${item}`, middlewares);
		}

		// file
		if (itemStatus.isFile() && item.endsWith(".js")) {
			const subRoutesRouter = Router(routerOptions);
			const middlewares = [];
			dotMiddlewares.forEach((mdl) => {
				if (item.includes(mdl.dotname)) {
					middlewares.push(mdl.middleware);
				}
			});
			const middleware = require(itemPath)(subRoutesRouter);
			middlewares.push(middleware);
			baseRouter.use(
				`/${item === "index.js" ? "" : item.split(".")[0]}`,
				middlewares
			);
		}
	});

	return baseRouter;
}

module.exports = treeRoutingMiddleware;
