# Express Tree Routing Module

[![npm version](https://badge.fury.io/js/express-tree-routing.svg)](https://badge.fury.io/js/express-tree-routing)

Express Tree Routing is a powerful module that enables dynamic routing and middleware configuration based on the directory structure of your Express.js project. It simplifies the process of setting up routes and middleware by automatically scanning directories and files and attaching them to your Express router.

## Features

- Automatic tree-based routing: Routes are defined based on the directory structure of your project, eliminating the need to manually configure routes for each directory.
- Easy middleware configuration: Middleware can be organized and attached at various levels within the directory structure, providing flexibility and modularity.
- Supports dot-based middleware inclusion: You can specify additional middleware to be applied based on specific filenames, allowing for fine-grained control over middleware execution.

## Installation

Install the package using npm:

```shell
npm install express-tree-routing
```

## **Usage**

```shell
const express = require('express');
const treeRouting = require('express-tree-routing');
const path = require("path");

const app = express();
const router = express.Router();

// Specify the base directory of your routers
const baseDirectory = path.join(__dirname, "routers");

// Configure tree routing module
const registeredRoutes = treeRouting(baseDirectory, router);

// Attach the router to your Express app
app.use(registeredRoutes);
// or
app.use("/api", registeredRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
```

## **Example**

Let's consider the following directory structure:

```
├── routes
│   ├── users
│   │   ├── middleware.js
│   │   └── index.js
│   ├── posts
|   |   ├── :POST_ID
|   |   |   ├── comments
|   |   |   |   ├── :COMMENT_ID
|   |   |   |   |   ├── replies
|   |   |   |   |   |   ├── :REPLY_ID.js
|   |   |   |   |   |   └── index.js
|   |   |   |   |   └── index.js
|   |   |   └── author.js
│   │   ├── middleware.js
│   │   └── index.js
│   ├── middleware.js
│   ├── tuturials.js
│   └── index.js
```

- Each directory represents a route, and the corresponding index.js file inside the directory defines the index route.
- The middleware.js files contain middleware specific to that directory or route.
- The routes/middleware.js file contains middleware that applies to all routes in that directory.

Each file in directories except `middleware.js` (example: index.js, comments.js) must return the router which passed to it by module as below:

```shell
module.exports = (router) => {
  router.get(/* arguments */);
  return router;
}
```

The `treeRouting` function will automatically scan base directory structure and configure the routes and middleware accordingly.

For a detailed guide on organizing your project's directory structure and configuring routes and middleware using Express Tree Routing Middleware, please refer to the [documentation](https://github.com/amirrivand/express-tree-routing/docs).

## **Contributing**

Contributions are welcome! Please feel free to submit any bug fixes, enhancements, or feature requests via GitHub issues and pull requests.
