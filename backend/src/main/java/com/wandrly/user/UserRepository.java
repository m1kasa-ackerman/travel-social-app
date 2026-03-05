package com.wandrly.user;

import com.wandrly.social.Follow; // JPQL: FROM Follow
import com.wandrly.post.Post; // JPQL: FROM Post
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followingId = :userId")
    long countFollowers(UUID userId);

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.followerId = :userId")
    long countFollowing(UUID userId);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.userId = :userId AND p.status = 'published'")
    long countPosts(UUID userId);
}
