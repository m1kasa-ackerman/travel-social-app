package com.wandrly.social;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

        @Query("SELECT c FROM Conversation c " +
                        "JOIN FETCH c.requester JOIN FETCH c.recipient " +
                        "WHERE c.requester.id = :userId OR c.recipient.id = :userId " +
                        "ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
        Page<Conversation> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

        @Query("SELECT c FROM Conversation c " +
                        "WHERE (c.requester.id = :uid1 AND c.recipient.id = :uid2) " +
                        "OR    (c.requester.id = :uid2 AND c.recipient.id = :uid1)")
        Optional<Conversation> findBetween(@Param("uid1") UUID uid1, @Param("uid2") UUID uid2);
}
