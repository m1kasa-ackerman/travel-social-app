package com.wandrly.post;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private String id;
    private String type;
    private String title;
    private String body;
    private String coverImageUrl;
    private String destination;
    private String visibility;
    private String status;
    private int saveCount;
    private boolean savedByCurrentUser;
    private List<String> tags;
    private LocalDateTime createdAt;

    // Author info
    private String authorId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorAvatarUrl;
}
