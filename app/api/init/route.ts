import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      try {
        await query(statement);
      } catch (error: any) {
        // Ignore duplicate table/object errors
        if (!error.message?.includes('already exists')) {
          console.error('Error executing statement:', statement, error);
          throw error;
        }
      }
    }

    return NextResponse.json(
      {
        message: 'Database initialized successfully',
        statementsExecuted: statements.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Check if database is initialized by checking if tables exist
  try {
    const checkTablesQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'rich_menus'
      );
    `;

    const result = await query(checkTablesQuery);
    const isInitialized = result.rows[0].exists;

    return NextResponse.json(
      {
        initialized: isInitialized,
        message: isInitialized ? 'Database is already initialized' : 'Database needs initialization'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check database status',
        initialized: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
