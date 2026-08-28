# SoroSim CLI

Command-line interface for the SoroSim Soroban Contract Simulation & Dry-Run Sandbox.

## Installation

```bash
# Install dependencies
npm install

# Build the CLI
npm run build:cli

# Run locally
npm run cli -- [command]

# Or install globally
npm install -g .
sorosim --help
```

## Configuration

The CLI connects to the SoroSim backend API. You can configure the backend URL:

```bash
# Using environment variable
export SOROSIM_API_URL=http://localhost:3000

# Using command-line flag
sorosim --url http://localhost:3000 [command]
```

## Commands

### Simulate Contract Invocation

```bash
# Basic simulation with contract ID
sorosim simulate \
  --contract CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE \
  --method increment

# Simulate with WASM file upload
sorosim simulate \
  --wasm ./path/to/contract.wasm \
  --method increment \
  --show-abi

# With arguments (JSON format)
sorosim simulate \
  --contract CA3D5... \
  --method transfer \
  --args '[{"type": "address", "value": "GABC..."}, 100]'

# With individual arguments (auto-typed)
sorosim simulate \
  --contract CA3D5... \
  --method add \
  --arg 10 --arg 20

# Mixed types with auto-detection
sorosim simulate \
  --contract CA3D5... \
  --method process \
  --arg hello --arg 42 --arg true --arg null

# With network and session
sorosim simulate \
  --contract CA3D5... \
  --method get_balance \
  --network testnet \
  --session 550e8400-e29b-41d4-a716-446655440000

# Upload WASM and simulate in one command
sorosim simulate \
  --wasm ./counter.wasm \
  --method increment \
  --arg 1 \
  --show-abi

# JSON output
sorosim --json simulate --contract CA3D5... --method increment
```

**Simulate Options:**
- `-c, --contract <id>` - Contract ID (required unless --wasm is provided)
- `-w, --wasm <path>` - Path to WASM file to upload and use
- `-m, --method <name>` - Contract method name (required)
- `-a, --args <json>` - Arguments as JSON array (e.g., `'[1, "hello", true]'`)
- `--arg <value...>` - Individual arguments with auto-type detection. Can be used multiple times
- `-s, --source <account>` - Source account public key
- `-f, --fee <amount>` - Transaction fee in stroops
- `-n, --network <id>` - Network ID to use for simulation
- `--session <id>` - Session ID to log simulation to
- `--show-abi` - Show contract ABI after WASM upload

**Argument Auto-Typing:**
The `--arg` flag automatically detects types:
- Numbers: `--arg 42` → `42`
- Strings: `--arg hello` → `"hello"`
- Booleans: `--arg true` → `true`
- Null: `--arg null` → `null`
- JSON: `--arg '{"key":"value"}' → `{"key":"value"}`

### Ledger Management

```bash
# Get ledger statistics
sorosim ledger stats

# List all ledger entries
sorosim ledger list

# List entries by type
sorosim ledger list --type account

# Clear all entries (requires confirmation)
sorosim ledger clear --yes
```

### Session Management

```bash
# List all sessions
sorosim session list

# List only active sessions
sorosim session list --active

# Create a new session
sorosim session create --name "My Test Session" --description "Testing increment function"

# Get session details
sorosim session info 550e8400-e29b-41d4-a716-446655440000

# Get session with history
sorosim session info 550e8400-e29b-41d4-a716-446655440000 --history
```

### Network Configuration

```bash
# List all networks
sorosim network list

# Set default network
sorosim network set-default futurenet
```

### Snapshot Management

```bash
# List all snapshots
sorosim snapshot list

# Save current state to snapshot
sorosim snapshot save my-state

# Load snapshot
sorosim snapshot load my-state.json

# Load snapshot and clear existing
sorosim snapshot load my-state.json --clear

# Export current state to file
sorosim snapshot export ./my-export.json

# Export to stdout
sorosim snapshot export
```

## Global Options

```bash
-u, --url <url>     Backend API URL (default: http://localhost:3000)
--json              Output in JSON format
-v, --verbose       Verbose output
-h, --help          Display help
-V, --version       Display version
```

## Examples

### Running a Simulation Workflow

```bash
# 1. Create a session
SESSION_ID=$(sorosim --json session create --name "Test Run" | jq -r '.data.sessionId')

# 2. Run simulations
sorosim simulate \
  --contract CA3D5... \
  --method increment \
  --session $SESSION_ID

sorosim simulate \
  --contract CA3D5... \
  --method get_count \
  --session $SESSION_ID

# 3. View session history
sorosim session info $SESSION_ID --history

# 4. Save state
sorosim snapshot save test-run-final
```

### Working with Different Networks

```bash
# List available networks
sorosim network list

# Simulate on futurenet
sorosim simulate \
  --contract CA3D5... \
  --method test \
  --network futurenet

# Set futurenet as default
sorosim network set-default futurenet

# Now simulations use futurenet by default
sorosim simulate --contract CA3D5... --method test
```

### Debugging with JSON Output

```bash
# Get full JSON output for parsing
sorosim --json simulate --contract CA3D5... --method increment | jq '.data.stateDiff'

# Extract specific values
sorosim --json ledger stats | jq '.data.totalEntries'

# Filter session list
sorosim --json session list | jq '.data[] | select(.status == "active")'
```

## Environment Variables

- `SOROSIM_API_URL` - Backend API URL (default: `http://localhost:3000`)

## Exit Codes

- `0` - Success
- `1` - Error (command failed, invalid arguments, network error, etc.)

## Tips

1. **Use JSON output for scripting**: Add `--json` flag and pipe to `jq` for processing
2. **Set API URL once**: Export `SOROSIM_API_URL` in your shell profile
3. **Create sessions for related simulations**: Group simulations together for better organization
4. **Save snapshots regularly**: Create checkpoints of your ledger state
5. **Use verbose mode**: Add `-v` flag for debugging connection issues

## Troubleshooting

### Cannot connect to backend

```bash
# Check backend is running
curl http://localhost:3000/health

# Try with explicit URL
sorosim --url http://localhost:3000 ledger stats
```

### Command not found after global install

```bash
# Ensure npm global bin is in PATH
npm config get prefix
export PATH=$PATH:$(npm config get prefix)/bin
```

## Development

```bash
# Run CLI in development
npm run cli -- [command]

# Build for distribution
npm run build:cli

# Test CLI commands
npm run cli -- --help
npm run cli -- simulate --help
```
