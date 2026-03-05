package com.wandrly.auth;

import com.wandrly.security.JwtService;
import com.wandrly.user.User;
import com.wandrly.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Duplicate checks
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername().toLowerCase())) {
            throw new IllegalArgumentException("Username already taken");
        }

        // Server-side password strength validation
        validatePasswordStrength(request.getPassword());

        User user = User.builder()
                .username(request.getUsername().toLowerCase().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName().trim())
                .isActive(true)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getHandle())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        // Check lockout
        if (user.getLockoutUntil() != null
                && LocalDateTime.now().isBefore(user.getLockoutUntil())) {
            throw new LockedException("Account locked until " + user.getLockoutUntil());
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
        } catch (BadCredentialsException e) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_ATTEMPTS) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid credentials");
        }

        // Success — reset lockout state
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getHandle())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        // Simple stateless re-issue: validate existing JWT, issue new one
        // For full refresh token rotation, implement RefreshToken entity
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        String newToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(newToken)
                .tokenType("Bearer")
                .username(user.getHandle())
                .displayName(user.getDisplayName())
                .build();
    }

    public void logout(String refreshToken) {
        // With stateless JWT, logout is client-side (clear localStorage).
        // Implement token blacklist / RefreshToken table for full revocation.
    }

    public UserProfileResponse getProfile(User user) {
        long followers = userRepository.countFollowers(user.getId());
        long following = userRepository.countFollowing(user.getId());
        long posts = userRepository.countPosts(user.getId());

        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .username(user.getHandle())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .followersCount(followers)
                .followingCount(following)
                .postsCount(posts)
                .build();
    }

    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }
}
