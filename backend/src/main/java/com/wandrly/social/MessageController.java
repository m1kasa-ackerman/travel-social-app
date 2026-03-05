package com.wandrly.social;

import com.wandrly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** List all conversations for the current user */
    @GetMapping
    public ResponseEntity<Page<MessageService.ConversationSummary>> listConversations(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(messageService.listConversations(user, pageable));
    }

    /** Start a new DM (creates a PENDING request to the other user) */
    @PostMapping("/start")
    public ResponseEntity<MessageService.ConversationSummary> start(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.startConversation(user, body.get("username")));
    }

    /** Accept or decline a DM request */
    @PostMapping("/{convId}/respond")
    public ResponseEntity<MessageService.ConversationSummary> respond(
            @AuthenticationPrincipal User user,
            @PathVariable String convId,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(
                messageService.respondToRequest(user, convId, body.get("accept")));
    }

    /** Get messages in an accepted conversation */
    @GetMapping("/{convId}/messages")
    public ResponseEntity<Page<MessageService.MessageResponse>> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable String convId,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(messageService.getMessages(user, convId, pageable));
    }

    /** Send a message */
    @PostMapping("/{convId}/messages")
    public ResponseEntity<MessageService.MessageResponse> sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable String convId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(user, convId, body.get("body")));
    }
}
