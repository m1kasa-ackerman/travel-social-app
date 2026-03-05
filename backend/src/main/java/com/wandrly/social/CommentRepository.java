package com.wandrly.social;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, String> {

    @Query("SELECT c FROM Comment c " +
            "JOIN FETCH c.author " +
            "LEFT JOIN FETCH c.parent " +
            "WHERE c.post.id = :postId " +
            "ORDER BY c.createdAt ASC")
    Page<Comment> findByPostId(@Param("postId") String postId, Pageable pageable);

    long countByPostId(String postId);
}
