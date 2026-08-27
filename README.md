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

### Network Configuration
- `GET /api/networks` - Get all available networks (testnet, futurenet, mainnet, custom)
- `GET /api/networks/default` - Get the default network configuration
- `GET /api/networks/:id` - Get a specific network by ID
- `PUT /api/networks/default/:id` - Set the default network
- `POST /api/networks` - Add or update a custom network
  - Body: `{ "id": "my-network", "name": "My Network", "rpcUrl": "https://...", "networkPassphrase": "...", "description": "..." }`
- `DELETE /api/networks/:id` - Delete a custom network (cannot delete predefined networks)

### State Diff Calculator
- `GET /api/diff/snapshot` - Capture current ledger state snapshot
- `POST /api/diff/calculate` - Calculate diff between two ledger snapshots
  - Body: `{ "before": <snapshot>, "after": <snapshot> }`
- `POST /api/diff/from-snapshot` - Calculate diff from a snapshot to current state
  - Body: `{ "snapshot": <snapshot> }`
- `GET /api/diff/before` - Helper endpoint to start before/after diff workflow

### Event Extraction
- `POST /api/events/extract` - Extract and parse contract events from raw simulation events
  - Body: `{ "events": [ ... ] }`
- `POST /api/events/stats` - Get event statistics (count by type, by contract)
  - Body: `{ "events": [ ... ] }`
- `POST /api/events/filter/type` - Filter events by type (contract, system, diagnostic, unknown)
  - Body: `{ "events": [ ... ], "type": "contract" }`
- `POST /api/events/filter/contract` - Filter events by contract ID
  - Body: `{ "events": [ ... ], "contractId": "CA3D5..." }`
- `POST /api/events/group` - Group events by contract ID
  - Body: `{ "events": [ ... ] }`

### WASM Management
- `POST /api/wasm/upload` - Upload a WASM contract file
  - Content-Type: `multipart/form-data`
  - Field name: `wasm`
  - Accepts: `.wasm` files (max 10 MB)
  - Returns: File metadata including SHA-256 hash and extracted ABI (contract functions)
- `POST /api/wasm/analyze` - Analyze WASM from base64 string
  - Content-Type: `application/json`
  - Body: `{ "wasmBase64": "..." }`
  - Returns: WASM analysis with contract functions, exports, and imports

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

### Account Entries
- `GET /api/accounts` - Get all account entries
- `GET /api/accounts/:accountId` - Get account by ID
- `POST /api/accounts` - Create or update an account entry
- `POST /api/accounts/defaults` - Create account with default values

### Contract Entries
- `GET /api/contracts/data` - Get all contract data entries
- `POST /api/contracts/data` - Create or update contract data entry
- `POST /api/contracts/data/defaults` - Create contract data with defaults
- `GET /api/contracts/code` - Get all contract code entries
- `POST /api/contracts/code` - Create or update contract code entry
- `POST /api/contracts/code/defaults` - Create contract code with defaults

### Ledger Snapshots
- `GET /api/snapshots` - List all available snapshot files
- `POST /api/snapshots/create` - Create a snapshot of current ledger state (returns JSON)
- `POST /api/snapshots/save` - Save current ledger state to file
- `POST /api/snapshots/load` - Load snapshot from file
- `POST /api/snapshots/import` - Load snapshot from JSON body
- `GET /api/snapshots/export` - Export current ledger state as downloadable JSON file
- `DELETE /api/snapshots/:filename` - Delete a snapshot file

