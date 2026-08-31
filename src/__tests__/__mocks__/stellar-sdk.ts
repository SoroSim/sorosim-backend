// Mock for @stellar/stellar-sdk
// Used in tests to avoid ESM import issues

export const rpc = {
  Server: class {
    constructor() {}
    simulateTransaction() {
      return Promise.resolve({});
    }
  }
};

export const TransactionBuilder = class {};
export const Networks = {
  TESTNET: 'Test SDF Network ; September 2015',
  FUTURENET: 'Test SDF Future Network ; October 2022',
  PUBLIC: 'Public Global Stellar Network ; September 2015'
};
export const Contract = class {};
export const xdr = {};
export const scValToNative = () => ({});
export const nativeToScVal = () => ({});
export const Address = class {};
