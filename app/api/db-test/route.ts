import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test connection by trying to set and get a test key
    const testKey = 'db-test-connection';
    const testValue = 'test-' + Date.now();
    
    // Try to set a value
    await kv.set(testKey, testValue, { ex: 60 }); // Expires in 60 seconds
    
    // Try to get the value back
    const retrievedValue = await kv.get(testKey);
    
    // Verify the value matches
    if (retrievedValue !== testValue) {
      return NextResponse.json(
        { success: false, error: 'Retrieved value does not match' },
        { status: 500 }
      );
    }
    
    // Clean up test key
    await kv.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: 'KV database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('KV connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
