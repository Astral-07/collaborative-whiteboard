import React from 'react';
import { UserCursor } from '../types';

interface UserCursorsProps {
  cursors: Record<string, UserCursor>;
  currentUserId: string;
}

const UserCursors: React.FC<UserCursorsProps> = ({ cursors, currentUserId }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {Object.values(cursors).map((cursor) => {
        if (cursor.userId === currentUserId) return null;
        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <div
              className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: cursor.color,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              {cursor.username}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserCursors;
