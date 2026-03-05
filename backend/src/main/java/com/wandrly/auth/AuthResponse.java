package com.wandrly.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String email;

    @Builder.Default
    private String tokenType_ = "Bearer";
}
