import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SERVER_INFO = {
  name: 'linerichmenu',
  version: '1.0.0',
  description: 'LINE Rich Menu Maker MCP Server'
};

const TOOLS = [
  {
    name: 'list_menus',
    description: 'List all LINE rich menus',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_menu',
    description: 'Get a specific rich menu by ID',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id']
    }
  },
  {
    name: 'create_menu',
    description: 'Create a new LINE rich menu',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        size: { type: 'string', enum: ['small', 'mini', 'medium', 'large'] }
      },
      required: ['name', 'size']
    }
  }
];

export async function GET() {
  return NextResponse.json({
    ...SERVER_INFO,
    endpoints: { mcp: '/api/mcp' },
    availableMethods: ['initialize', 'tools/list', 'tools/call']
  });
}

async function handleMCPRequest(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    switch (method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: SERVER_INFO
          }
        });

      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: id,
          result: { tools: TOOLS }
        });

      case 'tools/call':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify({
                tool: params.name,
                message: 'Implement your menu logic here'
              })
            }]
          }
        });

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: id,
          error: { code: -32601, message: 'Method not found' }
        });
    }
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' }
    }, { status: 400 });
  }
}

export { handleMCPRequest as POST };
