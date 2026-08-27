# SoroSim Backend

Soroban Contract Simulation & Dry-Run Sandbox Backend - A REST API for simulating Soroban smart contract invocations with mock ledger state.

## Features

- **Stellar SDK Integration**: Full integration with @stellar/stellar-sdk for Soroban contract simulation
- Simulate Soroban contract invocations without testnet
- Mock ledger state management
- Visual state inspection and diff tracking
- Session-based simulation history
- WASM upload and contract ABI parsing

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Copy environment template
cp .env.example .env

# Run in development mode
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check

## Project Structure

```
sorosim-backend/
├── src/
│   └── index.ts       # Main application entry point
├── dist/              # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
