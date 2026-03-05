package com.wandrly.social;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedPlaceRepository extends JpaRepository<SavedPlace, String> {
    List<SavedPlace> findByUserIdOrderBySavedAtDesc(String userId);

    boolean existsByUserIdAndName(String userId, String name);

    void deleteByUserIdAndId(String userId, String id);
}
