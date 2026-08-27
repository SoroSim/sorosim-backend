import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SorobanClient } from './engine';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize Soroban client
const sorobanClient = new SorobanClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
