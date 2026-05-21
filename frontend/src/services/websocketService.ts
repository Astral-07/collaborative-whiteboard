import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { DrawingAction, UserCursor, RoomState, JoinRoomRequest } from '../types';

// Production: wss://your-app.onrender.com/ws/whiteboard
// Development: /ws/whiteboard (Vite proxy)
const WS_URL = import.meta.env.VITE_WS_URL || '/ws/whiteboard';
const API_URL = import.meta.env.VITE_API_URL || '/api';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private roomId: string = '';
  private userId: string = '';

  private onDrawCallback: ((action: DrawingAction) => void) | null = null;
  private onCursorCallback: ((cursor: UserCursor) => void) | null = null;
  private onRoomStateCallback: ((state: RoomState) => void) | null = null;
  private onUsersCallback: ((data: any) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: () => {},
        onConnect: () => {
          console.log('WebSocket connected');
          this.onConnectCallback?.();
          resolve();
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.onDisconnectCallback?.();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          reject(new Error(frame.headers?.message || 'STOMP error'));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          reject(new Error('WebSocket connection failed - is backend running?'));
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.client?.deactivate();
    this.client = null;
  }

  joinRoom(request: JoinRoomRequest): void {
    this.roomId = request.roomId;
    this.client?.publish({
      destination: '/app/room.join',
      body: JSON.stringify(request),
    });
  }

  leaveRoom(): void {
    this.client?.publish({
      destination: '/app/room.leave',
      body: JSON.stringify({}),
    });
  }

  sendDrawAction(action: DrawingAction): void {
    this.client?.publish({
      destination: '/app/draw',
      body: JSON.stringify(action),
    });
  }

  sendCursorMove(cursor: UserCursor): void {
    this.client?.publish({
      destination: '/app/cursor.move',
      body: JSON.stringify(cursor),
    });
  }

  subscribeToRoom(roomId: string): void {
    const drawSub = this.client?.subscribe(
      `/topic/room.${roomId}.draw`,
      (message: IMessage) => {
        const action: DrawingAction = JSON.parse(message.body);
        if (action.userId !== this.userId) {
          this.onDrawCallback?.(action);
        }
      }
    );
    if (drawSub) this.subscriptions.push(drawSub);

    const cursorSub = this.client?.subscribe(
      `/topic/room.${roomId}.cursors`,
      (message: IMessage) => {
        const cursor: UserCursor = JSON.parse(message.body);
        if (cursor.userId !== this.userId) {
          this.onCursorCallback?.(cursor);
        }
      }
    );
    if (cursorSub) this.subscriptions.push(cursorSub);

    const usersSub = this.client?.subscribe(
      `/topic/room.${roomId}.users`,
      (message: IMessage) => {
        this.onUsersCallback?.(JSON.parse(message.body));
      }
    );
    if (usersSub) this.subscriptions.push(usersSub);

    const stateSub = this.client?.subscribe(
      '/user/queue/room.state',
      (message: IMessage) => {
        const state: RoomState = JSON.parse(message.body);
        this.userId = state.currentUserId;
        this.onRoomStateCallback?.(state);
      }
    );
    if (stateSub) this.subscriptions.push(stateSub);
  }

  setOnDraw(callback: (action: DrawingAction) => void): void {
    this.onDrawCallback = callback;
  }

  setOnCursor(callback: (cursor: UserCursor) => void): void {
    this.onCursorCallback = callback;
  }

  setOnRoomState(callback: (state: RoomState) => void): void {
    this.onRoomStateCallback = callback;
  }

  setOnUsers(callback: (data: any) => void): void {
    this.onUsersCallback = callback;
  }

  setOnConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  setOnDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  getUserId(): string {
    return this.userId;
  }

  getRoomId(): string {
    return this.roomId;
  }
}

export const wsService = new WebSocketService();
export { API_URL };
