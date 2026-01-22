export interface RichMenu {
  id?: number;
  name: string;
  width: number;
  height: number;
  created_at?: string;
  updated_at?: string;
  areas?: RichMenuArea[];
}

export interface RichMenuArea {
  id?: number;
  rich_menu_id?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  action_type: 'message' | 'postback' | 'uri' | 'datetimepicker' | 'camera' | 'cameraroll' | 'location';
  action_data: ActionData;
  // Optional background color for UI customization (hex, eg. '#FFCC00')
  bg_color?: string;
  // Optional background opacity (0.0 - 1.0)
  bg_opacity?: number;
  // Optional border color for the area (hex)
  border_color?: string;
  // Optional font family for the area label (e.g., 'Inter', 'Arial')
  font_family?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export type ActionData =
  | MessageActionData
  | PostbackActionData
  | UriActionData
  | DatetimepickerActionData
  | CameraActionData
  | CameraRollActionData
  | LocationActionData;

export interface MessageActionData {
  type: 'message';
  text: string;
  label?: string;
}

export interface PostbackActionData {
  type: 'postback';
  data: string;
  text?: string;
  label?: string;
  displayText?: string;
}

export interface UriActionData {
  type: 'uri';
  uri: string;
  label?: string;
  altUri?: {
    desktop?: string;
  };
}

export interface DatetimepickerActionData {
  type: 'datetimepicker';
  data: string;
  mode: 'date' | 'time' | 'datetime';
  initial?: string;
  max?: string;
  min?: string;
  label?: string;
}

export interface CameraActionData {
  type: 'camera';
  label?: string;
}

export interface CameraRollActionData {
  type: 'cameraroll';
  label?: string;
}

export interface LocationActionData {
  type: 'location';
  label?: string;
}

export interface CreateRichMenuInput {
  name: string;
  width: number;
  height: number;
}

export interface UpdateRichMenuInput {
  id: number;
  name: string;
  width: number;
  height: number;
}

export interface CreateRichMenuAreaInput {
  rich_menu_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  action_type: RichMenuArea['action_type'];
  action_data: ActionData;
  order_index: number;
}

export interface UpdateRichMenuAreaInput {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  action_type: RichMenuArea['action_type'];
  action_data: ActionData;
  order_index: number;
}

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality?: number;
  scale?: number;
}

export const LINE_RICH_MENU_SIZES = {
  large: { width: 2500, height: 1686, name: 'Large' },
  medium: { width: 2500, height: 843, name: 'Medium' },
  small: { width: 800, height: 270, name: 'Small' },
  mini: { width: 800, height: 540, name: 'Mini' },
} as const;

export type RichMenuSize = keyof typeof LINE_RICH_MENU_SIZES;
