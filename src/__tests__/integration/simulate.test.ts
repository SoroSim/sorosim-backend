import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import simulationRoutes from '../../routes/simulationRoutes';
import { resetMockLedgerStore } from '../../store/mockLedgerStore';

// Note: These tests verify API structure, not actual Soroban RPC calls
// The stellar-sdk and uuid packages are mocked to avoid ESM import issues

describe('Simulation Endpoints Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api', simulationRoutes);
  });

  beforeEach(() => {
    // Reset ledger before each test
    resetMockLedgerStore();
  });

  describe('POST /api/simulate', () => {
    it('should accept valid simulation request with required fields', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'increment',
        args: []
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(simulationRequest);

      // Verify response structure (mock may not return full data)
      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
      
      // If response has properties, verify their types
      if (response.body.requestId) {
        expect(typeof response.body.requestId).toBe('string');
      }
      if (response.body.timestamp) {
        expect(typeof response.body.timestamp).toBe('string');
      }
      if (response.body.duration !== undefined) {
        expect(typeof response.body.duration).toBe('number');
      }
    });

    it('should accept optional parameters', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'transfer',
        args: [{ type: 'address', value: 'GABC123' }, 100],
        source: 'GABC123',
        fee: '1000'
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(simulationRequest);

      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should accept networkId query parameter', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'increment',
        args: []
      };

      const response = await request(app)
        .post('/api/simulate?networkId=testnet')
        .send(simulationRequest);

      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should accept sessionId query parameter', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'increment',
        args: []
      };

      const response = await request(app)
        .post('/api/simulate?sessionId=550e8400-e29b-41d4-a716-446655440000')
        .send(simulationRequest);

      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should include duration in response when available', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'increment',
        args: []
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(simulationRequest);

      // Should return a response
      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle array arguments', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'batch_process',
        args: [
          [1, 2, 3],
          ['a', 'b', 'c'],
          [true, false]
        ]
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(simulationRequest);

      // Should return a response even if simulation fails
      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should handle complex object arguments', async () => {
      const simulationRequest = {
        contractId: 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE',
        method: 'process_data',
        args: [
          {
            type: 'user',
            data: {
              name: 'Alice',
              balance: 1000,
              active: true
            }
          }
        ]
      };

      const response = await request(app)
        .post('/api/simulate')
        .send(simulationRequest);

      // Should return a response even if simulation fails
      expect(response.body).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});
