package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCursor {
    private String userId;
    private String username;
    private String color;
    private Double x;
    private Double y;
    private String roomId;
    private Long timestamp;
}
