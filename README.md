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
- `GET /api/ledger/entries/type/:type` - Get entries by type (account, contractData, contractCode, etc.)
- `GET /api/ledger/entries/:key` - Get a specific ledger entry by key
- `POST /api/ledger/entries` - Create or update a ledger entry
- `PUT /api/ledger/entries/:key` - Update an existing ledger entry
- `DELETE /api/ledger/entries/:key` - Delete a specific ledger entry
- `DELETE /api/ledger/clear` - Clear all ledger entries
- `GET /api/ledger/sequence` - Get current ledger sequence number
- `PUT /api/ledger/sequence` - Set ledger sequence number
- `POST /api/ledger/sequence/increment` - Increment ledger sequence number

### Contract Simulation
- `POST /api/simulate` - Simulate a Soroban contract invocation
  - Content-Type: `application/json`
  - Body parameters:
    - `contractId` (required): Contract address
    - `method` (required): Contract function name
    - `args` (optional): Array of function arguments
    - `source` (optional): Source account public key
    - `fee` (optional): Transaction fee in stroops
  - Returns: Simulation result with events, auth requirements, and resource costs

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

### Example: Create Ledger Entry

```bash
curl -X POST http://localhost:3000/api/ledger/entries \
  -H "Content-Type: application/json" \
  -d '{
    "type": "account",
    "accountId": "GABC...",
    "balance": "10000000000",
    "sequence": "123456",
    "numSubEntries": 0,
    "flags": 0,
    "thresholds": {
      "low": 1,
      "medium": 1,
      "high": 1
    }
  }'
```

Response:
```json
{
  "success": true,
  "message": "Ledger entry created/updated successfully",
  "data": {
    "type": "account",
    "key": "account:GABC...",
    "accountId": "GABC...",
    "balance": "10000000000",
    "sequence": "123456",
    "numSubEntries": 0,
    "flags": 0,
    "thresholds": {
      "low": 1,
      "medium": 1,
      "high": 1
    },
    "lastModifiedLedgerSeq": 1
  }
}
```

### Example: Update Ledger Entry

```bash
curl -X PUT http://localhost:3000/api/ledger/entries/account:GABC... \
  -H "Content-Type: application/json" \
  -d '{
    "balance": "20000000000",
    "sequence": "123457"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Ledger entry updated successfully",
  "data": {
    "type": "account",
    "key": "account:GABC...",
    "accountId": "GABC...",
    "balance": "20000000000",
    "sequence": "123457",
    "numSubEntries": 0,
    "flags": 0,
    "thresholds": {
      "low": 1,
      "medium": 1,
      "high": 1
    },
    "lastModifiedLedgerSeq": 1
  }
}
```

### Example: Delete Ledger Entry

```bash
curl -X DELETE http://localhost:3000/api/ledger/entries/account:GABC...
```

Response:
```json
{
  "success": true,
  "message": "Ledger entry deleted successfully",
  "key": "account:GABC..."
}
```

### Example: Simulate Contract Invocation

```bash
curl -X POST http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
    "method": "increment",
    "args": []
  }'
```

Response:
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "data": {
    "success": true,
    "result": "...",
    "events": [],
    "transactionData": "...",
    "minResourceFee": "100",
    "latestLedger": 12345,
    "stateDiff": {
      "ledgerEntryChanges": [
        {
          "key": "footprint:changed",
          "type": "footprint",
          "changeType": "updated"
        }
      ],
      "storageChanges": [
        {
          "contract": "unknown",
          "key": "footprint:changed",
          "durability": "persistent",
          "changeType": "updated"
        }
      ],
      "balanceChanges": [],
      "events": [],
      "summary": {
        "totalChanges": 1,
        "entriesCreated": 0,
        "entriesUpdated": 1,
        "entriesDeleted": 0,
        "eventsEmitted": 0
      }
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-08-27T10:30:00.000Z"
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
│   │   ├── ledgerController.ts # Ledger store controller
│   │   └── simulationController.ts # Simulation controller
│   ├── engine/
│   │   ├── sorobanClient.ts   # Soroban RPC client wrapper
│   │   └── index.ts           # Engine exports
│   ├── routes/
│   │   ├── wasmRoutes.ts      # WASM API routes
│   │   ├── ledgerRoutes.ts    # Ledger store API routes
│   │   └── simulationRoutes.ts # Simulation API routes
│   ├── services/
│   │   └── simulationService.ts # Contract simulation service
│   ├── store/
│   │   └── mockLedgerStore.ts # In-memory ledger state store
│   ├── types/
│   │   ├── ledger.ts          # Ledger entry type definitions
│   │   └── simulation.ts      # Simulation type definitions
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
