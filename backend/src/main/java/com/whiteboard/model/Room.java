package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    private String id;
    private String name;
    private String createdBy;
    private Long createdAt;
    private List<WhiteboardElement> elements;
    private Set<String> activeUsers;
    private Map<String, UserCursor> userCursors;
    private String backgroundColor;

    public static Room create(String id, String name, String createdBy) {
        return Room.builder()
                .id(id)
                .name(name)
                .createdBy(createdBy)
                .createdAt(System.currentTimeMillis())
                .elements(new CopyOnWriteArrayList<>())
                .activeUsers(ConcurrentHashMap.newKeySet())
                .userCursors(new ConcurrentHashMap<>())
                .backgroundColor("#ffffff")
                .build();
    }
}