### Simulation Sessions
- `POST /api/sessions` - Create a new simulation session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/active` - Get active sessions
- `GET /api/sessions/:sessionId` - Get a specific session (add `?includeHistory=true` for invocations)
- `GET /api/sessions/:sessionId/stats` - Get session statistics (invocation counts, success rates, etc.)
- `GET /api/sessions/:sessionId/export` - Export session history as downloadable JSON file
- `PUT /api/sessions/:sessionId/status` - Update session status (active/idle/closed)
- `PUT /api/sessions/:sessionId/metadata` - Update session metadata
- `DELETE /api/sessions/:sessionId` - Delete a session
- `GET /api/sessions/:sessionId/invocations` - Get session invocations (add `?limit=10` to limit results)
- `POST /api/sessions/cleanup` - Clean up inactive sessions

### Contract Simulation
- `POST /api/simulate` - Simulate a Soroban contract invocation
  - Content-Type: `application/json`
  - Body parameters:
    - `contractId` (required): Contract address
    - `method` (required): Contract function name
    - `args` (optional): Array of function arguments
    - `source` (optional): Source account public key
    - `fee` (optional): Transaction fee in stroops
  - Query parameters:
    - `sessionId` (optional): Session ID to log invocation to
    - `networkId` (optional): Network ID to use for simulation (defaults to configured default network)
  - Returns: Simulation result with events, auth requirements, resource costs, and state diff

### Example: Upload WASM

```bash
curl -X POST http://localhost:3000/api/wasm/upload \
  -F "wasm=@/path/to/contract.wasm"
```

Response:
```json
{
  "success": true,
  "message": "WASM file uploaded and analyzed successfully",
  "data": {
    "filename": "contract.wasm",
    "size": 45678,
    "hash": "a1b2c3d4...",
    "uploadedAt": "2026-08-27T10:30:00.000Z",
    "abi": {
      "functions": ["increment", "get_count", "reset"],
      "exports": ["increment", "get_count", "reset", "memory", "__data_end"],
      "imports": ["env.abort"]
    }
  }
}
```

### Example: Analyze WASM

```bash
curl -X POST http://localhost:3000/api/wasm/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "wasmBase64": "AGFzbQEAAAABB..."
  }'
```

Response:
```json
{
  "success": true,
  "message": "WASM analyzed successfully",
  "data": {
    "size": 45678,
    "hash": "a1b2c3d4...",
    "valid": true,
    "abi": {
      "functions": ["increment", "get_count"],
      "exports": ["increment", "get_count", "memory"],
      "imports": ["env.abort"],
      "metadata": {}
    }
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

### Example: Save Ledger Snapshot

```bash
curl -X POST http://localhost:3000/api/snapshots/save \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "my-snapshot.json",
    "networkPassphrase": "Test SDF Network ; September 2015"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Snapshot saved to file successfully",
  "data": {
    "filePath": "/path/to/snapshots/my-snapshot.json",
    "snapshot": {
      "version": "1.0",
      "createdAt": "2026-08-27T10:30:00.000Z",
      "ledgerSequence": 123,
      "networkPassphrase": "Test SDF Network ; September 2015",
      "entries": [...]
    }
  }
}
```

### Example: Load Ledger Snapshot

```bash
curl -X POST http://localhost:3000/api/snapshots/load \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "my-snapshot.json",
    "clearExisting": true
  }'
```

Response:
```json
{
  "success": true,
  "message": "Snapshot loaded successfully",
  "data": {
    "entriesLoaded": 10,
    "ledgerSequence": 123,
    "createdAt": "2026-08-27T10:30:00.000Z"
  }
}
```

### Example: Create Simulation Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Session",
    "description": "Testing contract functions",
    "networkPassphrase": "Test SDF Network ; September 2015",
    "tags": ["testing", "development"]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-08-27T10:30:00.000Z",
    "lastActivityAt": "2026-08-27T10:30:00.000Z",
    "status": "active",
    "networkPassphrase": "Test SDF Network ; September 2015",
    "metadata": {
      "name": "My Test Session",
      "description": "Testing contract functions",
      "tags": ["testing", "development"]
    },
    "invocationCount": 0
  }
}
```

### Example: Get Session with History

```bash
curl http://localhost:3000/api/sessions/550e8400-e29b-41d4-a716-446655440000?includeHistory=true
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-08-27T10:30:00.000Z",
    "lastActivityAt": "2026-08-27T10:35:00.000Z",
    "status": "active",
    "invocationCount": 3,
    "invocations": [
      {
        "timestamp": "2026-08-27T10:31:00.000Z",
        "requestId": "...",
        "contractId": "CA3D5...",
        "method": "increment",
        "args": [],
        "result": { "success": true, "..." },
        "duration": 150
      }
    ]
  }
}
```

### Example: Simulate with Session Logging

```bash
curl -X POST "http://localhost:3000/api/simulate?sessionId=550e8400-e29b-41d4-a716-446655440000" \
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
    "stateDiff": { "..." }
  },
  "requestId": "abc-123",
  "timestamp": "2026-08-27T10:31:00.000Z",
  "duration": 150,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Example: Get All Networks

