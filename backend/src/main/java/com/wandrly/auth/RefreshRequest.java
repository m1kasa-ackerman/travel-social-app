package com.wandrly.auth;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
