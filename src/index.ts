import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { SorobanClient } from './engine';
import wasmRoutes from './routes/wasmRoutes';
import ledgerRoutes from './routes/ledgerRoutes';
import simulationRoutes from './routes/simulationRoutes';
import accountRoutes from './routes/accountRoutes';
import contractRoutes from './routes/contractRoutes';
import snapshotRoutes from './routes/snapshotRoutes';
import sessionRoutes from './routes/sessionRoutes';
import networkRoutes from './routes/networkRoutes';
import diffRoutes from './routes/diffRoutes';
import eventRoutes from './routes/eventRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize Soroban client
const sorobanClient = new SorobanClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/wasm', wasmRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/snapshots', snapshotRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/networks', networkRoutes);
app.use('/api/diff', diffRoutes);
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File too large',
        error: 'WASM file must not exceed 10 MB'
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files',
        error: 'Only one WASM file can be uploaded at a time'
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
    return;
  }

  if (err.message === 'Only .wasm files are allowed') {
    res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: err.message
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const sorobanHealthy = await sorobanClient.checkHealth();
    const latestLedger = await sorobanClient.getLatestLedger();
    
    res.json({
      status: 'ok',
      message: 'SoroSim Backend is running',
      soroban: {
        connected: sorobanHealthy,
        network: sorobanClient.getNetworkPassphrase(),
        latestLedger: latestLedger.sequence
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      message: 'SoroSim Backend is running but Soroban RPC connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'SoroSim Backend',
    version: '1.0.0',
    description: 'Soroban Contract Simulation & Dry-Run Sandbox'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SoroSim Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
