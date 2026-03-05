package com.wandrly.social;

import com.wandrly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<Page<CommentService.CommentResponse>> list(
            @PathVariable String postId,
            Pageable pageable) {
        return ResponseEntity.ok(commentService.getComments(postId, pageable));
    }

    @PostMapping
    public ResponseEntity<CommentService.CommentResponse> create(
            @AuthenticationPrincipal User user,
            @PathVariable String postId,
            @RequestBody CommentService.CommentRequest req) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(commentService.addComment(user, postId, req));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable String commentId,
            @PathVariable String postId) {
        commentService.deleteComment(user, commentId);
        return ResponseEntity.noContent().build();
    }
}
