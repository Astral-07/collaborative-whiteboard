package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomState {
    private String roomId;
    private String roomName;
    private List<WhiteboardElement> elements;
    private Set<String> activeUsers;
    private Map<String, UserCursor> userCursors;
    private String backgroundColor;
    private String currentUserId;
}