```bash
curl http://localhost:3000/api/networks
```

Response:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "testnet",
      "name": "Stellar Testnet",
      "type": "testnet",
      "rpcUrl": "https://soroban-testnet.stellar.org",
      "networkPassphrase": "Test SDF Network ; September 2015",
      "description": "Official Stellar testnet for development and testing",
      "isDefault": true
    },
    {
      "id": "futurenet",
      "name": "Stellar Futurenet",
      "type": "futurenet",
      "rpcUrl": "https://rpc-futurenet.stellar.org",
      "networkPassphrase": "Test SDF Future Network ; October 2022",
      "description": "Experimental network for testing upcoming features"
    },
    {
      "id": "mainnet",
      "name": "Stellar Mainnet",
      "type": "mainnet",
      "rpcUrl": "https://mainnet.stellar.validationcloud.io/v1",
      "networkPassphrase": "Public Global Stellar Network ; September 2015",
      "description": "Production Stellar mainnet - use with caution"
    }
  ]
}
```

### Example: Add Custom Network

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "local-dev",
    "name": "Local Development",
    "rpcUrl": "http://localhost:8000/soroban/rpc",
    "networkPassphrase": "Standalone Network ; February 2017",
    "description": "Local Stellar quickstart instance for development"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Network added successfully",
  "data": {
    "id": "local-dev",
    "name": "Local Development",
    "type": "custom",
    "rpcUrl": "http://localhost:8000/soroban/rpc",
    "networkPassphrase": "Standalone Network ; February 2017",
    "description": "Local Stellar quickstart instance for development",
    "isDefault": false
  }
}
```

### Example: Set Default Network

```bash
curl -X PUT http://localhost:3000/api/networks/default/futurenet
```

Response:
```json
{
  "success": true,
  "message": "Default network updated successfully",
  "data": {
    "id": "futurenet",
    "name": "Stellar Futurenet",
    "type": "futurenet",
    "rpcUrl": "https://rpc-futurenet.stellar.org",
    "networkPassphrase": "Test SDF Future Network ; October 2022",
    "description": "Experimental network for testing upcoming features",
    "isDefault": true
  }
}
```

### Example: Simulate with Specific Network

```bash
curl -X POST "http://localhost:3000/api/simulate?networkId=futurenet" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
    "method": "increment",
    "args": []
  }'
```

Response: (same as regular simulate, but uses futurenet network)

### Example: Capture Ledger Snapshot

```bash
curl http://localhost:3000/api/diff/snapshot
```

Response:
```json
{
  "success": true,
  "message": "Ledger snapshot captured successfully",
  "data": {
    "timestamp": "2026-08-27T10:30:00.000Z",
    "ledgerSequence": 123,
    "entries": [
      {
        "key": "account:GABC...",
        "type": "account",
        "accountId": "GABC...",
        "balance": "10000000000",
        "sequence": "123456"
      },
      {
        "key": "contractData:CA3D5...:counter",
        "type": "contractData",
        "contract": "CA3D5...",
        "storageKey": "counter",
        "value": "42"
      }
    ]
  }
}
```

### Example: Calculate Before/After Diff

```bash
# Step 1: Capture before snapshot
BEFORE=$(curl -s http://localhost:3000/api/diff/snapshot | jq '.data')

# Step 2: Make changes to ledger (e.g., update account balance)
curl -X PUT http://localhost:3000/api/ledger/entries/account:GABC... \
  -H "Content-Type: application/json" \
  -d '{ "balance": "20000000000" }'

# Step 3: Capture after snapshot
AFTER=$(curl -s http://localhost:3000/api/diff/snapshot | jq '.data')

# Step 4: Calculate diff
curl -X POST http://localhost:3000/api/diff/calculate \
  -H "Content-Type: application/json" \
  -d "{\"before\": $BEFORE, \"after\": $AFTER}"
```

