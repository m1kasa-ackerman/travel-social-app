package com.wandrly.social;

import com.wandrly.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedPlaceRepository extends JpaRepository<SavedPlace, String> {
    List<SavedPlace> findByUserOrderBySavedAtDesc(User user);

    boolean existsByUserAndName(User user, String name);

    void deleteByUserAndId(User user, String id);
}
