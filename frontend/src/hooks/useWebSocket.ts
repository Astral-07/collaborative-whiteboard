import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '../services/websocketService';
import { DrawingAction, UserCursor, RoomState, JoinRoomRequest } from '../types';

export function useWebSocket() {
  const isConnectedRef = useRef(false);

  const connect = useCallback(async () => {
    if (!isConnectedRef.current) {
      await wsService.connect();
      isConnectedRef.current = true;
    }
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
    isConnectedRef.current = false;
  }, []);

  const joinRoom = useCallback((request: JoinRoomRequest) => {
    wsService.joinRoom(request);
    wsService.subscribeToRoom(request.roomId);
  }, []);

  const leaveRoom = useCallback(() => {
    wsService.leaveRoom();
  }, []);

  const sendDrawAction = useCallback((action: DrawingAction) => {
    wsService.sendDrawAction(action);
  }, []);

  const sendCursorMove = useCallback((cursor: UserCursor) => {
    wsService.sendCursorMove(cursor);
  }, []);

  const setCallbacks = useCallback((callbacks: {
    onDraw?: (action: DrawingAction) => void;
    onCursor?: (cursor: UserCursor) => void;
    onRoomState?: (state: RoomState) => void;
    onUsers?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }) => {
    if (callbacks.onDraw) wsService.setOnDraw(callbacks.onDraw);
    if (callbacks.onCursor) wsService.setOnCursor(callbacks.onCursor);
    if (callbacks.onRoomState) wsService.setOnRoomState(callbacks.onRoomState);
    if (callbacks.onUsers) wsService.setOnUsers(callbacks.onUsers);
    if (callbacks.onConnect) wsService.setOnConnect(callbacks.onConnect);
    if (callbacks.onDisconnect) wsService.setOnDisconnect(callbacks.onDisconnect);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendDrawAction,
    sendCursorMove,
    setCallbacks,
    isConnected: isConnectedRef.current,
  };
}
