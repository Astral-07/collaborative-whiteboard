export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: ToolType;
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  strokeColor: string;
  strokeWidth: number;
  opacity?: number;
  text?: string;
  font?: string;
  isDeleted?: boolean;
  createdBy?: string;
  timestamp?: number;
}

export interface DrawingAction {
  type: 'DRAW' | 'UPDATE' | 'DELETE' | 'CLEAR' | 'UNDO' | 'REDO' | 'CREATE';
  roomId: string;
  userId?: string;
  username?: string;
  userColor?: string;
  element?: WhiteboardElement;
  timestamp?: number;
  actionId?: string;
}

export interface UserCursor {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
  roomId?: string;
  timestamp?: number;
}

export interface RoomState {
  roomId: string;
  roomName: string;
  elements: WhiteboardElement[];
  activeUsers: string[];
  userCursors: Record<string, UserCursor>;
  backgroundColor: string;
  currentUserId: string;
}

export interface JoinRoomRequest {
  roomId: string;
  username: string;
  userColor: string;
}

export type ToolType = 'pencil' | 'rectangle' | 'circle' | 'line' | 'text' | 'eraser' | 'select';

export const TOOL_COLORS = [
  '#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#E17055', '#00B894', '#E84393', '#6C5CE7'
];

export const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12];
