import { Request, Response } from 'express';
import { XdrConverter } from '../services/xdrConverter';
import { xdr } from '@stellar/stellar-sdk';

/**
 * XDR conversion controller
 */

/**
 * Convert ScVal XDR to JSON
 */
export const convertScValToJson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { xdr: xdrString, pretty } = req.body as { xdr: string; pretty?: boolean };

    // Validate request
    if (!xdrString) {
      res.status(400).json({
        success: false,
        message: 'XDR string is required',
        error: 'Missing xdr in request body'
      });
      return;
    }

    const converter = new XdrConverter();
    const json = converter.xdrStringToJson(xdrString, 'ScVal');

    res.status(200).json({
      success: true,
      message: 'XDR converted to JSON successfully',
      data: json,
      prettyPrint: pretty ? converter.prettyPrint(xdr.ScVal.fromXDR(xdrString, 'base64')) : undefined
    });
  } catch (error) {
    console.error('Convert ScVal to JSON error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert XDR to JSON',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Convert multiple ScVal XDRs to JSON
 */
export const convertBatchScValToJson = async (req: Request, res: Response): Promise<void> => {
  try {
    const { xdrs } = req.body as { xdrs: string[] };

    // Validate request
    if (!xdrs || !Array.isArray(xdrs) || xdrs.length === 0) {
      res.status(400).json({
        success: false,
        message: 'XDR strings array is required',
        error: 'Missing or empty xdrs array in request body'
      });
      return;
    }

    const converter = new XdrConverter();
    const results = converter.batchConvert(xdrs, 'ScVal');

    res.status(200).json({
      success: true,
      message: 'XDRs converted to JSON successfully',
      data: {
        results,
        count: results.length
      }
    });
  } catch (error) {
    console.error('Convert batch ScVal to JSON error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert XDRs to JSON',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Convert simulation result values to JSON
 */
export const convertSimulationResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { result, events, auth } = req.body as {
      result?: unknown;
      events?: unknown[];
      auth?: unknown[];
    };

    const converter = new XdrConverter();
    const converted: {
      result?: unknown;
      events?: unknown[];
      auth?: unknown[];
    } = {};

    // Convert result if it's an ScVal
    if (result && typeof result === 'object' && 'switch' in result) {
      converted.result = converter.scValToJson(result as unknown as xdr.ScVal);
    } else {
      converted.result = result;
    }

    // Convert events
    if (events && Array.isArray(events)) {
      converted.events = events.map(event => {
        if (typeof event === 'object' && event !== null) {
          // Already parsed
          return event;
        }
        return event;
      });
    }

    // Convert auth
    if (auth && Array.isArray(auth)) {
      converted.auth = auth;
    }

    res.status(200).json({
      success: true,
      message: 'Simulation result converted successfully',
      data: converted
    });
  } catch (error) {
    console.error('Convert simulation result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert simulation result',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get supported ScVal types information
 */
export const getScValTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const types = [
      { type: 'bool', description: 'Boolean value (true/false)' },
      { type: 'void', description: 'Void/null value' },
      { type: 'u32', description: 'Unsigned 32-bit integer' },
      { type: 'i32', description: 'Signed 32-bit integer' },
      { type: 'u64', description: 'Unsigned 64-bit integer' },
      { type: 'i64', description: 'Signed 64-bit integer' },
      { type: 'u128', description: 'Unsigned 128-bit integer' },
      { type: 'i128', description: 'Signed 128-bit integer' },
      { type: 'u256', description: 'Unsigned 256-bit integer' },
      { type: 'i256', description: 'Signed 256-bit integer' },
      { type: 'bytes', description: 'Byte array' },
      { type: 'string', description: 'String value' },
      { type: 'symbol', description: 'Symbol (identifier)' },
      { type: 'vec', description: 'Vector/array of ScVals' },
      { type: 'map', description: 'Map of key-value pairs' },
      { type: 'address', description: 'Stellar address (account or contract)' },
      { type: 'timepoint', description: 'Unix timestamp' },
      { type: 'duration', description: 'Time duration in seconds' }
    ];

    res.status(200).json({
      success: true,
      message: 'Supported ScVal types',
      data: {
        types,
        count: types.length
      }
    });
  } catch (error) {
    console.error('Get ScVal types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ScVal types',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Convert JSON value to ScVal XDR
 */
export const convertJsonToScVal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { value, type } = req.body as { value: unknown; type?: string };

    // Validate request
    if (value === undefined) {
      res.status(400).json({
        success: false,
        message: 'Value is required',
        error: 'Missing value in request body'
      });
      return;
    }

    const converter = new XdrConverter();
    const result = converter.jsonToScVal(value, type);

    res.status(200).json({
      success: true,
      message: 'JSON encoded to ScVal XDR successfully',
      data: {
        xdr: result.xdr,
        type: result.type,
        original: value
      }
    });
  } catch (error) {
    console.error('Convert JSON to ScVal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to encode JSON to ScVal XDR',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Convert multiple JSON values to ScVal XDRs
 */
export const convertBatchJsonToScVal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { values } = req.body as { values: Array<{ value: unknown; type?: string }> };

    // Validate request
    if (!values || !Array.isArray(values) || values.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Values array is required',
        error: 'Missing or empty values array in request body'
      });
      return;
    }

    const converter = new XdrConverter();
    const results = converter.batchJsonToScVal(values);

    res.status(200).json({
      success: true,
      message: 'JSON values encoded to ScVal XDRs successfully',
      data: {
        results,
        count: results.length
      }
    });
  } catch (error) {
    console.error('Convert batch JSON to ScVal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to encode JSON values to ScVal XDRs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
