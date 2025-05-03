# tx-gallery-api

This is the backend API for a Twitter/X post gallery application. It handles data management, authentication, and interaction with the Twitter/X platform via the `rettiwt-api`.

## Description

This project provides the necessary server-side logic for an application designed to view and sync image posts from Twitter/X.

##  Features

*   **RESTful API:** Provides endpoints for frontend interaction.
*   **Twitter/X Integration:** Fetches post data using `rettiwt-api`.
*   **Data Persistence:** Stores data using MongoDB via Mongoose.
*   **Input Validation:** Uses Joi and validator.js to ensure data integrity.
*   **Logging:** Configured logging using Winston.


##  Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Node.js:** Version `22`
*   **MongoDB:** A running MongoDB instance (local or remote)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jsncrz/tx-gallery-api.git
2.  **Navigate to the project directory:**
    ```bash
    cd tx-gallery-api
    ```
3.  **Install NPM packages:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
   
    Create a `.env` file in the root directory. Copy the contents of .env.example` or add the necessary variables.


##  Usage

### Development

To run the server in development mode with hot-reloading:

```bash
npm run dev
```
The API should now be running, typically on http://localhost:3000 (or the port specified in your .env).

### Production
#### Build the project: 
This transpiles TypeScript to JavaScript in the dist directory.
```
npm run build
```
#### Start the application using PM2: 
This command reads the ecosystem.config.json file to manage the process.
```
npm start
```
#### Alternatively, you can build and start in one command:
```
npm run start:build
```

## Acknowledgements
- [Rettiwt API](https://github.com/Rishikant181/Rettiwt-API) - for allowing easy access to Twitter/X posts
- [Node Express Boilerplate](https://github.com/hagopj13/node-express-boilerplate) - for the initial setup of the project
