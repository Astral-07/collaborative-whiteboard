package com.whiteboard.service;

import com.whiteboard.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RoomService {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> userRoomMap = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUserMap = new ConcurrentHashMap<>();

    public Room createRoom(String name, String createdBy) {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        Room room = Room.create(roomId, name, createdBy);
        rooms.put(roomId, room);
        log.info("Room created: {} by {}", roomId, createdBy);
        return room;
    }

    public Room getRoom(String roomId) {
        return rooms.get(roomId);
    }

    public RoomState joinRoom(String roomId, String username, String userColor, String sessionId) {
        Room room = rooms.computeIfAbsent(roomId, id -> Room.create(id, "Untitled Room", "anonymous"));
        String userId = UUID.randomUUID().toString().substring(0, 8);

        room.getActiveUsers().add(userId);
        userRoomMap.put(userId, roomId);
        sessionUserMap.put(sessionId, userId);

        room.getUserCursors().put(userId, UserCursor.builder()
                .userId(userId)
                .username(username != null ? username : "User " + userId.substring(0, 4))
                .color(userColor != null ? userColor : generateUserColor())
                .x(0.0)
                .y(0.0)
                .roomId(roomId)
                .timestamp(System.currentTimeMillis())
                .build());

        log.info("User {} joined room {}", userId, roomId);

        return RoomState.builder()
                .roomId(room.getId())
                .roomName(room.getName())
                .elements(room.getElements())
                .activeUsers(room.getActiveUsers())
                .userCursors(room.getUserCursors())
                .backgroundColor(room.getBackgroundColor())
                .currentUserId(userId)
                .build();
    }

    public void leaveRoom(String sessionId) {
        String userId = sessionUserMap.remove(sessionId);
        if (userId == null) return;

        String roomId = userRoomMap.remove(userId);
        if (roomId == null) return;

        Room room = rooms.get(roomId);
        if (room != null) {
            room.getActiveUsers().remove(userId);
            room.getUserCursors().remove(userId);
            log.info("User {} left room {}", userId, roomId);

            if (room.getActiveUsers().isEmpty() && room.getElements().isEmpty()) {
                rooms.remove(roomId);
                log.info("Room {} removed (empty)", roomId);
            }
        }
    }

    public String getUserIdBySession(String sessionId) {
        return sessionUserMap.get(sessionId);
    }

    public String getRoomIdByUser(String userId) {
        return userRoomMap.get(userId);
    }

    public void addElement(String roomId, WhiteboardElement element) {
        Room room = rooms.get(roomId);
        if (room != null) {
            room.getElements().add(element);
        }
    }

    public void updateElement(String roomId, WhiteboardElement element) {
        Room room = rooms.get(roomId);
        if (room == null) return;

        for (int i = 0; i < room.getElements().size(); i++) {
            if (room.getElements().get(i).getId().equals(element.getId())) {
                room.getElements().set(i, element);
                return;
            }
        }
    }

    public void deleteElement(String roomId, String elementId) {
        Room room = rooms.get(roomId);
        if (room != null) {
            room.getElements().removeIf(e -> e.getId().equals(elementId));
        }
    }

    public void clearRoom(String roomId) {
        Room room = rooms.get(roomId);
        if (room != null) {
            room.getElements().clear();
        }
    }

    public void updateCursor(String userId, Double x, Double y) {
        String roomId = userRoomMap.get(userId);
        if (roomId == null) return;

        Room room = rooms.get(roomId);
        if (room == null) return;

        UserCursor cursor = room.getUserCursors().get(userId);
        if (cursor != null) {
            cursor.setX(x);
            cursor.setY(y);
            cursor.setTimestamp(System.currentTimeMillis());
        }
    }

    public List<Room> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    private String generateUserColor() {
        String[] colors = {"#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
                           "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"};
        return colors[(int) (Math.random() * colors.length)];
    }
}
