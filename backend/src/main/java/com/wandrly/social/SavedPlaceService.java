package com.wandrly.social;

import com.wandrly.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedPlaceService {

        private final SavedPlaceRepository savedPlaceRepository;

        public record SavePlaceRequest(
                        String name, String address, Double lat, Double lng, String type, String notes) {
        }

        public record SavedPlaceResponse(
                        String id, String name, String address,
                        Double lat, Double lng, String type, String notes, String savedAt) {
        }

        @Transactional(readOnly = true)
        public List<SavedPlaceResponse> listSavedPlaces(User user) {
                return savedPlaceRepository.findByUserOrderBySavedAtDesc(user)
                                .stream().map(this::toResponse).toList();
        }

        @Transactional
        public SavedPlaceResponse savePlace(User user, SavePlaceRequest req) {
                // Toggle: if same place already saved, remove it
                savedPlaceRepository.findByUserOrderBySavedAtDesc(user)
                                .stream()
                                .filter(p -> p.getName().equalsIgnoreCase(req.name()))
                                .findFirst()
                                .ifPresent(savedPlaceRepository::delete);

                SavedPlace place = SavedPlace.builder()
                                .user(user)
                                .name(req.name())
                                .address(req.address())
                                .lat(req.lat())
                                .lng(req.lng())
                                .type(req.type())
                                .notes(req.notes())
                                .build();
                return toResponse(savedPlaceRepository.save(place));
        }

        @Transactional
        public void deletePlace(User user, String id) {
                savedPlaceRepository.deleteByUserAndId(user, id);
        }

        private SavedPlaceResponse toResponse(SavedPlace p) {
                return new SavedPlaceResponse(
                                p.getId(), p.getName(), p.getAddress(),
                                p.getLat(), p.getLng(), p.getType(),
                                p.getNotes(), p.getSavedAt().toString());
        }
}
