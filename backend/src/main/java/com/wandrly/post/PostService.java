package com.wandrly.post;

import com.wandrly.exception.ForbiddenException;
import com.wandrly.exception.ResourceNotFoundException;
import com.wandrly.social.Save;
import com.wandrly.social.SaveRepository;
import com.wandrly.user.User;
import com.wandrly.user.UserRepository;
import com.wandrly.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SaveRepository saveRepository;
    private final InputSanitizer sanitizer;

    @Transactional
    public PostResponse createPost(User user, CreatePostRequest request) {
        String sanitizedTitle = sanitizer.sanitizePlainText(request.getTitle());
        String sanitizedBody = sanitizer.sanitizeHtml(request.getBody());

        Post post = Post.builder()
                .userId(user.getId())
                .type(request.getType())
                .title(sanitizedTitle)
                .body(sanitizedBody)
                .coverImageUrl(request.getCoverImageUrl())
                .destination(sanitizer.sanitizePlainText(request.getDestination()))
                .visibility(request.getVisibility())
                .status(request.getStatus())
                .build();

        Post saved = postRepository.save(post);

        // Save tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<Tag> tags = request.getTags().stream()
                    .map(t -> Tag.builder()
                            .postId(saved.getId())
                            .tagName(sanitizer.sanitizePlainText(t.toLowerCase()))
                            .build())
                    .toList();
            saved.setTags(tags);
            postRepository.save(saved);
        }

        return toResponse(saved, user.getId());
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return toResponse(post, null);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(User user, String filter, Pageable pageable) {
        Page<Post> posts = switch (filter) {
            case "following" -> postRepository.findFollowingFeed(user.getId(), pageable);
            case "trending" -> postRepository.findTrending(pageable);
            default -> postRepository.findByVisibilityAndStatus(
                    "public", "published", pageable);
        };
        return posts.map(p -> toResponse(p, user.getId()));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> explorePublic(String type, String destination, Pageable pageable) {
        return postRepository.explorePublic(
                type, destination, pageable)
                .map(p -> toResponse(p, null));
    }

    @Transactional
    public void deletePost(User user, UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        if (!post.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only delete your own posts");
        }
        postRepository.delete(post);
    }

    @Transactional
    public boolean toggleSave(User user, UUID postId) {
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Optional<Save> existingSave = saveRepository.findByUserIdAndPostId(user.getId(), postId);

        if (existingSave.isPresent()) {
            saveRepository.delete(existingSave.get());
            postRepository.decrementSaveCount(postId);
            return false;
        } else {
            saveRepository.save(Save.builder()
                    .userId(user.getId())
                    .postId(postId)
                    .build());
            postRepository.incrementSaveCount(postId);
            return true;
        }
    }

    private PostResponse toResponse(Post post, UUID currentUserId) {
        User author = userRepository.findById(post.getUserId()).orElse(null);
        boolean saved = currentUserId != null
                && saveRepository.existsByUserIdAndPostId(currentUserId, post.getId());

        return PostResponse.builder()
                .id(post.getId().toString())
                .type(post.getType())
                .title(post.getTitle())
                .body(post.getBody())
                .coverImageUrl(post.getCoverImageUrl())
                .destination(post.getDestination())
                .visibility(post.getVisibility())
                .status(post.getStatus())
                .saveCount(post.getSaveCount())
                .savedByCurrentUser(saved)
                .tags(post.getTags() != null
                        ? post.getTags().stream().map(Tag::getTagName).toList()
                        : List.of())
                .createdAt(post.getCreatedAt())
                .authorId(author != null ? author.getId().toString() : null)
                .authorUsername(author != null ? author.getHandle() : null)
                .authorDisplayName(author != null ? author.getDisplayName() : null)
                .authorAvatarUrl(author != null ? author.getAvatarUrl() : null)
                .build();
    }
}
