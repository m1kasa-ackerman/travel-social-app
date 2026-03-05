package com.wandrly.post;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.wandrly.user.User;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "forYou") String filter,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(postService.getFeed(user, filter, pageable));
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreatePostRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(postService.createPost(user, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getPost(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        postService.deletePost(user, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<Map<String, Boolean>> toggleSave(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        boolean saved = postService.toggleSave(user, id);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    @GetMapping("/public/explore")
    public ResponseEntity<Page<PostResponse>> explorePublic(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String destination,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(
                postService.explorePublic(type, destination, pageable));
    }
}
