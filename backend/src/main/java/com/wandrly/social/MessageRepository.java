package com.wandrly.social;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("SELECT m FROM Message m JOIN FETCH m.sender " +
            "WHERE m.conversation.id = :convId ORDER BY m.sentAt ASC")
    Page<Message> findByConversationId(@Param("convId") String convId, Pageable pageable);

    long countByConversationIdAndReadAtIsNull(String conversationId);
}
