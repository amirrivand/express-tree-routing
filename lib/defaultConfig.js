const { Router } = require("express");
const path = require("path");

const defaultConfig = {
	dotMiddlewares: [],
	baseRouter: new Router(),
	baseDirectory: path.join(process.cwd(), "routes"),
	caseSensitive: false,
	passParamsToChild: false,
};

module.exports = defaultConfig;
