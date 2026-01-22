import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RichMenu } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Get all rich menus with their areas
    const menusQuery = `
      SELECT
        id, name, width, height, created_at, updated_at
      FROM rich_menus
      ORDER BY created_at DESC
    `;

    const menusResult = await query(menusQuery);

    if (!menusResult.rows || menusResult.rows.length === 0) {
      return NextResponse.json({ menus: [] }, { status: 200 });
    }

    // Get areas for each menu
    const menuIds = menusResult.rows.map((menu: RichMenu) => menu.id);
    const areasQuery = `
      SELECT
        id, rich_menu_id, x, y, width, height, action_type, action_data, bg_color, bg_opacity, border_color, order_index, created_at, updated_at
      FROM rich_menu_areas
      WHERE rich_menu_id = ANY($1)
      ORDER BY rich_menu_id, order_index
    `;

    const areasResult = await query(areasQuery, [menuIds]);

    // Group areas by menu_id
    const areasByMenu: { [key: number]: any[] } = {};
    areasResult.rows.forEach((area: any) => {
      if (!areasByMenu[area.rich_menu_id]) {
        areasByMenu[area.rich_menu_id] = [];
      }
      areasByMenu[area.rich_menu_id].push(area);
    });

    // Combine menus with their areas
    const menusWithAreas = menusResult.rows.map((menu: RichMenu) => ({
      ...menu,
      areas: areasByMenu[menu.id as number] || []
    }));

    return NextResponse.json({ menus: menusWithAreas }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rich menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rich menus', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, width, height } = body;

    if (!name || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields: name, width, height' },
        { status: 400 }
      );
    }

    // Create new rich menu
    const insertQuery = `
      INSERT INTO rich_menus (name, width, height)
      VALUES ($1, $2, $3)
      RETURNING id, name, width, height, created_at, updated_at
    `;

    const result = await query(insertQuery, [name, width, height]);

    return NextResponse.json(
      { menu: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating rich menu:', error);
    return NextResponse.json(
      { error: 'Failed to create rich menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
