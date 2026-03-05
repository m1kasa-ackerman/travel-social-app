package com.wandrly.social;

import com.wandrly.exception.ResourceNotFoundException;
import com.wandrly.post.Post;
import com.wandrly.post.PostRepository;
import com.wandrly.user.User;
import com.wandrly.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public record CommentRequest(String body, String parentId) {
    }

    public record CommentResponse(
            String id, String body,
            String authorId, String authorUsername, String authorDisplayName, String authorAvatarUrl,
            String parentId, String createdAt) {
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getComments(String postId, Pageable pageable) {
        Page<Comment> page = commentRepository.findByPostId(postId, pageable);
        List<CommentResponse> responses = page.getContent().stream()
                .map(this::toResponse).toList();
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @Transactional
    public CommentResponse addComment(User user, String postId, CommentRequest req) {
        Post post = postRepository.findById(UUID.fromString(postId))
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Comment parent = null;
        if (req.parentId() != null) {
            parent = commentRepository.findById(req.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .body(req.body())
                .post(post)
                .author(user)
                .parent(parent)
                .build();

        return toResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(User user, String commentId) {
        Comment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (!c.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not allowed");
        }
        commentRepository.delete(c);
    }

    private CommentResponse toResponse(Comment c) {
        User a = c.getAuthor();
        return new CommentResponse(
                c.getId(), c.getBody(),
                a.getId().toString(), a.getHandle(), a.getDisplayName(), a.getAvatarUrl(),
                c.getParent() != null ? c.getParent().getId() : null,
                c.getCreatedAt().toString());
    }
}
