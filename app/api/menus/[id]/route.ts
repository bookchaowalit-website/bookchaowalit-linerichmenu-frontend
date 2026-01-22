import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RichMenu, RichMenuArea, UpdateRichMenuAreaInput } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    // Get menu by ID
    const menuQuery = `
      SELECT
        id, name, width, height, created_at, updated_at
      FROM rich_menus
      WHERE id = $1
    `;

    const menuResult = await query(menuQuery, [menuId]);

    if (!menuResult.rows || menuResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rich menu not found' },
        { status: 404 }
      );
    }

    // Get areas for this menu
    const areasQuery = `
      SELECT
        id, rich_menu_id, x, y, width, height, action_type, action_data, bg_color, bg_opacity, border_color, order_index, created_at, updated_at
      FROM rich_menu_areas
      WHERE rich_menu_id = $1
      ORDER BY order_index
    `;

    const areasResult = await query(areasQuery, [menuId]);

    const menuWithAreas = {
      ...menuResult.rows[0],
      areas: areasResult.rows || []
    };

    return NextResponse.json({ menu: menuWithAreas }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rich menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rich menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await import('@/lib/db').then(m => m.getClient());

  try {
    const menuId = parseInt(params.id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, width, height, areas } = body;

    if (!name || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields: name, width, height' },
        { status: 400 }
      );
    }

    // Update menu
    const updateMenuQuery = `
      UPDATE rich_menus
      SET name = $1, width = $2, height = $3
      WHERE id = $4
      RETURNING id, name, width, height, created_at, updated_at
    `;

    const menuResult = await client.query(updateMenuQuery, [name, width, height, menuId]);

    if (!menuResult.rows || menuResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rich menu not found' },
        { status: 404 }
      );
    }

    // Delete existing areas
    await client.query('DELETE FROM rich_menu_areas WHERE rich_menu_id = $1', [menuId]);

    // Insert new areas if provided
    if (areas && Array.isArray(areas) && areas.length > 0) {
      const areaValues = areas.map((area: RichMenuArea, index: number) => [
        menuId,
        area.x,
        area.y,
        area.width,
        area.height,
        area.action_type,
        JSON.stringify(area.action_data),
        area.bg_color || null,
        area.bg_opacity ?? 0.2,
        area.border_color || null,
        index
      ]);

      const areaQuery = `
        INSERT INTO rich_menu_areas (rich_menu_id, x, y, width, height, action_type, action_data, bg_color, bg_opacity, border_color, order_index)
        VALUES ${areaValues.map((_, i) => `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`).join(', ')}
        RETURNING id, rich_menu_id, x, y, width, height, action_type, action_data, bg_color, bg_opacity, border_color, order_index, created_at, updated_at
      `;

      const areaResult = await client.query(
        areaQuery,
        areaValues.flat()
      );

      // Get updated menu with areas
      const updatedAreas = areaResult.rows;

      return NextResponse.json(
        { menu: { ...menuResult.rows[0], areas: updatedAreas } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { menu: { ...menuResult.rows[0], areas: [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating rich menu:', error);
    return NextResponse.json(
      { error: 'Failed to update rich menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuId = parseInt(params.id);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    // Delete menu (cascade will delete areas)
    const deleteQuery = `
      DELETE FROM rich_menus
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(deleteQuery, [menuId]);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Rich menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Rich menu deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting rich menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete rich menu', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
