import { xdr, scValToNative } from '@stellar/stellar-sdk';

/**
 * JSON representation of ScVal types
 */
export interface ScValJson {
  type: string;
  value: unknown;
  native?: unknown; // Native JavaScript value
  raw?: string; // Base64 XDR for reference
}

/**
 * Service for converting XDR ScVal types to JSON
 */
export class XdrConverter {
  /**
   * Convert ScVal to human-readable JSON
   * 
   * @param scVal - ScVal XDR value
   * @returns JSON representation
   */
  scValToJson(scVal: xdr.ScVal): ScValJson {
    try {
      const raw = scVal.toXDR('base64');
      
      // Use scValToNative for conversion
      const native = scValToNative(scVal);
      
      // Determine type from the native value
      const type = this.inferType(native);

      return {
        type,
        value: this.formatValue(native),
        native,
        raw
      };
    } catch (error) {
      console.error('Failed to convert ScVal to JSON:', error);
      return {
        type: 'error',
        value: error instanceof Error ? error.message : 'Conversion failed',
        raw: ''
      };
    }
  }

  /**
   * Infer type from native value
   * 
   * @param value - Native JavaScript value
   * @returns Type string
   */
  private inferType(value: unknown): string {
    if (value === null || value === undefined) return 'void';
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'bigint') return 'bigint';
    if (typeof value === 'string') return 'string';
    if (Buffer.isBuffer(value)) return 'bytes';
    if (Array.isArray(value)) return 'vec';
    if (value instanceof Map) return 'map';
    if (typeof value === 'object') {
      if ('type' in value && value.type === 'address') return 'address';
      return 'object';
    }
    return 'unknown';
  }

  /**
   * Format value for JSON serialization
   * 
   * @param value - Native JavaScript value
   * @returns Formatted value
   */
  private formatValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value === 'bigint') return value.toString();
    if (Buffer.isBuffer(value)) {
      return {
        hex: value.toString('hex'),
        base64: value.toString('base64')
      };
    }
    if (Array.isArray(value)) {
      return value.map(v => this.formatValue(v));
    }
    if (value instanceof Map) {
      const obj: Record<string, unknown> = {};
      value.forEach((v, k) => {
        const key = typeof k === 'string' ? k : JSON.stringify(k);
        obj[key] = this.formatValue(v);
      });
      return obj;
    }
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = this.formatValue(v);
      }
      return result;
    }
    return value;
  }

  /**
   * Convert multiple ScVals to JSON array
   * 
   * @param scVals - Array of ScVal XDR values
   * @returns Array of JSON representations
   */
  scValsToJson(scVals: xdr.ScVal[]): ScValJson[] {
    return scVals.map(scVal => this.scValToJson(scVal));
  }

  /**
   * Convert XDR string to JSON
   * 
   * @param xdrString - Base64 encoded XDR string
   * @param xdrType - XDR type name (e.g., 'ScVal')
   * @returns JSON representation
   */
  xdrStringToJson(xdrString: string, xdrType: 'ScVal'): ScValJson {
    try {
      if (xdrType === 'ScVal') {
        const scVal = xdr.ScVal.fromXDR(xdrString, 'base64');
        return this.scValToJson(scVal);
      }

      return {
        type: 'error',
        value: `Unsupported XDR type: ${xdrType}`,
        raw: xdrString
      };
    } catch (error) {
      return {
        type: 'error',
        value: error instanceof Error ? error.message : 'Failed to parse XDR',
        raw: xdrString
      };
    }
  }

  /**
   * Pretty print ScVal as JSON string
   * 
   * @param scVal - ScVal XDR value
   * @param indent - Number of spaces for indentation
   * @returns Formatted JSON string
   */
  prettyPrint(scVal: xdr.ScVal, indent = 2): string {
    const json = this.scValToJson(scVal);
    return JSON.stringify(json, null, indent);
  }

  /**
   * Batch convert multiple XDR strings to JSON
   * 
   * @param xdrStrings - Array of base64 encoded XDR strings
   * @param xdrType - XDR type name
   * @returns Array of JSON representations
   */
  batchConvert(xdrStrings: string[], xdrType: 'ScVal'): ScValJson[] {
    return xdrStrings.map(xdrStr => this.xdrStringToJson(xdrStr, xdrType));
  }
}