Response:
```json
{
  "success": true,
  "message": "Diff calculated successfully",
  "data": {
    "before": {
      "timestamp": "2026-08-27T10:30:00.000Z",
      "ledgerSequence": 123,
      "entryCount": 2
    },
    "after": {
      "timestamp": "2026-08-27T10:31:00.000Z",
      "ledgerSequence": 123,
      "entryCount": 2
    },
    "diff": {
      "ledgerEntryChanges": [
        {
          "key": "account:GABC...",
          "type": "account",
          "changeType": "updated",
          "before": {
            "balance": "10000000000",
            "sequence": "123456"
          },
          "after": {
            "balance": "20000000000",
            "sequence": "123456"
          },
          "diff": {
            "balance": {
              "before": "10000000000",
              "after": "20000000000"
            }
          }
        }
      ],
      "storageChanges": [],
      "balanceChanges": [
        {
          "accountId": "GABC...",
          "assetType": "native",
          "changeType": "updated",
          "before": "10000000000",
          "after": "20000000000",
          "delta": "10000000000"
        }
      ],
      "events": [],
      "summary": {
        "totalChanges": 1,
        "entriesCreated": 0,
        "entriesUpdated": 1,
        "entriesDeleted": 0,
        "eventsEmitted": 0
      }
    }
  }
}
```

### Example: Diff from Snapshot to Current

```bash
# Capture a snapshot
SNAPSHOT=$(curl -s http://localhost:3000/api/diff/snapshot | jq '.data')

# Make some changes...
curl -X POST http://localhost:3000/api/accounts/defaults

# Calculate diff from snapshot to current state
curl -X POST http://localhost:3000/api/diff/from-snapshot \
  -H "Content-Type: application/json" \
  -d "{\"snapshot\": $SNAPSHOT}"
```

Response: (similar to calculate endpoint, comparing provided snapshot to current state)

### Example: Extract Events from Simulation

```bash
# Extract and parse events from a simulation result
curl -X POST http://localhost:3000/api/events/extract \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "type": "contract",
        "contractId": "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
        "topics": ["increment"],
        "data": { "counter": 42 }
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Events extracted successfully",
  "data": {
    "events": [
      {
        "index": 0,
        "type": "contract",
        "contractId": "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
        "topics": ["increment"],
        "data": { "counter": 42 },
        "raw": { ... }
      }
    ],
    "count": 1
  }
}
```

### Example: Get Event Statistics

```bash
curl -X POST http://localhost:3000/api/events/stats \
  -H "Content-Type: application/json" \
  -d '{
    "events": [...]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Event statistics calculated successfully",
  "data": {
    "total": 5,
    "byType": {
      "contract": 4,
      "system": 1
    },
    "byContract": {
      "CA3D5...": 3,
      "CB4E6...": 2
    }
  }
}
```

### Example: Filter Events by Type

```bash
curl -X POST http://localhost:3000/api/events/filter/type \
  -H "Content-Type: application/json" \
  -d '{
    "events": [...],
    "type": "contract"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Events filtered by type: CONTRACT",
  "data": {
    "events": [...],
    "count": 4,
    "originalCount": 5
  }
}
```

### Example: Group Events by Contract

```bash
curl -X POST http://localhost:3000/api/events/group \
  -H "Content-Type: application/json" \
  -d '{
    "events": [...]
  }'
```

Response:
```json
{
  "success": true,
  "message": "Events grouped by contract successfully",
  "data": {
    "groups": {
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE": [
        { "index": 0, "type": "contract", ... },
        { "index": 2, "type": "contract", ... }
      ],
      "CB4E6...": [
        { "index": 1, "type": "contract", ... }
      ]
    },
    "contractCount": 2,
    "totalEvents": 3
  }
}
```




### Example: Get Session Statistics

```bash
curl http://localhost:3000/api/sessions/550e8400-e29b-41d4-a716-446655440000/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "totalInvocations": 25,
    "successfulInvocations": 23,
    "failedInvocations": 2,
    "averageDuration": 145.6,
    "uniqueContracts": 3,
    "uniqueMethods": 5,
    "firstInvocation": "2026-08-27T10:30:00.000Z",
    "lastInvocation": "2026-08-27T10:45:00.000Z"
  }
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
