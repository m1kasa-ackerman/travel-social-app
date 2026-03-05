package com.wandrly.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String coverUrl;
    private String bio;
    private String location;
    private long followersCount;
    private long followingCount;
    private long postsCount;
}
