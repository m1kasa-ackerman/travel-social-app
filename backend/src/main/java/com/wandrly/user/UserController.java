package com.wandrly.user;

import com.wandrly.auth.UserProfileResponse;
import com.wandrly.exception.ResourceNotFoundException;
import com.wandrly.social.Follow;
import com.wandrly.social.FollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getProfile(
            @PathVariable String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + username));
        return ResponseEntity.ok(buildProfileResponse(user));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<Map<String, Boolean>> toggleFollow(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String username) {

        User target = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + username));

        if (target.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        Optional<Follow> existing = followRepository
                .findByFollowerIdAndFollowingId(currentUser.getId(), target.getId());

        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("following", false));
        } else {
            followRepository.save(Follow.builder()
                    .followerId(currentUser.getId())
                    .followingId(target.getId())
                    .build());
            return ResponseEntity.ok(Map.of("following", true));
        }
    }

    private UserProfileResponse buildProfileResponse(User user) {
        long followers = userRepository.countFollowers(user.getId());
        long following = userRepository.countFollowing(user.getId());
        long posts = userRepository.countPosts(user.getId());

        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .username(user.getHandle())
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
}
