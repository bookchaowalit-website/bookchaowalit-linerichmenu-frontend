import { RichMenuArea, PostbackActionData } from './types';

export const generateGridTemplate = (
  cols: number,
  rows: number,
  width = 800,
  height = 270,
  padding = 0,
  actionType: RichMenuArea['action_type'] = 'postback'
): RichMenuArea[] => {
  const cellW = Math.floor((width - padding * (cols + 1)) / cols);
  const cellH = Math.floor((height - padding * (rows + 1)) / rows);
  const areas: RichMenuArea[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padding + c * (cellW + padding);
      const y = padding + r * (cellH + padding);
      // Use friendly sample message text for better UX and add a pleasant default color per area
      const actionData = { type: 'message', text: `Sample message for area ${idx + 1}` } as any;
      const colors = ['#FFB74D', '#4FC3F7', '#A1887F', '#81C784', '#BA68C8', '#E57373'];
      const borders = ['#8A4B00', '#015F7A', '#5D4037', '#2E7D32', '#6A1B9A', '#C62828'];
      areas.push({
        x,
        y,
        width: cellW,
        height: cellH,
        action_type: 'message',
        action_data: actionData,
        bg_color: colors[idx % colors.length],
        bg_opacity: 0.22,
        border_color: borders[idx % borders.length],
        order_index: idx,
      });
      idx++;
    }
  }
  return areas;
};

export const TEMPLATES: { [key: string]: { width?: number; height?: number; areas: RichMenuArea[] } } = {
  '6-box (3x2)': {
    width: 800,
    height: 270,
    areas: generateGridTemplate(3, 2, 800, 270, 0),
  },
  '4-box (2x2)': {
    width: 800,
    height: 270,
    areas: generateGridTemplate(2, 2, 800, 270, 0),
  },
  '3-box (3x1)': {
    width: 800,
    height: 270,
    areas: generateGridTemplate(3, 1, 800, 270, 0),
  },
  '2-box (1x2)': {
    width: 800,
    height: 270,
    areas: generateGridTemplate(1, 2, 800, 270, 0),
  },
  '1-box (1x1)': {
    width: 800,
    height: 270,
    areas: generateGridTemplate(1, 1, 800, 270, 0),
  },
};
