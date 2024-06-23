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

## Contributing

Contributions are welcome. Please feel free to submit pull requests or open issues to discuss proposed changes or additions.

## License

This project is open source and available under the MIT License.