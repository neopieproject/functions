# Neo Pie Functions

This project contains serverless functions for interacting with blockchain networks, specifically NEO and EVM-compatible chains. It uses AWS Lambda and Serverless Framework to deploy and manage the functions.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Serverless Framework installed globally (`npm install -g serverless`)

## Setup

1. Install dependencies:

    ```sh
    npm install
    ```

2. Configure AWS credentials:

    ```sh
    aws configure
    ```

3. Create an AWS profile named `neopie` on your local machine.

## Environment Variables

The project uses AWS Secrets Manager to manage sensitive environment variables. Ensure the following secrets are set in Secrets Manager:

- `EVM_PRIVATEKEY`: EVM private key
- `NEO_PRIVATEKEY`: N3 private key

## Scripts

- `local`: Run the serverless functions locally
- `deploy`: Deploy the serverless functions to AWS
- `runMint`: Invoke the `mint` function locally
- `runUnlock`: Invoke the `unlock` function locally

## Usage

### Deploying the Functions

To deploy the functions to AWS, run:

```sh
npm run deploy
```

### Running Functions Locally

To run the functions locally, use the following commands:

- Mint function:

    ```sh
    npm run runMint
    ```

- Unlock function:

    ```sh
    npm run runUnlock
    ```

## Functions

### Mint

The `mint` function interacts with the Heimdall contract on an EVM chain to mint tokens.

### Unlock

The `unlock` function interacts with the N3 blockchain to unlock tokens.

## Project Structure

```
serverless.ts
src/
    abi/
        Heimdall.json
    consts/
        index.ts
    functions/
        actions.ts
        handler.ts
        heimdall.ts
        helpers.ts
        index.ts
        teleport.ts
    interfaces.ts
    utils/
        handler-resolver.ts
        neo-core.ts
        parser.ts
```

## Code Overview

### `serverless.ts`

This file contains the Serverless Framework configuration, including the definition of functions, plugins, and environment variables.

### `src/functions`

This directory contains the implementation of the serverless functions.

- `actions.ts`: Contains the main logic for the functions.
- `handler.ts`: Exports the functions for Serverless Framework.
- `heimdall.ts`: Interacts with the Heimdall contract.
- `teleport.ts`: Interacts with the NEO blockchain.

### `src/utils`

This directory contains utility functions and classes.

- `neo-core.ts`: Contains the `Neo` class for interacting with the NEO blockchain.
- `parser.ts`: Contains helper functions for parsing blockchain responses.

### `src/abi`

This directory contains the ABI (Application Binary Interface) for the Heimdall contract.

## License

This project is licensed under the MIT License.