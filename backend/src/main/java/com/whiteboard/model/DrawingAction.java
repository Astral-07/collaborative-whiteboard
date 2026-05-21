package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawingAction {
    private String type; // DRAW, UPDATE, DELETE, CLEAR, UNDO, REDO
    private String roomId;
    private String userId;
    private String username;
    private String userColor;
    private WhiteboardElement element;
    private Long timestamp;
    private String actionId;
}
