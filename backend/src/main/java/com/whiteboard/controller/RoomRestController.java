package com.whiteboard.controller;

import com.whiteboard.model.Room;
import com.whiteboard.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"https://collaborative-whiteboard-eosin-one.vercel.app/", "http://localhost:3000"})
public class RoomRestController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRoom(@RequestBody Map<String, String> request) {
        String name = request.getOrDefault("name", "Untitled Room");
        String createdBy = request.getOrDefault("createdBy", "anonymous");
        Room room = roomService.createRoom(name, createdBy);

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", room.getId());
        response.put("name", room.getName());
        response.put("createdAt", room.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoom(@PathVariable String roomId) {
        Room room = roomService.getRoom(roomId);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roomId", room.getId());
        response.put("name", room.getName());
        response.put("activeUsers", room.getActiveUsers().size());
        response.put("elementCount", room.getElements().size());
        return ResponseEntity.ok(response);
    }
}
