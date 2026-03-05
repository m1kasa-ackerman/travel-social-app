package com.wandrly.social;

import com.wandrly.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "saved_places", indexes = {
        @Index(name = "idx_savedplace_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String address;

    private Double lat;
    private Double lng;

    @Column(length = 50)
    private String type; // restaurant, attraction, hotel, etc.

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant savedAt = Instant.now();

    @PrePersist
    void prePersist() {
        savedAt = Instant.now();
    }
}
