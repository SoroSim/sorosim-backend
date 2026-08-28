import { xdr, scValToNative, nativeToScVal, Address } from '@stellar/stellar-sdk';

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
 * Encoded ScVal result
 */
export interface EncodedScVal {
  xdr: string; // Base64 encoded XDR
  type: string; // Detected type
}

/**
 * Service for converting XDR ScVal types to/from JSON
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

  /**
   * Convert JSON value to ScVal XDR
   * 
   * @param value - JavaScript value to encode
   * @param explicitType - Optional explicit type hint
   * @returns Encoded ScVal
   */
  jsonToScVal(value: unknown, explicitType?: string): EncodedScVal {
    try {
      let scVal: xdr.ScVal;

      // Handle explicit type hints
      if (explicitType) {
        scVal = this.encodeWithType(value, explicitType);
      } else {
        // Auto-detect type and encode
        scVal = this.autoEncode(value);
      }

      return {
        xdr: scVal.toXDR('base64'),
        type: explicitType || this.inferType(value)
      };
    } catch (error) {
      throw new Error(`Failed to encode to ScVal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-encode value to ScVal based on type detection
   * 
   * @param value - Value to encode
   * @returns ScVal XDR
   */
  private autoEncode(value: unknown): xdr.ScVal {
    // Handle null/undefined as void
    if (value === null || value === undefined) {
      return nativeToScVal(null);
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return nativeToScVal(value, { type: 'bool' });
    }

    // Handle numbers
    if (typeof value === 'number') {
      // Default to u32 for positive integers, i32 for others
      if (Number.isInteger(value) && value >= 0 && value <= 4294967295) {
        return nativeToScVal(value, { type: 'u32' });
      }
      return nativeToScVal(value, { type: 'i32' });
    }

    // Handle bigint
    if (typeof value === 'bigint') {
      return nativeToScVal(value, { type: 'u64' });
    }

    // Handle string - try to detect if it's an address
    if (typeof value === 'string') {
      // Check if it's an address
      if (this.isAddress(value)) {
        return nativeToScVal(value, { type: 'address' });
      }
      // Default to symbol for short strings, string for longer ones
      if (value.length <= 32 && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        return nativeToScVal(value, { type: 'symbol' });
      }
      return nativeToScVal(value, { type: 'string' });
    }

    // Handle arrays as vectors - use direct conversion
    if (Array.isArray(value)) {
      return nativeToScVal(value);
    }

    // Handle objects as maps - use direct conversion
    if (typeof value === 'object') {
      return nativeToScVal(value);
    }

    // Fallback to direct conversion
    return nativeToScVal(value);
  }

  /**
   * Encode value with explicit type
   * 
   * @param value - Value to encode
   * @param type - Explicit type
   * @returns ScVal XDR
   */
  private encodeWithType(value: unknown, type: string): xdr.ScVal {
    switch (type.toLowerCase()) {
      case 'bool':
        return nativeToScVal(Boolean(value), { type: 'bool' });
      
      case 'void':
        return nativeToScVal(null);
      
      case 'u32':
      case 'i32':
      case 'u64':
      case 'i64':
      case 'u128':
      case 'i128':
      case 'u256':
      case 'i256':
        return nativeToScVal(value, { type: type as 'u32' | 'i32' | 'u64' | 'i64' | 'u128' | 'i128' | 'u256' | 'i256' });
      
      case 'string':
        return nativeToScVal(String(value), { type: 'string' });
      
      case 'symbol':
        return nativeToScVal(String(value), { type: 'symbol' });
      
      case 'bytes':
        if (typeof value === 'string') {
          // Assume hex or base64
          const buffer = Buffer.from(value, 'hex');
          return nativeToScVal(buffer, { type: 'bytes' });
        }
        return nativeToScVal(value, { type: 'bytes' });
      
      case 'vec':
        // Use direct conversion for arrays
        return nativeToScVal(value);
      
      case 'map':
        // Use direct conversion for objects
        return nativeToScVal(value);
      
      case 'address':
        return nativeToScVal(String(value), { type: 'address' });
      
      case 'timepoint':
        return nativeToScVal(value, { type: 'timepoint' });
      
      case 'duration':
        return nativeToScVal(value, { type: 'duration' });
      
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  /**
   * Check if string is a Stellar address
   * 
   * @param value - String to check
   * @returns True if valid address
   */
  private isAddress(value: string): boolean {
    try {
      Address.fromString(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Batch convert JSON values to ScVal XDRs
   * 
   * @param values - Array of value/type pairs
   * @returns Array of encoded ScVals
   */
  batchJsonToScVal(values: Array<{ value: unknown; type?: string }>): EncodedScVal[] {
    return values.map(({ value, type }) => this.jsonToScVal(value, type));
  }
}
