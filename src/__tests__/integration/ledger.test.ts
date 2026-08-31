import request from 'supertest';
import express, { Express } from 'express';
import cors from 'cors';
import ledgerRoutes from '../../routes/ledgerRoutes';
import { getMockLedgerStore, resetMockLedgerStore } from '../../store/mockLedgerStore';

describe('Ledger Endpoints Integration Tests', () => {
  let app: Express;
  let mockLedgerStore: ReturnType<typeof getMockLedgerStore>;

  beforeAll(() => {
    // Create Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/ledger', ledgerRoutes);
    
    // Get mock ledger store instance
    mockLedgerStore = getMockLedgerStore();
  });

  beforeEach(() => {
    // Reset ledger before each test
    resetMockLedgerStore();
    mockLedgerStore = getMockLedgerStore();
  });

  describe('GET /api/ledger/stats', () => {
    it('should return ledger statistics', async () => {
      const response = await request(app)
        .get('/api/ledger/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalEntries');
      expect(response.body.data).toHaveProperty('currentLedgerSeq');
      expect(response.body.data).toHaveProperty('entriesByType');
    });

    it('should show correct counts after adding entries', async () => {
      // Add an account entry
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      const response = await request(app)
        .get('/api/ledger/stats')
        .expect(200);

      expect(response.body.data.totalEntries).toBe(1);
      expect(response.body.data.entriesByType).toHaveProperty('account', 1);
    });
  });

  describe('GET /api/ledger/entries', () => {
    it('should return empty array when no entries', async () => {
      const response = await request(app)
        .get('/api/ledger/entries')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all entries', async () => {
      // Add multiple entries
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      mockLedgerStore.set({
        type: 'account',
        key: 'account:GDEF456',
        accountId: 'GDEF456',
        balance: '20000000000',
        sequence: '2',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      const response = await request(app)
        .get('/api/ledger/entries')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('type', 'account');
    });
  });

  describe('GET /api/ledger/entries/type/:type', () => {
    it('should filter entries by type', async () => {
      // Add account entry
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      // Add contract data entry
      mockLedgerStore.set({
        type: 'contractData',
        key: 'contractData:CA3D5:counter',
        contract: 'CA3D5',
        storageKey: 'counter',
        value: '42',
        lastModifiedLedgerSeq: 1
      });

      const response = await request(app)
        .get('/api/ledger/entries/type/account')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('account');
    });
  });

  describe('GET /api/ledger/entries/:key', () => {
    it('should return 404 for non-existent entry', async () => {
      const response = await request(app)
        .get('/api/ledger/entries/account:NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return entry by key', async () => {
      const entry = {
        type: 'account' as const,
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      };

      mockLedgerStore.set(entry);

      const response = await request(app)
        .get('/api/ledger/entries/account:GABC123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe('GABC123');
    });
  });

  describe('POST /api/ledger/entries', () => {
    it('should create a new account entry', async () => {
      const newEntry = {
        type: 'account',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 }
      };

      const response = await request(app)
        .post('/api/ledger/entries')
        .send(newEntry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBe('GABC123');
      expect(response.body.data.key).toBe('account:GABC123');
    });

    it('should validate required fields', async () => {
      const invalidEntry = {
        type: 'account',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/ledger/entries')
        .send(invalidEntry)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/ledger/entries/:key', () => {
    it('should update existing entry', async () => {
      // Create initial entry
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      // Update balance
      const response = await request(app)
        .put('/api/ledger/entries/account:GABC123')
        .send({ balance: '20000000000' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.balance).toBe('20000000000');
    });

    it('should return 404 for non-existent entry', async () => {
      const response = await request(app)
        .put('/api/ledger/entries/account:NONEXISTENT')
        .send({ balance: '20000000000' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/ledger/entries/:key', () => {
    it('should delete entry', async () => {
      // Create entry
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      // Delete entry
      const response = await request(app)
        .delete('/api/ledger/entries/account:GABC123')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deleted
      const getResponse = await request(app)
        .get('/api/ledger/entries/account:GABC123')
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });
  });

  describe('DELETE /api/ledger/clear', () => {
    it('should clear all entries', async () => {
      // Add entries
      mockLedgerStore.set({
        type: 'account',
        key: 'account:GABC123',
        accountId: 'GABC123',
        balance: '10000000000',
        sequence: '1',
        numSubEntries: 0,
        flags: 0,
        thresholds: { low: 1, medium: 1, high: 1 },
        lastModifiedLedgerSeq: 1
      });

      // Clear
      const response = await request(app)
        .delete('/api/ledger/clear')
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify cleared
      const statsResponse = await request(app)
        .get('/api/ledger/stats')
        .expect(200);

      expect(statsResponse.body.data.totalEntries).toBe(0);
    });
  });

  describe('GET /api/ledger/sequence', () => {
    it('should return current ledger sequence', async () => {
      const response = await request(app)
        .get('/api/ledger/sequence')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentLedgerSeq');
    });
  });

  describe('PUT /api/ledger/sequence', () => {
    it('should set ledger sequence', async () => {
      const response = await request(app)
        .put('/api/ledger/sequence')
        .send({ sequence: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentLedgerSeq).toBe(100);
    });
  });

  describe('POST /api/ledger/sequence/increment', () => {
    it('should increment ledger sequence', async () => {
      // Set initial sequence
      await request(app)
        .put('/api/ledger/sequence')
        .send({ sequence: 10 });

      // Increment
      const response = await request(app)
        .post('/api/ledger/sequence/increment')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentLedgerSeq).toBe(11);
    });
  });
});

