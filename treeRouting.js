const path = require("path");
const fs = require("fs");
const { Router } = require("express");
const { sortDirectoryListing } = require("./utils/sorter");
const defaultConfig = require("./lib/defaultConfig");

/**
 *
 * @typedef {{dotname: string; middleware: import("express").RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>>}} DotMiddleware
 *
 * @param {object} config // configuration
 * @param {string} config.baseDirectory // the directory to scan for routes
 * @param {Router} config.baseRouter // the main router to use for the generated routes
 * @param {DotMiddleware[]} config.dotMiddlewares // dotname and middleware to use for routes with dots in the name
 * @param {boolean} config.caseSensitive // case sensitive routing
 * @param {boolean} config.passParamsToChild // pass params to child routes -> merge params
 * @returns
 */
function treeRoutingMiddleware(config = defaultConfig) {
	const {
		baseDirectory,
		baseRouter,
		dotMiddlewares,
		caseSensitive,
		passParamsToChild,
	} = config;

	const routerOptions = {};

	if (caseSensitive) {
		routerOptions.caseSensitive = true;
	}

	if (passParamsToChild) {
		routerOptions.mergeParams = true;
	}

	/**
	 *
	 * @param {object} directory
	 * @param {string} directory.name
	 * @param {string} directory.itemPath
	 * @param {fs.Stats} directory.stat
	 */
	function mapDirectory(directory) {
		const directorySubRouter = Router(routerOptions);
		const middlewaresAndHandler = [];
		const middlewarePath = path.join(directory.itemPath, "middleware.js");
		if (fs.existsSync(middlewarePath)) {
			const directoryMiddlewares = require(middlewarePath);
			if (Array.isArray(directoryMiddlewares)) {
				middlewaresAndHandler = [
					...middlewaresAndHandler,
					...directoryMiddlewares,
				];
			} else {
				middlewaresAndHandler.push(directoryMiddlewares);
			}
		}

		middlewaresAndHandler.push(
			treeRoutingMiddleware({
				baseDirectory: directory.itemPath,
				baseRouter: directorySubRouter,
				dotMiddlewares,
				caseSensitive: config.caseSensitive,
				passParamsToChild: config.passParamsToChild,
			})
		);
		baseRouter.use(`/${directory.name}`, middlewaresAndHandler);
	}

	/**
	 *
	 * @param {object} file
	 * @param {string} file.name
	 * @param {string} file.itemPath
	 * @param {fs.Stats} file.stat
	 */
	function mapFile(file) {
		const subRoutesRouter = Router(routerOptions);
		const middlewares = [];
		dotMiddlewares.forEach((mdl) => {
			if (file.name.includes(mdl.dotname)) {
				middlewares.push(mdl.middleware);
			}
		});
		const middleware = require(file.itemPath)(subRoutesRouter);
		middlewares.push(middleware);
		baseRouter.use(
			`/${file.name === "index.js" ? "" : file.name.split(".")[0]}`,
			middlewares
		);
	}

	const baseDirectoryData = fs
		.readdirSync(baseDirectory)
		.filter((item) => item !== "middleware.js"); // ignore .middleware files;

	const stats = baseDirectoryData.map((name) => {
		const itemPath = path.join(baseDirectory, name);
		const itemStatus = fs.statSync(itemPath);
		return {
			name,
			itemPath,
			stat: itemStatus,
		};
	});

	const directories = stats.filter((item) => item.stat.isDirectory());

	const directoriesWithParams = directories.filter((directory) =>
		directory.name.startsWith(":")
	);
	const directoriesWithoutParams = directories.filter(
		(directory) => !directory.name.startsWith(":")
	);

	const files = stats.filter(
		(item) => item.stat.isFile() && item.name.endsWith(".js")
	);

	directoriesWithoutParams.forEach((directory) => mapDirectory(directory));
	files.forEach((file) => mapFile(file));
	directoriesWithParams.forEach((directory) => mapDirectory(directory));

	return baseRouter;
}

module.exports = treeRoutingMiddleware;
