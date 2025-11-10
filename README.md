# Fractionalized NFT Real Estate Marketplace

This is a full-stack application that allows users to buy and sell fractionalized NFTs representing real estate properties. The project consists of a Next.js frontend and a Hardhat development environment for the Ethereum smart contracts.

## Project Structure

The project is organized into two main directories:

-   `frontend`: Contains the Next.js application that provides the user interface for the marketplace.
-   `backend`: Contains the Hardhat project with the Solidity smart contracts that power the backend of the marketplace.

## Getting Started

To get started with this project, you'll need to set up both the frontend and the smart contracts.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   [npm](https://www.npmjs.com/)

### Smart Contracts (`backend`)

1.  **Navigate to the `backend` directory:**

    ```bash
    cd backend
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Compile the smart contracts:**

    ```bash
    npx hardhat compile
    ```

4.  **Run the local Hardhat node:**

    ```bash
    npx hardhat node
    ```

5.  **Deploy the contracts to the local network:**

    ```bash
    npx hardhat run scripts/deploy.ts --network localhost
    ```

### Frontend (`frontend`)

1.  **Navigate to the `frontend` directory:**

    ```bash
    cd frontend
    ```

2.  **Install the dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

4.  **Open your browser to [http://localhost:3000](http://localhost:3000) to see the application.**

## Available Scripts

### `backend`

-   `npm test`: Runs the smart contract tests.
-   `npx hardhat compile`: Compiles the smart contracts.
-   `npx hardhat node`: Starts a local Hardhat node.
-   `npx hardhat run scripts/deploy.ts --network localhost`: Deploys the contracts to the local network.

### `frontend`

-   `npm run dev`: Starts the development server.
--  `npm run build`: Builds the application for production.
-   `npm start`: Starts the production server.
-   `npm run lint`: Lints the code.
