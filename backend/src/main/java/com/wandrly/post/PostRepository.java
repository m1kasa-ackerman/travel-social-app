package com.wandrly.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

        // Posts by a specific user
        Page<Post> findByUserIdAndStatusOrderByCreatedAtDesc(
                        UUID userId, String status, Pageable pageable);

        // Public explore — filter by type and/or destination
        Page<Post> findByVisibilityAndStatus(String visibility, String status, Pageable pageable);

        @Query(value = "SELECT * FROM posts p WHERE p.visibility = 'public' AND p.status = 'published'" +
                        " AND (CAST(:type AS text) IS NULL OR p.type = CAST(:type AS text))" +
                        " AND (CAST(:destination AS text) IS NULL OR p.destination ILIKE CONCAT('%', CAST(:destination AS text), '%'))"
                        +
                        " ORDER BY p.created_at DESC", countQuery = "SELECT count(*) FROM posts p WHERE p.visibility = 'public' AND p.status = 'published'"
                                        +
                                        " AND (CAST(:type AS text) IS NULL OR p.type = CAST(:type AS text))" +
                                        " AND (CAST(:destination AS text) IS NULL OR p.destination ILIKE CONCAT('%', CAST(:destination AS text), '%'))", nativeQuery = true)
        Page<Post> explorePublic(
                        @Param("type") String type,
                        @Param("destination") String destination,
                        Pageable pageable);

        // For You feed — posts from users the current user follows + trending
        @Query("SELECT p FROM Post p WHERE p.visibility = 'public' AND p.status = 'published'" +
                        " AND p.userId IN (" +
                        "   SELECT f.followingId FROM Follow f WHERE f.followerId = :userId" +
                        " ) ORDER BY p.createdAt DESC")
        Page<Post> findFollowingFeed(@Param("userId") UUID userId, Pageable pageable);

        // Trending — most saves in last 7 days
        @Query("SELECT p FROM Post p WHERE p.visibility = 'public' AND p.status = 'published'" +
                        " ORDER BY p.saveCount DESC, p.createdAt DESC")
        Page<Post> findTrending(Pageable pageable);

        @Modifying
        @Query("UPDATE Post p SET p.saveCount = p.saveCount + 1 WHERE p.id = :id")
        void incrementSaveCount(@Param("id") UUID id);

        @Modifying
        @Query("UPDATE Post p SET p.saveCount = p.saveCount - 1 WHERE p.id = :id AND p.saveCount > 0")
        void decrementSaveCount(@Param("id") UUID id);

        List<Post> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);
}
