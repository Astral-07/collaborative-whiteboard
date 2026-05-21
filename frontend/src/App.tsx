import React, { useState, useCallback, useEffect } from 'react';
import { WhiteboardElement, ToolType, DrawingAction, UserCursor, RoomState, JoinRoomRequest } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import UserCursors from './components/UserCursors';
import RoomPanel from './components/RoomPanel';

const DEFAULT_COLOR = '#000000';
const DEFAULT_STROKE_WIDTH = 3;

const App: React.FC = () => {
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [tool, setTool] = useState<ToolType>('pencil');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [userColor, setUserColor] = useState('');
  const [userCursors, setUserCursors] = useState<Record<string, UserCursor>>({});
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  const [isInRoom, setIsInRoom] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const ws = useWebSocket();

  useEffect(() => {
    let mounted = true;
    ws.connect()
      .then(() => {
        if (mounted) {
          setIsConnected(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setConnectionError('Cannot connect to server. Make sure backend runs on port 8080.');
          setIsConnected(false);
          setIsLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    ws.setCallbacks({
      onDraw: (action: DrawingAction) => {
        switch (action.type) {
          case 'CREATE':
            if (action.element) {
              setElements(prev => [...prev, action.element!]);
            }
            break;
          case 'UPDATE':
            if (action.element) {
              setElements(prev => prev.map(el => (el.id === action.element!.id ? action.element! : el)));
            }
            break;
          case 'DELETE':
            if (action.element) {
              setElements(prev => prev.map(el => (el.id === action.element!.id ? { ...el, isDeleted: true } : el)));
            }
            break;
          case 'CLEAR':
            setElements([]);
            break;
        }
      },
      onCursor: (cursor: UserCursor) => {
        setUserCursors(prev => ({ ...prev, [cursor.userId]: cursor }));
      },
      onRoomState: (state: RoomState) => {
        setRoomId(state.roomId);
        setRoomName(state.roomName);
        setUserId(state.currentUserId);
        setElements(state.elements);
        setActiveUsers(new Set(state.activeUsers));
        setUserCursors(state.userCursors);
        setIsInRoom(true);
      },
      onUsers: (data: any) => {
        if (data.type === 'USER_JOINED') {
          setActiveUsers(prev => new Set([...prev, data.userId]));
          if (data.cursor) {
            setUserCursors(prev => ({ ...prev, [data.userId]: data.cursor }));
          }
        } else if (data.type === 'USER_LEFT') {
          setActiveUsers(prev => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
          setUserCursors(prev => {
            const next = { ...prev };
            delete next[data.userId];
            return next;
          });
        }
      },
    });
  }, []);

  const handleJoinRoom = useCallback(async (id: string, name: string, color: string) => {
    setUsername(name);
    setUserColor(color);
    ws.joinRoom({ roomId: id, username: name, userColor: color });
  }, [ws]);

  const handleCreateRoom = useCallback(async (name: string, creator: string) => {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, createdBy: creator }),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.roomId;
  }, []);

  const handleSendAction = useCallback((action: DrawingAction) => {
    ws.sendDrawAction(action);
  }, [ws]);

  const handleSendCursor = useCallback((cursor: UserCursor) => {
    ws.sendCursorMove(cursor);
  }, [ws]);

  const handleElementsChange = useCallback((newElements: WhiteboardElement[]) => {
    setElements(newElements);
  }, []);

  const handleClear = useCallback(() => {
    setElements([]);
    handleSendAction({ type: 'CLEAR', roomId });
  }, [roomId, handleSendAction]);

  const handleExport = useCallback(async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const container = document.querySelector('.canvas-container');
      if (!container) return;
      const canvas = await html2canvas(container as HTMLElement, { backgroundColor: '#ffffff', scale: 2 });
      const link = document.createElement('a');
      link.download = `whiteboard-${roomId}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch {
      alert('Export failed. Make sure html2canvas is installed.');
    }
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm text-center mx-4">
          <h2 className="text-red-600 font-bold mb-3">Connection Error</h2>
          <p className="text-gray-600 text-sm mb-5">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInRoom) {
    return (
      <RoomPanel
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        isConnected={isConnected}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClear={handleClear}
        onExport={handleExport}
        userCount={activeUsers.size}
        roomName={roomName}
      />
      <div className="canvas-container relative flex-1 overflow-hidden">
        <Canvas
          elements={elements}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          roomId={roomId}
          userId={userId}
          onSendAction={handleSendAction}
          onSendCursor={handleSendCursor}
          onElementsChange={handleElementsChange}
          username={username}
          userColor={userColor}
        />
        <UserCursors cursors={userCursors} currentUserId={userId} />
      </div>
    </div>
  );
};

export default App;
