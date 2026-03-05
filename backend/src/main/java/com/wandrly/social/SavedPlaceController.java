package com.wandrly.social;

import com.wandrly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class SavedPlaceController {

    private final SavedPlaceService savedPlaceService;

    @GetMapping
    public ResponseEntity<List<SavedPlaceService.SavedPlaceResponse>> list(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(savedPlaceService.listSavedPlaces(user));
    }

    @PostMapping
    public ResponseEntity<SavedPlaceService.SavedPlaceResponse> save(
            @AuthenticationPrincipal User user,
            @RequestBody SavedPlaceService.SavePlaceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedPlaceService.savePlace(user, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {
        savedPlaceService.deletePlace(user, id);
        return ResponseEntity.noContent().build();
    }
}
