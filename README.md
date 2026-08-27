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

## Project Structure

```
sorosim-backend/
├── src/
│   ├── config/
│   │   └── multer.ts          # Multer configuration for file uploads
│   ├── controllers/
│   │   └── wasmController.ts  # WASM upload controller
│   ├── engine/
│   │   ├── sorobanClient.ts   # Soroban RPC client wrapper
│   │   └── index.ts           # Engine exports
│   ├── routes/
│   │   └── wasmRoutes.ts      # WASM API routes
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
