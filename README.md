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

### General
- `GET /` - API information
- `GET /health` - Health check with Soroban RPC connection status

### WASM Management
- `POST /api/wasm/upload` - Upload a WASM contract file
  - Content-Type: `multipart/form-data`
  - Field name: `wasm`
  - Accepts: `.wasm` files (max 10 MB)
  - Returns: File metadata including SHA-256 hash

### Mock Ledger Store
- `GET /api/ledger/stats` - Get ledger store statistics
- `GET /api/ledger/entries` - Get all ledger entries
- `GET /api/ledger/entries/:key` - Get a specific ledger entry by key
- `GET /api/ledger/sequence` - Get current ledger sequence number
- `DELETE /api/ledger/clear` - Clear all ledger entries

### Example: Upload WASM

```bash
curl -X POST http://localhost:3000/api/wasm/upload \
  -F "wasm=@/path/to/contract.wasm"
```

Response:
```json
{
  "success": true,
  "message": "WASM file uploaded successfully",
  "data": {
    "filename": "contract.wasm",
    "size": 45678,
    "hash": "a1b2c3d4...",
    "uploadedAt": "2026-08-27T10:30:00.000Z"
  }
}
```

### Example: Get Ledger Stats

```bash
curl http://localhost:3000/api/ledger/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalEntries": 5,
    "currentLedgerSeq": 1,
    "entriesByType": {
      "account": 2,
      "contractData": 3
    }
  }
}
```

## Project Structure

```
sorosim-backend/
├── src/
│   ├── config/
│   │   └── multer.ts          # Multer configuration for file uploads
│   ├── controllers/
│   │   ├── wasmController.ts  # WASM upload controller
│   │   └── ledgerController.ts # Ledger store controller
│   ├── engine/
│   │   ├── sorobanClient.ts   # Soroban RPC client wrapper
│   │   └── index.ts           # Engine exports
│   ├── routes/
│   │   ├── wasmRoutes.ts      # WASM API routes
│   │   └── ledgerRoutes.ts    # Ledger store API routes
│   ├── store/
│   │   └── mockLedgerStore.ts # In-memory ledger state store
│   ├── types/
│   │   └── ledger.ts          # Ledger entry type definitions
│   ├── utils/
│   │   └── wasmValidator.ts   # WASM file validation utilities
│   └── index.ts               # Main application entry point
├── dist/                      # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
