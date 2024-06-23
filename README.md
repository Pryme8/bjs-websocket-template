# BJS Websocket Template with Vite and React

This project serves as a simple example of how to integrate Vite, WebSockets, and React. It demonstrates the setup necessary for developing a real-time application using WebSockets for communication, Vite for the build tooling and development server, and React for the user interface.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have Node.js installed on your system. This project requires Node.js version 14.x or higher.

### Installation

To set up the project, follow these steps:

1. Clone the repository:
```
git clone https://your-repository-url.git
```

2. Navigate to the project directory:
```
cd bjs-websocket-template
```

3. Install the necessary dependencies:
```
npm install
```

### Running the Project

The project includes several npm scripts to facilitate development:

- **Start Development Server**: To run both the client and server in development mode with hot reloading, use:
```
npm run dev
```
This command uses `concurrently` to run both `npm run dev:client` for the Vite server and `npm run dev:server` for the Node.js server using Nodemon.

- **Client Development**: To run only the client-side development server provided by Vite, use:
```
npm run dev:client
```

- **Server Development**: To run the server in development mode with Nodemon, which automatically restarts the server on code changes, use:
```
npm run dev:server
```

- **Build**: To compile the project for production, use:
```
npm run build
```

- **Lint**: To lint your code and check for errors, run:
```
npm run lint
```

- **Preview**: To preview the production build, use:
```
npm run preview
```

### Project Structure

- `src/client`: Contains the React application.
- `src/server`: Contains the WebSocket server implemented with Express and `ws`.

### Node-Runner and Nodemon Explanation

The node-runner.js script plays a pivotal role in our development setup, particularly in enhancing the support for ts-node, which allows TypeScript to be executed directly in a Node.js environment without prior compilation to JavaScript. Here's a simplified and more readable explanation of its components and functionalities:

**ViteNodeServer Initialization**: The script initializes a [`ViteNodeServer`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode_modules%2Fvite-node%2Fdist%2Fserver.d.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A40%2C%22character%22%3A4%7D%5D "node_modules/vite-node/dist/server.d.ts") instance. This server is responsible for handling module resolution, plugin initialization, and serving files with Vite's powerful features like hot module replacement and efficient bundling.

**Sourcemaps Support**: It installs support for sourcemaps via [`installSourcemapsSupport`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode_modules%2Fvite-node%2Fdist%2Fsource-map.d.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A11%2C%22character%22%3A0%7D%5D "node_modules/vite-node/dist/source-map.d.ts"). This is essential for debugging, as it ensures that errors point to the correct line numbers in the original source files, rather than the compiled output.

**ViteNodeRunner Creation**: The script creates a [`ViteNodeRunner`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode_modules%2Fvite-node%2Fdist%2Findex-O2IrwHKf.d.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A171%2C%22character%22%3A4%7D%5D "node_modules/vite-node/dist/index-O2IrwHKf.d.ts") instance. This runner is designed to execute Node.js scripts within the Vite environment, allowing developers to leverage Vite's module resolution and hot reloading capabilities in server-side code.

**Module Fetching and Resolution**: The runner includes custom functions for fetching and resolving modules ([`fetchModule`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode_modules%2Fvite-node%2Fdist%2Findex-O2IrwHKf.d.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A260%2C%22character%22%3A4%7D%5D "node_modules/vite-node/dist/index-O2IrwHKf.d.ts") and [`resolveId`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode_modules%2Fvite-node%2Fdist%2Findex-O2IrwHKf.d.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A261%2C%22character%22%3A4%7D%5D "node_modules/vite-node/dist/index-O2IrwHKf.d.ts")). These functions ensure that modules are loaded correctly, taking advantage of Vite's optimization strategies.

**Nodemon Integration**: While not explicitly mentioned in the excerpt, integrating Nodemon with this setup enhances the development experience by automatically restarting the Node.js application when file changes in the directory are detected. This is particularly useful in a development environment where changes are frequent, and manual restarts would be cumbersome.

Together, [`node-runner.js`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fd%3A%2FgitHUB%2Fbjs-websocket-template%2Fnode-runner.js%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "d:\gitHUB\bjs-websocket-template\node-runner.js") and Nodemon streamline the development process, making it more efficient and developer-friendly by automating tasks like module resolution, error mapping, and application restarting.

***THAT BEING SAID***
----
That entire last section was generated by AI and is a load of garbage...  I had to use vite-node because my ts-node was not letting me import modules.  So I went with what our grate and powerful AI overlords suggested.  Forget all that other jargon, you still have to refresh to sterilize the state and connect to the websocket otherwise everything breaks.  Don't listen to AI it will give you cancer.

## Contributing

Contributions are welcome. Please feel free to submit pull requests or open issues to discuss proposed changes or additions.

## License

This project is open source and available under the MIT License.