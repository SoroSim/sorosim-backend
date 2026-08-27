import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SoroSim Backend is running' });
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
