package com.whiteboard.controller;

import com.whiteboard.model.*;
import com.whiteboard.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WhiteboardController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/room.join")
    public void joinRoom(@Payload JoinRoomRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        RoomState state = roomService.joinRoom(
                request.getRoomId(), 
                request.getUsername(), 
                request.getUserColor(), 
                sessionId
        );

        headerAccessor.getSessionAttributes().put("roomId", request.getRoomId());
        headerAccessor.getSessionAttributes().put("userId", state.getCurrentUserId());

        // Send room state to joining user
        messagingTemplate.convertAndSendToUser(
                sessionId, 
                "/queue/room.state", 
                state,
                headerAccessor.getMessageHeaders()
        );

        // Notify others about new user
        broadcastUserJoined(request.getRoomId(), state.getCurrentUserId(), state.getUserCursors().get(state.getCurrentUserId()));
    }

    @MessageMapping("/room.leave")
    public void leaveRoom(SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        String userId = roomService.getUserIdBySession(sessionId);
        String roomId = roomService.getRoomIdByUser(userId);

        if (roomId != null) {
            roomService.leaveRoom(sessionId);
            messagingTemplate.convertAndSend("/topic/room." + roomId + ".users", Map.of(
                    "type", "USER_LEFT",
                    "userId", userId
            ));
        }
    }

    @MessageMapping("/draw")
    public void handleDraw(@Payload DrawingAction action, SimpMessageHeaderAccessor headerAccessor) {
        String userId = roomService.getUserIdBySession(headerAccessor.getSessionId());
        if (userId == null) return;

        action.setUserId(userId);
        action.setTimestamp(System.currentTimeMillis());
        action.setActionId(UUID.randomUUID().toString());

        String roomId = action.getRoomId();

        switch (action.getType()) {
            case "DRAW":
            case "CREATE":
                if (action.getElement() != null) {
                    roomService.addElement(roomId, action.getElement());
                }
                break;
            case "UPDATE":
                if (action.getElement() != null) {
                    roomService.updateElement(roomId, action.getElement());
                }
                break;
            case "DELETE":
                if (action.getElement() != null) {
                    roomService.deleteElement(roomId, action.getElement().getId());
                }
                break;
            case "CLEAR":
                roomService.clearRoom(roomId);
                break;
        }

        // Broadcast to all users in the room except sender
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".draw", action);
    }

    @MessageMapping("/cursor.move")
    public void handleCursorMove(@Payload UserCursor cursor, SimpMessageHeaderAccessor headerAccessor) {
        String userId = roomService.getUserIdBySession(headerAccessor.getSessionId());
        if (userId == null) return;

        roomService.updateCursor(userId, cursor.getX(), cursor.getY());
        String roomId = roomService.getRoomIdByUser(userId);

        if (roomId != null) {
            cursor.setUserId(userId);
            cursor.setRoomId(roomId);
            cursor.setTimestamp(System.currentTimeMillis());
            messagingTemplate.convertAndSend("/topic/room." + roomId + ".cursors", cursor);
        }
    }

    @MessageMapping("/elements.request")
    public void requestAllElements(@Payload Map<String, String> payload, SimpMessageHeaderAccessor headerAccessor) {
        String roomId = payload.get("roomId");
        String sessionId = headerAccessor.getSessionId();
        Room room = roomService.getRoom(roomId);

        if (room != null) {
            messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/room.elements",
                    room.getElements()
            );
        }
    }

    private void broadcastUserJoined(String roomId, String userId, UserCursor cursor) {
        messagingTemplate.convertAndSend("/topic/room." + roomId + ".users", Map.of(
                "type", "USER_JOINED",
                "userId", userId,
                "cursor", cursor
        ));
    }
}
