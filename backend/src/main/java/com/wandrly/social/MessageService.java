package com.wandrly.social;

import com.wandrly.user.User;
import com.wandrly.user.UserRepository;
import com.wandrly.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepo;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;

    // ----------- DTOs -----------
    public record ConversationSummary(
            String id, String status,
            String otherUserId, String otherUsername, String otherDisplayName, String otherAvatarUrl,
            String lastMessage, String lastMessageAt, long unreadCount, boolean isRequester) {
    }

    public record MessageResponse(
            String id, String body,
            String senderId, String senderUsername,
            String sentAt, boolean readByMe) {
    }

    // ----------- Start / request a DM -----------
    @Transactional
    public ConversationSummary startConversation(User requester, String recipientUsername) {
        User recipient = userRepo.findByUsername(recipientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Return existing conversation if already exists
        return conversationRepo.findBetween(
                requester.getId(), recipient.getId())
                .map(c -> toSummary(c, requester))
                .orElseGet(() -> {
                    Conversation c = Conversation.builder()
                            .requester(requester)
                            .recipient(recipient)
                            .status(Conversation.ConversationStatus.PENDING)
                            .build();
                    return toSummary(conversationRepo.save(c), requester);
                });
    }

    // ----------- Accept / decline a DM request -----------
    @Transactional
    public ConversationSummary respondToRequest(User user, String convId, boolean accept) {
        Conversation c = conversationRepo.findById(convId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        // Only the recipient can respond
        if (!c.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorised to respond");
        }
        if (c.getStatus() != Conversation.ConversationStatus.PENDING) {
            throw new RuntimeException("Request already handled");
        }
        c.setStatus(accept
                ? Conversation.ConversationStatus.ACCEPTED
                : Conversation.ConversationStatus.DECLINED);
        return toSummary(conversationRepo.save(c), user);
    }

    // ----------- List my conversations -----------
    @Transactional(readOnly = true)
    public Page<ConversationSummary> listConversations(User user, Pageable pageable) {
        Page<Conversation> page = conversationRepo.findAllByUserId(user.getId(), pageable);
        List<ConversationSummary> content = page.getContent().stream()
                .map(c -> toSummary(c, user)).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    // ----------- Get messages in a conversation -----------
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessages(User user, String convId, Pageable pageable) {
        Conversation c = conversationRepo.findById(convId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!isParticipant(c, user))
            throw new RuntimeException("Not a participant");
        if (c.getStatus() != Conversation.ConversationStatus.ACCEPTED) {
            throw new RuntimeException("Conversation not accepted yet");
        }
        Page<Message> page = messageRepo.findByConversationId(convId, pageable);
        List<MessageResponse> content = page.getContent().stream()
                .map(m -> toMsgResp(m, user)).toList();
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    // ----------- Send message -----------
    @Transactional
    public MessageResponse sendMessage(User user, String convId, String body) {
        Conversation c = conversationRepo.findById(convId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!isParticipant(c, user))
            throw new RuntimeException("Not a participant");
        if (c.getStatus() != Conversation.ConversationStatus.ACCEPTED) {
            throw new RuntimeException("Conversation not accepted yet");
        }
        Message msg = Message.builder()
                .conversation(c)
                .sender(user)
                .body(body)
                .build();
        Message saved = messageRepo.save(msg);
        c.setLastMessageAt(Instant.now());
        conversationRepo.save(c);
        return toMsgResp(saved, user);
    }

    // ----------- helpers -----------
    private boolean isParticipant(Conversation c, User user) {
        return c.getRequester().getId().equals(user.getId())
                || c.getRecipient().getId().equals(user.getId());
    }

    private ConversationSummary toSummary(Conversation c, User me) {
        boolean isRequester = c.getRequester().getId().equals(me.getId());
        User other = isRequester ? c.getRecipient() : c.getRequester();
        long unread = c.getId() != null
                ? messageRepo.countByConversationIdAndReadAtIsNull(c.getId())
                : 0;
        return new ConversationSummary(
                c.getId(), c.getStatus().name(),
                other.getId().toString(), other.getHandle(),
                other.getDisplayName(), other.getAvatarUrl(),
                null, c.getLastMessageAt() != null ? c.getLastMessageAt().toString() : null,
                unread, isRequester);
    }

    private MessageResponse toMsgResp(Message m, User me) {
        return new MessageResponse(
                m.getId(), m.getBody(),
                m.getSender().getId().toString(), m.getSender().getHandle(),
                m.getSentAt().toString(),
                !m.getSender().getId().equals(me.getId()) && m.getReadAt() != null);
    }
}
