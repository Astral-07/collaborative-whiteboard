import React, { useState } from 'react';

interface RoomPanelProps {
  onJoinRoom: (roomId: string, username: string, userColor: string) => void;
  onCreateRoom: (name: string, username: string) => Promise<string>;
  isConnected: boolean;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#F7DC6F', '#BB8FCE', '#85C1E9', '#E17055',
];

const RoomPanel: React.FC<RoomPanelProps> = ({ onJoinRoom, onCreateRoom, isConnected }) => {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!roomId.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await onJoinRoom(roomId.trim(), username.trim(), selectedColor);
    } catch (err) {
      setError('Failed to join room. Please check the room ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!roomName.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const newRoomId = await onCreateRoom(roomName.trim(), username.trim());
      await onJoinRoom(newRoomId, username.trim(), selectedColor);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">🎨 Collaborative Whiteboard</h1>
          <p className="text-sm text-gray-500">Draw together in real-time</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('join'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'join' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => { setMode('create'); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Create Room
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {mode === 'join' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={40}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Your Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === c ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            onClick={mode === 'join' ? handleJoin : handleCreate}
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {mode === 'join' ? 'Joining...' : 'Creating...'}
              </span>
            ) : (
              mode === 'join' ? 'Join Room' : 'Create Room'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPanel;
