package com.whiteboard.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhiteboardElement {
    private String id;
    private String type; // pencil, rectangle, circle, line, text, eraser
    private List<Point> points;
    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private String strokeColor;
    private Integer strokeWidth;
    private Double opacity;
    private String text;
    private String font;
    private Boolean isDeleted;
    private String createdBy;
    private Long timestamp;
    private Map<String, Object> metadata;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Point {
        private Double x;
        private Double y;
    }
}
